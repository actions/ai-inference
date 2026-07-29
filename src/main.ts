import * as core from '@actions/core'
import * as fs from 'fs'
import * as tmp from 'tmp'
import {copilotInference} from './copilot.js'
import {loadContentFromFileOrInput, buildMessages, safeExit} from './helpers.js'
import {
  loadPromptFile,
  parseTemplateVariables,
  isPromptYamlFile,
  PromptConfig,
  parseFileTemplateVariables,
} from './prompt.js'

const SUPPORTED_PROVIDERS = ['copilot'] as const
type Provider = (typeof SUPPORTED_PROVIDERS)[number]

function parseProvider(value: string): Provider {
  const normalized = (value || '').trim().toLowerCase()
  if (normalized === '' || normalized === 'copilot') return 'copilot'
  throw new Error(`Unsupported provider "${value}" (expected one of: ${SUPPORTED_PROVIDERS.join(', ')})`)
}

function parseAllowTools(input: string): string[] {
  if (!input) return []
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const promptFilePath = core.getInput('prompt-file')
    const inputVariables = core.getInput('input')
    const fileInputVariables = core.getInput('file_input')

    let promptConfig: PromptConfig | undefined = undefined
    let systemPrompt: string | undefined = undefined
    let prompt: string | undefined = undefined

    // Check if we're using a prompt YAML file
    if (promptFilePath && isPromptYamlFile(promptFilePath)) {
      core.info('Using prompt YAML file format')

      // Parse template variables from both string inputs and file-based inputs
      const stringVars = parseTemplateVariables(inputVariables)
      const fileVars = parseFileTemplateVariables(fileInputVariables)
      const templateVariables = {...stringVars, ...fileVars}

      // Load and process prompt file
      promptConfig = loadPromptFile(promptFilePath, templateVariables)
    } else {
      // Use legacy format
      core.info('Using legacy prompt format')

      prompt = loadContentFromFileOrInput('prompt-file', 'prompt')
      systemPrompt = loadContentFromFileOrInput('system-prompt-file', 'system-prompt', 'You are a helpful assistant')
    }

    const modelName = promptConfig?.model || core.getInput('model')

    const token = process.env['GITHUB_TOKEN'] || core.getInput('token')
    if (token === undefined) {
      throw new Error('GITHUB_TOKEN is not set')
    }
    core.setSecret(token)

    // The provider input only accepts "copilot"; parseProvider throws on anything else.
    const provider = parseProvider(core.getInput('provider'))

    const messages = buildMessages(promptConfig, systemPrompt, prompt)

    let modelResponse: string | null = null

    if (provider === 'copilot') {
      modelResponse = await copilotInference({
        messages,
        model: modelName,
        cliPath: core.getInput('copilot-cli-path') || undefined,
        allowTools: parseAllowTools(core.getInput('copilot-allow-tools')),
      })
    }

    core.setOutput('response', modelResponse || '')

    // Create a temporary file for the response that persists for downstream steps.
    // We use keep: true to prevent automatic cleanup - the file will be cleaned up
    // by the runner when the job completes.
    const responseFile = tmp.fileSync({
      prefix: 'modelResponse-',
      postfix: '.txt',
      keep: true,
    })

    core.setOutput('response-file', responseFile.name)

    if (modelResponse && modelResponse !== '') {
      fs.writeFileSync(responseFile.name, modelResponse, 'utf-8')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`An unexpected error occurred: ${JSON.stringify(error, null, 2)}`)
    }
    await safeExit(1)
  }

  await safeExit(0)
}
