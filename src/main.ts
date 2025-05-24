import * as core from '@actions/core'
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference'
import { AzureKeyCredential } from '@azure/core-auth'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const RESPONSE_FILE = 'modelResponse.txt'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const promptFile: string = core.getInput('prompt-file')
    const promptString: string = core.getInput('prompt')

    let prompt: string
    if (promptFile !== undefined && promptFile !== '') {
      if (!fs.existsSync(promptFile)) {
        throw new Error(`Prompt file not found: ${promptFile}`)
      }
      prompt = fs.readFileSync(promptFile, 'utf-8')
    } else if (promptString !== undefined && promptString !== '') {
      prompt = promptString
    } else {
      throw new Error('prompt is not set')
    }

    const systemPromptFile: string = core.getInput('system-prompt-file')
    const systemPromptString: string = core.getInput('system-prompt')

    let systemPrompt: string
    if (systemPromptFile !== undefined && systemPromptFile !== '') {
      if (!fs.existsSync(systemPromptFile)) {
        throw new Error(`System prompt file not found: ${systemPromptFile}`)
      }
      systemPrompt = fs.readFileSync(systemPromptFile, 'utf-8')
    } else if (systemPromptString !== undefined && systemPromptString !== '') {
      systemPrompt = systemPromptString
    } else {
      // Use default system prompt
      systemPrompt = 'You are a helpful assistant'
    }

    const modelName: string = core.getInput('model')
    const maxTokens: number = parseInt(core.getInput('max-tokens'), 10)

    const token = core.getInput('token') || process.env['GITHUB_TOKEN']
    if (token === undefined) {
      throw new Error('GITHUB_TOKEN is not set')
    }

    const endpoint = core.getInput('endpoint')

    const client = ModelClient(endpoint, new AzureKeyCredential(token), {
      userAgentOptions: { userAgentPrefix: 'github-actions-ai-inference' }
    })

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        model: modelName
      }
    })

    if (isUnexpected(response)) {
      if (response.body.error) {
        throw response.body.error
      }
      throw new Error(
        'An error occurred while fetching the response (' +
          response.status +
          '): ' +
          response.body
      )
    }

    const modelResponse: string | null =
      response.body.choices[0].message.content

    // Set outputs for other workflow steps to use
    core.setOutput('response', modelResponse || '')

    // Save the response to a file in case the response overflow the output limit
    const responseFilePath = path.join(tempDir(), RESPONSE_FILE)
    core.setOutput('response-file', responseFilePath)

    if (modelResponse && modelResponse !== '') {
      fs.writeFileSync(responseFilePath, modelResponse, 'utf-8')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unexpected error occurred')
    }
  }
}

function tempDir(): string {
  const tempDirectory = process.env['RUNNER_TEMP'] || os.tmpdir()
  return tempDirectory
}
