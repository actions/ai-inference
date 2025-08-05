import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import {connectToGitHubMCP, GitHubMCPClient} from './mcp.js'
import {simpleInference, mcpInference} from './inference.js'
import {loadContentFromFileOrInput, buildInferenceRequest} from './helpers.js'
import {
  loadPromptFile,
  parseTemplateVariables,
  isPromptYamlFile,
  PromptConfig,
  parseFileTemplateVariables,
} from './prompt.js'

const RESPONSE_FILE = 'modelResponse.txt'

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
    const maxTokens = parseInt(core.getInput('max-tokens'), 10)

    const token = process.env['GITHUB_TOKEN'] || core.getInput('token')
    if (token === undefined) {
      throw new Error('GITHUB_TOKEN is not set')
    }

    // Get GitHub MCP token (use dedicated token if provided, otherwise fall back to main token)
    const githubMcpToken = core.getInput('github-mcp-token') || token

    const endpoint = core.getInput('endpoint')

    // Build the inference request with pre-processed messages and response format
    const inferenceRequest = buildInferenceRequest(
      promptConfig,
      systemPrompt,
      prompt,
      modelName,
      maxTokens,
      endpoint,
      token,
    )

    const enableMcp = core.getBooleanInput('enable-github-mcp') || false

    let modelResponse: string | null = null
    let mcpClient: GitHubMCPClient | null = null

    if (enableMcp) {
      mcpClient = await connectToGitHubMCP(githubMcpToken)

      if (mcpClient) {
        try {
          modelResponse = await mcpInference(inferenceRequest, mcpClient)
        } finally {
          // Always close the MCP client connection to prevent hanging
          core.info('Closing GitHub MCP client connection...')
          try {
            if (mcpClient?.client?.close) {
              await mcpClient.client.close()
            } else if (mcpClient?.client?.transport?.close) {
              await mcpClient.client.transport.close()
            }
            core.info('GitHub MCP client connection closed')
          } catch (closeError) {
            core.warning(`Failed to close MCP client connection: ${closeError}`)
          }
        }
      } else {
        core.warning('MCP connection failed, falling back to simple inference')
        modelResponse = await simpleInference(inferenceRequest)
      }
    } else {
      modelResponse = await simpleInference(inferenceRequest)
    }

    core.setOutput('response', modelResponse || '')

    const responseFilePath = path.join(tempDir(), RESPONSE_FILE)
    core.setOutput('response-file', responseFilePath)

    if (modelResponse && modelResponse !== '') {
      fs.writeFileSync(responseFilePath, modelResponse, 'utf-8')
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
}

function tempDir(): string {
  const tempDirectory = process.env['RUNNER_TEMP'] || os.tmpdir()
  return tempDirectory
}
