import * as core from '@actions/core'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
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
 * Parse custom headers from YAML or JSON format
 * @param input - String in YAML or JSON format containing headers
 * @returns Record of header names to values, or empty object if invalid
 */
export function parseCustomHeaders(input: string): Record<string, string> {
  if (!input || input.trim() === '') {
    return {}
  }

  const trimmedInput = input.trim()

  try {
    // Try JSON first (check if it starts with { or [)
    if (trimmedInput.startsWith('{') || trimmedInput.startsWith('[')) {
      const parsed = JSON.parse(trimmedInput)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        core.warning('Custom headers JSON must be an object, not null or an array')
        return {}
      }
      return validateAndMaskHeaders(parsed as Record<string, unknown>)
    }

    // Try YAML
    const parsed = yaml.load(trimmedInput)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      core.warning('Custom headers YAML must be an object')
      return {}
    }
    return validateAndMaskHeaders(parsed as Record<string, unknown>)
  } catch (error) {
    core.warning(`Failed to parse custom headers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {}
  }
}

/**
 * Validate header names and mask sensitive values in logs
 * @param headers - Raw headers object
 * @returns Validated headers with string values
 */
function validateAndMaskHeaders(headers: Record<string, unknown>): Record<string, string> {
  const validHeaders: Record<string, string> = {}
  const sensitivePatterns = ['key', 'token', 'secret', 'password', 'authorization']

  for (const [name, value] of Object.entries(headers)) {
    // Validate header name (basic HTTP header name validation, RFC 7230: letters, digits, and hyphens)
    if (!/^[A-Za-z0-9-]+$/.test(name)) {
      core.warning(`Skipping invalid header name: ${name} (only alphanumeric characters and hyphens allowed)`)
      continue
    }

    // Convert value to string
    const stringValue = String(value)

    // Validate header value to prevent CRLF/header injection
    if (stringValue.includes('\r') || stringValue.includes('\n')) {
      core.warning(`Skipping header "${name}" because its value contains newline characters, which are not allowed in HTTP header values.`)
      continue
    }
    validHeaders[name] = stringValue

    // Mask sensitive headers in logs
    const lowerName = name.toLowerCase()
    const isSensitive = sensitivePatterns.some(pattern => lowerName.includes(pattern))
    if (isSensitive) {
      core.info(`Custom header added: ${name}: ***MASKED***`)
    } else {
      core.info(`Custom header added: ${name}: ${stringValue}`)
    }
  }

  return validHeaders
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
  customHeaders?: Record<string, string>,
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
    customHeaders,
  }
}
