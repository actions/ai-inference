import * as core from '@actions/core'
import {spawn} from 'child_process'

export interface CopilotInferenceRequest {
  messages: Array<{role: 'system' | 'user' | 'assistant' | 'tool'; content: string}>
  model: string
  cliPath?: string
  allowTools?: string[]
}

// The action's default model is openai/gpt-4o, which is a GitHub Models identifier
// and not a valid Copilot CLI model. When the user hasn't overridden the model we
// omit --model and let Copilot choose its default.
export const DEFAULT_GITHUB_MODELS_MODEL = 'openai/gpt-4o'

interface RunResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

export type Spawner = (cmd: string, args: string[]) => Promise<RunResult>

function defaultSpawner(cmd: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']})
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('error', err => {
      reject(err)
    })
    child.on('close', exitCode => {
      resolve({stdout, stderr, exitCode})
    })
  })
}

/**
 * Builds the single prompt string passed to `copilot -p`, separating system and
 * conversation messages so the CLI sees them in a stable, well-labeled order.
 */
export function buildCopilotPrompt(messages: CopilotInferenceRequest['messages']): {
  systemMessage: string
  prompt: string
} {
  const systemParts: string[] = []
  const promptParts: string[] = []

  for (const msg of messages) {
    const content = (msg.content ?? '').trim()
    if (!content) continue

    const role = (msg.role || '').toLowerCase()
    if (role === 'system') {
      systemParts.push(content)
    } else if (role === '' || role === 'user') {
      promptParts.push(content)
    } else {
      promptParts.push(`${role.toUpperCase()}:\n${content}`)
    }
  }

  if (promptParts.length === 0) {
    throw new Error('No prompt configured for Copilot inference')
  }

  return {
    systemMessage: systemParts.join('\n\n'),
    prompt: promptParts.join('\n\n'),
  }
}

/**
 * Runs the GitHub Copilot CLI in programmatic mode and returns its stdout.
 *
 * The Copilot CLI must already be installed and authenticated on the runner.
 * See README for the recommended workflow setup.
 */
export async function copilotInference(
  request: CopilotInferenceRequest,
  spawner: Spawner = defaultSpawner,
): Promise<string | null> {
  const {systemMessage, prompt} = buildCopilotPrompt(request.messages)

  const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt

  const args = ['-p', fullPrompt, '--no-ask-user']

  // Only forward --model when the user explicitly picked something other than
  // the GitHub Models default (which is not a valid Copilot model).
  if (request.model && request.model !== DEFAULT_GITHUB_MODELS_MODEL) {
    args.push('--model', request.model)
  }

  for (const tool of request.allowTools ?? []) {
    const trimmed = tool.trim()
    if (trimmed) {
      args.push(`--allow-tool=${trimmed}`)
    }
  }

  const cmd = request.cliPath && request.cliPath.trim() !== '' ? request.cliPath : 'copilot'

  core.info(`Running Copilot CLI: ${cmd} -p <prompt> ${args.slice(2).join(' ')}`)

  let result: RunResult
  try {
    result = await spawner(cmd, args)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('ENOENT')) {
      throw new Error(
        `Copilot CLI not found (tried to spawn "${cmd}"). Install it with "npm install -g @github/copilot" and ensure COPILOT_GITHUB_TOKEN is set. See https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions for an example workflow.`,
      )
    }
    throw new Error(`Failed to spawn Copilot CLI: ${message}`)
  }

  if (result.stderr.trim()) {
    core.debug(`Copilot CLI stderr: ${result.stderr}`)
  }

  if (result.exitCode !== 0) {
    const stderrTail = result.stderr.trim().split('\n').slice(-10).join('\n')
    throw new Error(`Copilot CLI exited with code ${result.exitCode}: ${stderrTail || '(no stderr output)'}`)
  }

  const response = result.stdout.trim()
  return response.length > 0 ? response : null
}
