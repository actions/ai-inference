import * as core from '@actions/core'
import OpenAI from 'openai'
import {GitHubMCPClient, executeToolCalls, ToolCall} from './mcp.js'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface InferenceRequest {
  messages: Array<{role: 'system' | 'user' | 'assistant' | 'tool'; content: string}>
  modelName: string
  maxTokens: number
  endpoint: string
  token: string
  temperature?: number
  topP?: number
  responseFormat?: {type: 'json_schema'; json_schema: unknown} // Processed response format for the API
  customHeaders?: Record<string, string> // Custom HTTP headers to include in API requests
}

export interface InferenceResponse {
  content: string | null
  toolCalls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
}

/**
 * Simple one-shot inference without tools
 */
export async function simpleInference(request: InferenceRequest): Promise<string | null> {
  core.info('Running simple inference without tools')

  const client = new OpenAI({
    apiKey: request.token,
    baseURL: request.endpoint,
    defaultHeaders: request.customHeaders || {},
  })

  const chatCompletionRequest: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
    messages: request.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    max_tokens: request.maxTokens,
    model: request.modelName,
    temperature: request.temperature,
    top_p: request.topP,
  }

  // Add response format if specified
  if (request.responseFormat) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatCompletionRequest.response_format = request.responseFormat as any
  }

  const response = await chatCompletion(client, chatCompletionRequest, 'simpleInference')
  const modelResponse = response.choices[0]?.message?.content
  core.info(`Model response: ${modelResponse || 'No response content'}`)
  return modelResponse || null
}

/**
 * GitHub MCP-enabled inference with tool execution loop
 */
export async function mcpInference(
  request: InferenceRequest,
  githubMcpClient: GitHubMCPClient,
): Promise<string | null> {
  core.info('Running GitHub MCP inference with tools')

  const client = new OpenAI({
    apiKey: request.token,
    baseURL: request.endpoint,
    defaultHeaders: request.customHeaders || {},
  })

  // Start with the pre-processed messages
  const messages: ChatMessage[] = [...request.messages]

  let iterationCount = 0
  const maxIterations = 5 // Prevent infinite loops
  // We want to use response_format (e.g. JSON) on the last iteration only, so the model can output
  // the final result in the expected format without interfering with tool calls
  let finalMessage = false

  while (iterationCount < maxIterations) {
    iterationCount++
    core.info(`MCP inference iteration ${iterationCount}`)

    const chatCompletionRequest: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: request.maxTokens,
      model: request.modelName,
      temperature: request.temperature,
      top_p: request.topP,
    }

    // Add response format if specified (only on final iteration to avoid conflicts with tool calls)
    if (finalMessage && request.responseFormat) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatCompletionRequest.response_format = request.responseFormat as any
    } else {
      chatCompletionRequest.tools = githubMcpClient.tools as OpenAI.Chat.Completions.ChatCompletionTool[]
    }

    try {
      const response = await chatCompletion(client, chatCompletionRequest, `mcpInference iteration ${iterationCount}`)

      const assistantMessage = response.choices[0]?.message
      const modelResponse = assistantMessage?.content
      const toolCalls = assistantMessage?.tool_calls

      core.info(`Model response: ${modelResponse || 'No response content'}`)

      messages.push({
        role: 'assistant',
        content: modelResponse || '',
        ...(toolCalls && {tool_calls: toolCalls as ToolCall[]}),
      })

      if (!toolCalls || toolCalls.length === 0) {
        core.info('No tool calls requested, ending GitHub MCP inference loop')

        if (request.responseFormat && !finalMessage) {
          core.info('Making one more MCP loop with the requested response format...')
          messages.push({
            role: 'user',
            content: `Please provide your response in the exact ${request.responseFormat.type} format specified.`,
          })
          finalMessage = true
          continue
        } else {
          return modelResponse || null
        }
      }

      core.info(`Model requested ${toolCalls.length} tool calls`)
      const toolResults = await executeToolCalls(githubMcpClient.client, toolCalls as ToolCall[])
      messages.push(...toolResults)
      core.info('Tool results added, continuing conversation...')
    } catch (error) {
      core.error(`OpenAI API error: ${error}`)
      throw error
    }
  }

  core.warning(`GitHub MCP inference loop exceeded maximum iterations (${maxIterations})`)

  // Return the last assistant message content
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant')

  return lastAssistantMessage?.content || null
}

/**
 * Wrapper around OpenAI chat.completions.create with defensive handling for cases where
 * the SDK returns a raw string (e.g., unexpected content-type or streaming body) instead of
 * a parsed object. Ensures an object with a 'choices' array is returned or throws a descriptive error.
 */
async function chatCompletion(
  client: OpenAI,
  params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  context: string,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any = await client.chat.completions.create(params)
    core.debug(`${context}: raw response typeof=${typeof response}`)

    if (typeof response === 'string') {
      // Attempt to parse if we unexpectedly received a string
      try {
        response = JSON.parse(response)
      } catch (e) {
        const preview = response.slice(0, 400)
        throw new Error(
          `${context}: Chat completion response was a string and not valid JSON (${(e as Error).message}). Preview: ${preview}`,
        )
      }
    }

    if (!response || typeof response !== 'object' || !('choices' in response)) {
      const preview = JSON.stringify(response)?.slice(0, 800)
      throw new Error(`${context}: Unexpected response shape (no choices). Preview: ${preview}`)
    }

    return response as OpenAI.Chat.Completions.ChatCompletion
  } catch (err) {
    // Re-throw after logging for upstream handling
    core.error(`${context}: chatCompletion failed: ${err}`)
    throw err
  }
}
