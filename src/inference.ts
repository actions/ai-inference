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
  responseFormat?: {type: 'json_schema'; json_schema: unknown} // Processed response format for the API
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
  })

  const chatCompletionRequest: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
    messages: request.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    max_tokens: request.maxTokens,
    model: request.modelName,
  }

  // Add response format if specified
  if (request.responseFormat) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chatCompletionRequest.response_format = request.responseFormat as any
  }

  try {
    const response = await client.chat.completions.create(chatCompletionRequest)

    if ('choices' in response) {
      const modelResponse = response.choices[0]?.message?.content
      core.info(`Model response: ${modelResponse || 'No response content'}`)
      return modelResponse || null
    } else {
      core.error(`Unexpected response format from API: ${JSON.stringify(response)}`)
      return null
    }
  } catch (error) {
    core.error(`API error: ${error}`)
    throw error
  }
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
  })

  // Start with the pre-processed messages
  const messages: ChatMessage[] = [...request.messages]

  let iterationCount = 0
  const maxIterations = 5 // Prevent infinite loops

  while (iterationCount < maxIterations) {
    iterationCount++
    core.info(`MCP inference iteration ${iterationCount}`)

    const chatCompletionRequest: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: request.maxTokens,
      model: request.modelName,
      tools: githubMcpClient.tools as OpenAI.Chat.Completions.ChatCompletionTool[],
    }

    // Add response format if specified - but only when not expecting tool calls
    // On iterations after the first, we check if we expect this to be the final response
    if (request.responseFormat) {
      // For the first iteration, let the model decide between tools and final response
      // For subsequent iterations, we know tools were called, so this should be final response
      if (iterationCount > 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chatCompletionRequest.response_format = request.responseFormat as any
      }
    }

    try {
      const response = await client.chat.completions.create(chatCompletionRequest)

      if (!('choices' in response)) {
        throw new Error(`Unexpected response format from API: ${JSON.stringify(response)}`)
      }

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

        // If we have a response format requirement and this is the final response,
        // but it doesn't look like proper JSON, try one more time with explicit JSON request
        if (request.responseFormat && modelResponse && iterationCount === 1) {
          const content = modelResponse.trim()
          if (!content.startsWith('{') && !content.startsWith('[')) {
            core.info('First response does not appear to be in JSON format, requesting JSON format explicitly...')

            // Add a user message requesting JSON format and try again
            messages.push({
              role: 'user',
              content:
                'Please provide your response in the exact JSON format specified in the schema. Return only valid JSON without any additional text or explanation.',
            })

            // Continue the loop to get a properly formatted response
            continue
          }
        }

        return modelResponse || null
      }

      core.info(`Model requested ${toolCalls.length} tool calls`)

      // Execute all tool calls via GitHub MCP
      const toolResults = await executeToolCalls(githubMcpClient.client, toolCalls as ToolCall[])

      // Add tool results to the conversation
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
