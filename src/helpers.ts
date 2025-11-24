import * as core from '@actions/core'
import * as fs from 'fs'
import {PromptConfig} from './prompt.js'
import {InferenceRequest} from './inference.js'

/**
 * Helper function to load content from a file or use fallback input
 * @param filePathInput - Input name for the file path
 * @param contentInput - Input name for the direct content
 * @param defaultValue - Default value to use if neither file nor content is provided
 * @returns The loaded content
 */
export function loadContentFromFileOrInput(filePathInput: string, contentInput: string, defaultValue?: string): string {
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
 * Build messages array from either prompt config or legacy format
 */
export function buildMessages(
  promptConfig?: PromptConfig,
  systemPrompt?: string,
  prompt?: string,
): Array<{role: 'system' | 'user' | 'assistant' | 'tool'; content: string}> {
  if (promptConfig?.messages && promptConfig.messages.length > 0) {
    // Use new message format
    return promptConfig.messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
      content: msg.content,
    }))
  } else {
    // Use legacy format
    return [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful assistant',
      },
      {role: 'user', content: prompt || ''},
    ]
  }
}

/**
 * Build response format object for API from prompt config
 */
export function buildResponseFormat(
  promptConfig?: PromptConfig,
): {type: 'json_schema'; json_schema: unknown} | undefined {
  if (promptConfig?.responseFormat === 'json_schema' && promptConfig.jsonSchema) {
    try {
      const schema = JSON.parse(promptConfig.jsonSchema)
      return {
        type: 'json_schema',
        json_schema: schema,
      }
    } catch (error) {
      throw new Error(`Invalid JSON schema: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return undefined
}

/**
 * Build complete InferenceRequest from prompt config and inputs
 */
export function buildInferenceRequest(
  promptConfig: PromptConfig | undefined,
  systemPrompt: string | undefined,
  prompt: string | undefined,
  modelName: string,
  temperature: number | undefined,
  topP: number | undefined,
  maxTokens: number,
  endpoint: string,
  token: string,
): InferenceRequest {
  const messages = buildMessages(promptConfig, systemPrompt, prompt)
  const responseFormat = buildResponseFormat(promptConfig)

  return {
    messages,
    modelName,
    temperature,
    topP,
    maxTokens,
    endpoint,
    token,
    responseFormat,
  }
}
