import {vi, type MockedFunction, describe, it, expect, beforeEach} from 'vitest'
import * as core from '../__fixtures__/core.js'

// Mock MCP SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockConnect = vi.fn() as MockedFunction<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockListTools = vi.fn() as MockedFunction<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCallTool = vi.fn() as MockedFunction<any>

const mockClient = {
  connect: mockConnect,
  listTools: mockListTools,
  callTool: mockCallTool,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn(() => mockClient),
}))

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: vi.fn(),
}))

vi.mock('@actions/core', () => core)

// Import the module being tested
const {connectToGitHubMCP, executeToolCall, executeToolCalls} = await import('../src/mcp.js')

describe('mcp.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('connectToGitHubMCP', () => {
    it('successfully connects to MCP server and retrieves tools', async () => {
      const token = 'test-token'
      const mockTools = [
        {
          name: 'test-tool-1',
          description: 'Test tool 1',
          inputSchema: {type: 'object', properties: {}},
        },
        {
          name: 'test-tool-2',
          description: 'Test tool 2',
          inputSchema: {
            type: 'object',
            properties: {param: {type: 'string'}},
          },
        },
      ]

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({tools: mockTools})

      const result = await connectToGitHubMCP(token)

      expect(result).not.toBeNull()
      expect(result?.client).toBe(mockClient)
      expect(result?.tools).toHaveLength(2)
      expect(result?.tools[0]).toEqual({
        type: 'function',
        function: {
          name: 'test-tool-1',
          description: 'Test tool 1',
          parameters: {type: 'object', properties: {}},
        },
      })
      expect(core.info).toHaveBeenCalledWith('Connecting to GitHub MCP server...')
      expect(core.info).toHaveBeenCalledWith('Successfully connected to GitHub MCP server')
      expect(core.info).toHaveBeenCalledWith('Retrieved 2 tools from GitHub MCP server')
      expect(core.info).toHaveBeenCalledWith('Mapped 2 GitHub MCP tools for Azure AI Inference')
    })

    it('returns null when connection fails', async () => {
      const token = 'test-token'
      const connectionError = new Error('Connection failed')

      mockConnect.mockRejectedValue(connectionError)

      const result = await connectToGitHubMCP(token)

      expect(result).toBeNull()
      expect(core.warning).toHaveBeenCalledWith('Failed to connect to GitHub MCP server: Error: Connection failed')
    })

    it('handles empty tools list', async () => {
      const token = 'test-token'

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({tools: []})

      const result = await connectToGitHubMCP(token)

      expect(result).not.toBeNull()
      expect(result?.tools).toHaveLength(0)
      expect(core.info).toHaveBeenCalledWith('Retrieved 0 tools from GitHub MCP server')
      expect(core.info).toHaveBeenCalledWith('Mapped 0 GitHub MCP tools for Azure AI Inference')
    })

    it('handles undefined tools list', async () => {
      const token = 'test-token'

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({})

      const result = await connectToGitHubMCP(token)

      expect(result).not.toBeNull()
      expect(result?.tools).toHaveLength(0)
      expect(core.info).toHaveBeenCalledWith('Retrieved 0 tools from GitHub MCP server')
    })

    it('uses default toolsets when toolsets parameter is not provided', async () => {
      const token = 'test-token'

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({tools: []})

      await connectToGitHubMCP(token)

      expect(core.info).toHaveBeenCalledWith('Using default GitHub MCP toolsets')
    })

    it('uses custom toolsets when toolsets parameter is provided', async () => {
      const token = 'test-token'
      const toolsets = 'repos,issues,pull_requests,actions'

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({tools: []})

      await connectToGitHubMCP(token, toolsets)

      expect(core.info).toHaveBeenCalledWith('Using GitHub MCP toolsets: repos,issues,pull_requests,actions')
    })

    it('ignores empty toolsets parameter', async () => {
      const token = 'test-token'

      mockConnect.mockResolvedValue(undefined)
      mockListTools.mockResolvedValue({tools: []})

      await connectToGitHubMCP(token, '   ')

      expect(core.info).toHaveBeenCalledWith('Using default GitHub MCP toolsets')
    })
  })

  describe('executeToolCall', () => {
    it('successfully executes a tool call', async () => {
      const toolCall = {
        id: 'call-123',
        type: 'function',
        function: {
          name: 'test-tool',
          arguments: '{"param": "value"}',
        },
      }
      const toolResult = {
        content: [{type: 'text', text: 'Tool execution result'}],
      }

      mockCallTool.mockResolvedValue(toolResult)

      const result = await executeToolCall(mockClient, toolCall)

      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'test-tool',
        arguments: {param: 'value'},
      })
      expect(result).toEqual({
        tool_call_id: 'call-123',
        role: 'tool',
        name: 'test-tool',
        content: JSON.stringify(toolResult.content),
      })
      expect(core.info).toHaveBeenCalledWith('Executing GitHub MCP tool: test-tool with args: {"param": "value"}')
      expect(core.info).toHaveBeenCalledWith('GitHub MCP tool test-tool executed successfully')
    })

    it('handles tool execution errors gracefully', async () => {
      const toolCall = {
        id: 'call-456',
        type: 'function',
        function: {
          name: 'failing-tool',
          arguments: '{"param": "value"}',
        },
      }
      const toolError = new Error('Tool execution failed')

      mockCallTool.mockRejectedValue(toolError)

      const result = await executeToolCall(mockClient, toolCall)

      expect(result).toEqual({
        tool_call_id: 'call-456',
        role: 'tool',
        name: 'failing-tool',
        content: 'Error: Error: Tool execution failed',
      })
      expect(core.warning).toHaveBeenCalledWith(
        'Failed to execute GitHub MCP tool failing-tool: Error: Tool execution failed',
      )
    })

    it('handles invalid JSON arguments', async () => {
      const toolCall = {
        id: 'call-789',
        type: 'function',
        function: {
          name: 'test-tool',
          arguments: 'invalid-json',
        },
      }

      const result = await executeToolCall(mockClient, toolCall)

      expect(result.tool_call_id).toBe('call-789')
      expect(result.role).toBe('tool')
      expect(result.name).toBe('test-tool')
      expect(result.content).toContain('Error:')
      expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Failed to execute GitHub MCP tool test-tool:'))
    })
  })

  describe('executeToolCalls', () => {
    it('executes multiple tool calls successfully', async () => {
      const toolCalls = [
        {
          id: 'call-1',
          type: 'function',
          function: {name: 'tool-1', arguments: '{}'},
        },
        {
          id: 'call-2',
          type: 'function',
          function: {name: 'tool-2', arguments: '{"param": "value"}'},
        },
      ]

      mockCallTool
        .mockResolvedValueOnce({
          content: [{type: 'text', text: 'Result 1'}],
        })
        .mockResolvedValueOnce({
          content: [{type: 'text', text: 'Result 2'}],
        })

      const results = await executeToolCalls(mockClient, toolCalls)

      expect(results).toHaveLength(2)
      expect(results[0].tool_call_id).toBe('call-1')
      expect(results[1].tool_call_id).toBe('call-2')
      expect(mockCallTool).toHaveBeenCalledTimes(2)
    })

    it('handles empty tool calls array', async () => {
      const results = await executeToolCalls(mockClient, [])

      expect(results).toHaveLength(0)
      expect(mockCallTool).not.toHaveBeenCalled()
    })

    it('continues execution even if some tools fail', async () => {
      const toolCalls = [
        {
          id: 'call-1',
          type: 'function',
          function: {name: 'tool-1', arguments: '{}'},
        },
        {
          id: 'call-2',
          type: 'function',
          function: {name: 'tool-2', arguments: '{}'},
        },
      ]

      mockCallTool
        .mockResolvedValueOnce({
          content: [{type: 'text', text: 'Result 1'}],
        })
        .mockRejectedValueOnce(new Error('Tool 2 failed'))

      const results = await executeToolCalls(mockClient, toolCalls)

      expect(results).toHaveLength(2)
      expect(results[0].content).toContain('Result 1')
      expect(results[1].content).toContain('Error:')
    })
  })
})
