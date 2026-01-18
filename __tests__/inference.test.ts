import {vi, type MockedFunction, beforeEach, expect, describe, it} from 'vitest'
import * as core from '../__fixtures__/core.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCreate = vi.fn() as MockedFunction<any>
const mockCompletions = {create: mockCreate}
const mockChat = {completions: mockCompletions}
const mockOpenAIClient = vi.fn(() => ({
  chat: mockChat,
}))

vi.mock('openai', () => ({
  default: mockOpenAIClient,
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockExecuteToolCalls = vi.fn() as MockedFunction<any>
vi.mock('../src/mcp.js', () => ({
  executeToolCalls: mockExecuteToolCalls,
}))

vi.mock('@actions/core', () => core)

// Import the module being tested
const {simpleInference, mcpInference} = await import('../src/inference.js')

describe('inference.ts', () => {
  const mockRequest = {
    messages: [
      {role: 'system' as const, content: 'You are a test assistant'},
      {role: 'user' as const, content: 'Hello, AI!'},
    ],
    modelName: 'gpt-4',
    maxTokens: 100,
    endpoint: 'https://api.test.com',
    token: 'test-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('simpleInference', () => {
    it('performs simple inference without tools', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello, user!',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await simpleInference(mockRequest)

      expect(result).toBe('Hello, user!')
      expect(core.info).toHaveBeenCalledWith('Running simple inference without tools')
      expect(core.info).toHaveBeenCalledWith('Model response: Hello, user!')

      // Verify the request structure
      expect(mockCreate).toHaveBeenCalledWith({
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant',
          },
          {
            role: 'user',
            content: 'Hello, AI!',
          },
        ],
        max_tokens: 100,
        model: 'gpt-4',
      })

      // Verify OpenAI client was initialized with empty custom headers
      expect(mockOpenAIClient).toHaveBeenCalledWith({
        apiKey: 'test-token',
        baseURL: 'https://api.test.com',
        defaultHeaders: {},
      })
    })

    it('includes custom headers in OpenAI client', async () => {
      const requestWithHeaders = {
        ...mockRequest,
        customHeaders: {
          'X-Custom-Header': 'custom-value',
          'Ocp-Apim-Subscription-Key': 'secret123',
        },
      }

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Response with headers',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await simpleInference(requestWithHeaders)

      expect(result).toBe('Response with headers')

      // Verify OpenAI client was initialized with custom headers
      expect(mockOpenAIClient).toHaveBeenCalledWith({
        apiKey: 'test-token',
        baseURL: 'https://api.test.com',
        defaultHeaders: {
          'X-Custom-Header': 'custom-value',
          'Ocp-Apim-Subscription-Key': 'secret123',
        },
      })
    })

    it('handles null response content', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await simpleInference(mockRequest)

      expect(result).toBeNull()
      expect(core.info).toHaveBeenCalledWith('Model response: No response content')
    })

    it('includes response format when specified', async () => {
      const requestWithResponseFormat = {
        ...mockRequest,
        responseFormat: {
          type: 'json_schema' as const,
          json_schema: {type: 'object'},
        },
      }

      const mockResponse = {
        choices: [
          {
            message: {
              content: '{"result": "success"}',
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await simpleInference(requestWithResponseFormat)

      expect(result).toBe('{"result": "success"}')

      // Verify response format was included in the request
      expect(mockCreate).toHaveBeenCalledWith({
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant',
          },
          {
            role: 'user',
            content: 'Hello, AI!',
          },
        ],
        max_tokens: 100,
        model: 'gpt-4',
        response_format: requestWithResponseFormat.responseFormat,
      })
    })
  })

  describe('mcpInference', () => {
    const mockMcpClient = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: {} as any,
      tools: [
        {
          type: 'function' as const,
          function: {
            name: 'test-tool',
            description: 'A test tool',
            parameters: {type: 'object'},
          },
        },
      ],
    }

    it('performs inference without tool calls', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello, user!',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await mcpInference(mockRequest, mockMcpClient)

      expect(result).toBe('Hello, user!')
      expect(core.info).toHaveBeenCalledWith('Running GitHub MCP inference with tools')
      expect(core.info).toHaveBeenCalledWith('MCP inference iteration 1')
      expect(core.info).toHaveBeenCalledWith('No tool calls requested, ending GitHub MCP inference loop')

      // The MCP inference loop will always add the assistant message, even when there are no tool calls
      // So we don't check the exact messages, just that tools were included
      expect(mockCreate).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callArgs = mockCreate.mock.calls[0][0] as any
      expect(callArgs.tools).toEqual(mockMcpClient.tools)
      expect(callArgs.response_format).toBeUndefined()
      expect(callArgs.model).toBe('gpt-4')
      expect(callArgs.max_tokens).toBe(100)

      // Verify OpenAI client was initialized with empty custom headers
      expect(mockOpenAIClient).toHaveBeenCalledWith({
        apiKey: 'test-token',
        baseURL: 'https://api.test.com',
        defaultHeaders: {},
      })
    })

    it('includes custom headers in MCP inference', async () => {
      const requestWithHeaders = {
        ...mockRequest,
        customHeaders: {
          serviceName: 'test-service',
          'X-Team': 'engineering',
        },
      }

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'MCP response with headers',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await mcpInference(requestWithHeaders, mockMcpClient)

      expect(result).toBe('MCP response with headers')

      // Verify OpenAI client was initialized with custom headers
      expect(mockOpenAIClient).toHaveBeenCalledWith({
        apiKey: 'test-token',
        baseURL: 'https://api.test.com',
        defaultHeaders: {
          serviceName: 'test-service',
          'X-Team': 'engineering',
        },
      })
    })

    it('executes tool calls and continues conversation', async () => {
      const toolCalls = [
        {
          id: 'call-123',
          function: {
            name: 'test-tool',
            arguments: '{"param": "value"}',
          },
        },
      ]

      const toolResults = [
        {
          tool_call_id: 'call-123',
          role: 'tool',
          name: 'test-tool',
          content: 'Tool result',
        },
      ]

      // First response with tool calls
      const firstResponse = {
        choices: [
          {
            message: {
              content: 'I need to use a tool.',
              tool_calls: toolCalls,
            },
          },
        ],
      }

      // Second response after tool execution
      const secondResponse = {
        choices: [
          {
            message: {
              content: 'Here is the final answer.',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValueOnce(firstResponse).mockResolvedValueOnce(secondResponse)

      mockExecuteToolCalls.mockResolvedValue(toolResults)

      const result = await mcpInference(mockRequest, mockMcpClient)

      expect(result).toBe('Here is the final answer.')
      expect(mockExecuteToolCalls).toHaveBeenCalledWith(mockMcpClient.client, toolCalls)
      expect(mockCreate).toHaveBeenCalledTimes(2)

      // Verify the second call includes the conversation history
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secondCall = mockCreate.mock.calls[1][0] as any
      expect(secondCall.messages).toHaveLength(5) // system, user, assistant, tool, assistant
      expect(secondCall.messages[2].role).toBe('assistant')
      expect(secondCall.messages[2].tool_calls).toEqual(toolCalls)
      expect(secondCall.messages[3]).toEqual(toolResults[0])
    })

    it('handles maximum iteration limit', async () => {
      const toolCalls = [
        {
          id: 'call-123',
          function: {
            name: 'test-tool',
            arguments: '{}',
          },
        },
      ]

      const toolResults = [
        {
          tool_call_id: 'call-123',
          role: 'tool',
          name: 'test-tool',
          content: 'Tool result',
        },
      ]

      // Always respond with tool calls to trigger infinite loop
      const responseWithToolCalls = {
        choices: [
          {
            message: {
              content: 'Using tool again.',
              tool_calls: toolCalls,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(responseWithToolCalls)
      mockExecuteToolCalls.mockResolvedValue(toolResults)

      const result = await mcpInference(mockRequest, mockMcpClient)

      expect(mockCreate).toHaveBeenCalledTimes(5) // Max iterations reached
      expect(core.warning).toHaveBeenCalledWith('GitHub MCP inference loop exceeded maximum iterations (5)')
      expect(result).toBe('Using tool again.') // Last assistant message
    })

    it('handles empty tool calls array', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello, user!',
              tool_calls: [],
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      const result = await mcpInference(mockRequest, mockMcpClient)

      expect(result).toBe('Hello, user!')
      expect(core.info).toHaveBeenCalledWith('No tool calls requested, ending GitHub MCP inference loop')
      expect(mockExecuteToolCalls).not.toHaveBeenCalled()
    })

    it('returns last assistant message when no content in final iteration', async () => {
      const toolCalls = [
        {
          id: 'call-123',
          function: {name: 'test-tool', arguments: '{}'},
        },
      ]

      const firstResponse = {
        choices: [
          {
            message: {
              content: 'First message',
              tool_calls: toolCalls,
            },
          },
        ],
      }

      const secondResponse = {
        choices: [
          {
            message: {
              content: 'Second message',
              tool_calls: toolCalls,
            },
          },
        ],
      }

      mockCreate.mockResolvedValueOnce(firstResponse).mockResolvedValue(secondResponse)

      mockExecuteToolCalls.mockResolvedValue([
        {
          tool_call_id: 'call-123',
          role: 'tool',
          name: 'test-tool',
          content: 'result',
        },
      ])

      const result = await mcpInference(mockRequest, mockMcpClient)

      expect(result).toBe('Second message')
    })

    it('makes additional loop with response format when no tool calls are made', async () => {
      const requestWithResponseFormat = {
        ...mockRequest,
        responseFormat: {
          type: 'json_schema' as const,
          json_schema: {type: 'object'},
        },
      }

      // First response without tool calls
      const firstResponse = {
        choices: [
          {
            message: {
              content: 'First response',
              tool_calls: null,
            },
          },
        ],
      }

      // Second response with response format applied
      const secondResponse = {
        choices: [
          {
            message: {
              content: '{"result": "formatted response"}',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValueOnce(firstResponse).mockResolvedValueOnce(secondResponse)

      const result = await mcpInference(requestWithResponseFormat, mockMcpClient)

      expect(result).toBe('{"result": "formatted response"}')
      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(core.info).toHaveBeenCalledWith('Making one more MCP loop with the requested response format...')

      // First call should have tools but no response format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstCall = mockCreate.mock.calls[0][0] as any
      expect(firstCall.tools).toEqual(mockMcpClient.tools)
      expect(firstCall.response_format).toBeUndefined()

      // Second call should have response format but no tools
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secondCall = mockCreate.mock.calls[1][0] as any
      expect(secondCall.tools).toBeUndefined()
      expect(secondCall.response_format).toEqual(requestWithResponseFormat.responseFormat)

      // Second call should include the user message requesting JSON format
      expect(secondCall.messages).toHaveLength(5) // system, user, assistant, user, assistant
      expect(secondCall.messages[3].role).toBe('user')
      expect(secondCall.messages[3].content).toContain('Please provide your response in the exact')
    })

    it('uses response format only on final iteration after tool calls', async () => {
      const requestWithResponseFormat = {
        ...mockRequest,
        responseFormat: {
          type: 'json_schema' as const,
          json_schema: {type: 'object'},
        },
      }

      const toolCalls = [
        {
          id: 'call-123',
          function: {
            name: 'test-tool',
            arguments: '{"param": "value"}',
          },
        },
      ]

      const toolResults = [
        {
          tool_call_id: 'call-123',
          role: 'tool',
          name: 'test-tool',
          content: 'Tool result',
        },
      ]

      // First response with tool calls
      const firstResponse = {
        choices: [
          {
            message: {
              content: 'Using tool',
              tool_calls: toolCalls,
            },
          },
        ],
      }

      // Second response without tool calls, but should trigger final message loop
      const secondResponse = {
        choices: [
          {
            message: {
              content: 'Intermediate result',
              tool_calls: null,
            },
          },
        ],
      }

      // Third response with response format
      const thirdResponse = {
        choices: [
          {
            message: {
              content: '{"final": "result"}',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse)
        .mockResolvedValueOnce(thirdResponse)

      mockExecuteToolCalls.mockResolvedValue(toolResults)

      const result = await mcpInference(requestWithResponseFormat, mockMcpClient)

      expect(result).toBe('{"final": "result"}')
      expect(mockCreate).toHaveBeenCalledTimes(3)

      // First call: tools but no response format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstCall = mockCreate.mock.calls[0][0] as any
      expect(firstCall.tools).toEqual(mockMcpClient.tools)
      expect(firstCall.response_format).toBeUndefined()

      // Second call: tools but no response format (after tool execution)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secondCall = mockCreate.mock.calls[1][0] as any
      expect(secondCall.tools).toEqual(mockMcpClient.tools)
      expect(secondCall.response_format).toBeUndefined()

      // Third call: response format but no tools (final message)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const thirdCall = mockCreate.mock.calls[2][0] as any
      expect(thirdCall.tools).toBeUndefined()
      expect(thirdCall.response_format).toEqual(requestWithResponseFormat.responseFormat)
    })

    it('returns immediately when response format is set and finalMessage is already true', async () => {
      const requestWithResponseFormat = {
        ...mockRequest,
        responseFormat: {
          type: 'json_schema' as const,
          json_schema: {type: 'object'},
        },
      }

      // Response without tool calls on what would be the final message iteration
      const mockResponse = {
        choices: [
          {
            message: {
              content: '{"immediate": "result"}',
              tool_calls: null,
            },
          },
        ],
      }

      mockCreate.mockResolvedValue(mockResponse)

      // We need to test a scenario where finalMessage would already be true
      // This happens when we're already in the final iteration
      const result = await mcpInference(requestWithResponseFormat, mockMcpClient)

      // The function should make two calls: one normal, then one with response format
      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(result).toBe('{"immediate": "result"}')
    })
  })
})
