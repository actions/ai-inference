import * as core from '@actions/core'
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference'
import { AzureKeyCredential } from '@azure/core-auth'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const RESPONSE_FILE = 'modelResponse.txt'

/**
 * Helper function to load content from a file or use fallback input
 * @param filePathInput - Input name for the file path
 * @param contentInput - Input name for the direct content
 * @param defaultValue - Default value to use if neither file nor content is provided
 * @returns The loaded content
 */
function loadContentFromFileOrInput(
  filePathInput: string,
  contentInput: string,
  defaultValue?: string
): string {
  const filePath = core.getInput(filePathInput)
  const contentString = core.getInput(contentInput)

  if (filePath !== undefined && filePath !== '') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File for ${filePathInput} was not found: ${filePath}`)
    }
    return fs.readFileSync(filePath, 'utf-8')
  } else if (contentString !== undefined && contentString !== '') {
    return contentString
  } else if (defaultValue !== undefined) {
    return defaultValue
  } else {
    throw new Error(`Neither ${filePathInput} nor ${contentInput} was set`)
  }
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Load prompt content - required
    const prompt = loadContentFromFileOrInput('prompt-file', 'prompt')

    // Load system prompt with default value
    const systemPrompt = loadContentFromFileOrInput(
      'system-prompt-file',
      'system-prompt',
      'You are a helpful assistant'
    )

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
      // Extract x-ms-error-code from headers if available
      const errorCode = response.headers['x-ms-error-code']
      const errorCodeMsg = errorCode ? ` (error code: ${errorCode})` : ''

      // Check if response body exists and contains error details
      if (response.body && response.body.error) {
        throw response.body.error
      }

      // Handle case where response body is missing
      if (!response.body) {
        throw new Error(
          `Failed to get response from AI service (status: ${response.status})${errorCodeMsg}. ` +
            'Please check network connection and endpoint configuration.'
        )
      }

      // Handle other error cases
      throw new Error(
        `AI service returned error response (status: ${response.status})${errorCodeMsg}: ` +
          (typeof response.body === 'string'
            ? response.body
            : JSON.stringify(response.body))
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
