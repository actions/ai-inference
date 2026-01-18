import * as core from '@actions/core'
import * as fs from 'fs'
import * as tmp from 'tmp'
import {connectToGitHubMCP} from './mcp.js'
import {simpleInference, mcpInference} from './inference.js'
import {loadContentFromFileOrInput, buildInferenceRequest, parseCustomHeaders} from './helpers.js'
import {
  loadPromptFile,
  parseTemplateVariables,
  isPromptYamlFile,
  PromptConfig,
  parseFileTemplateVariables,
} from './prompt.js'

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

    // Get common parameters
    const modelName = promptConfig?.model || core.getInput('model')
    let maxTokens = promptConfig?.modelParameters?.maxTokens ?? core.getInput('max-tokens')

    if (typeof maxTokens === 'string') {
      maxTokens = parseInt(maxTokens, 10)
    }

    const token = process.env['GITHUB_TOKEN'] || core.getInput('token')
    if (token === undefined) {
      throw new Error('GITHUB_TOKEN is not set')
    }

    // Get GitHub MCP token (use dedicated token if provided, otherwise fall back to main token)
    const githubMcpToken = core.getInput('github-mcp-token') || token
    const githubMcpToolsets = core.getInput('github-mcp-toolsets')

    const endpoint = core.getInput('endpoint')

    // Parse custom headers
    const customHeadersInput = core.getInput('custom-headers')
    const customHeaders = parseCustomHeaders(customHeadersInput)

    // Build the inference request with pre-processed messages and response format
    const inferenceRequest = buildInferenceRequest(
      promptConfig,
      systemPrompt,
      prompt,
      modelName,
      promptConfig?.modelParameters?.temperature,
      promptConfig?.modelParameters?.topP,
      maxTokens,
      endpoint,
      token,
      customHeaders,
    )

    const enableMcp = core.getBooleanInput('enable-github-mcp') || false

    let modelResponse: string | null = null

    if (enableMcp) {
      const mcpClient = await connectToGitHubMCP(githubMcpToken, githubMcpToolsets)

      if (mcpClient) {
        modelResponse = await mcpInference(inferenceRequest, mcpClient)
      } else {
        core.warning('MCP connection failed, falling back to simple inference')
        modelResponse = await simpleInference(inferenceRequest)
      }
    } else {
      modelResponse = await simpleInference(inferenceRequest)
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
    // Force exit to prevent hanging on open connections
    process.exit(1)
  }

  // Force exit to prevent hanging on open connections
  process.exit(0)
}
