import * as core from '@actions/core'
import {spawn} from 'child_process'

export interface CopilotInferenceRequest {
  messages: Array<{role: 'system' | 'user' | 'assistant' | 'tool'; content: string}>
  model: string
  cliPath?: string
  allowTools?: string[]
}

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

  // -s (silent): suppress session metadata so stdout is the model response only.
  // --no-ask-user: never block on clarifying questions in CI.
  // No --allow-tool flags are passed by default, so Copilot is denied permission
  // to use shell, write, fetch, etc. unless the consumer opts in via copilot-allow-tools.
  const args = ['-p', fullPrompt, '-s', '--no-ask-user']

  if (request.model && request.model.trim() !== '') {
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

  // Mask the Copilot token if it's set, so any accidental echo into stdout/
  // stderr/debug logs from the CLI gets ***-ified by the runner.
  const copilotToken = process.env['COPILOT_GITHUB_TOKEN'] || process.env['GH_TOKEN'] || process.env['GITHUB_TOKEN']
  if (copilotToken) {
    core.setSecret(copilotToken)
  }

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

  // Stderr may contain prompt content, file paths, or other context. Only emit
  // it to debug logs (opt-in via ACTIONS_STEP_DEBUG) to avoid leaking it into
  // every workflow log. The error path also intentionally omits stderr.
  if (result.stderr.trim()) {
    core.debug(`Copilot CLI stderr: ${result.stderr}`)
  }

  if (result.exitCode !== 0) {
    throw new Error(
      `Copilot CLI exited with code ${result.exitCode}. Re-run the workflow with ACTIONS_STEP_DEBUG=true to see the CLI's stderr output.`,
    )
  }

  const response = result.stdout.trim()
  return response.length > 0 ? response : null
}
