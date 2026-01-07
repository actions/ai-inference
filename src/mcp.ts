import * as core from '@actions/core'
import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js'

export interface ToolResult {
  tool_call_id: string
  role: 'tool'
  name: string
  content: string
}

export interface MCPTool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

export interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

export interface GitHubMCPClient {
  client: Client
  tools: Array<MCPTool>
}

/**
 * Connect to the GitHub MCP server and retrieve available tools
 */
export async function connectToGitHubMCP(token: string, toolsets?: string): Promise<GitHubMCPClient | null> {
  const githubMcpUrl = 'https://api.githubcopilot.com/mcp/'

  core.info('Connecting to GitHub MCP server...')

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'X-MCP-Readonly': 'true',
  }

  // Add toolsets header if specified
  if (toolsets && toolsets.trim() !== '') {
    headers['X-MCP-Toolsets'] = toolsets
    core.info(`Using GitHub MCP toolsets: ${toolsets}`)
  } else {
    core.info('Using default GitHub MCP toolsets')
  }

  const transport = new StreamableHTTPClientTransport(new URL(githubMcpUrl), {
    requestInit: {
      headers,
    },
  })

  const client = new Client({
    name: 'ai-inference-action',
    version: '1.0.0',
    transport,
  })

  try {
    await client.connect(transport)
  } catch (mcpError) {
    core.warning(`Failed to connect to GitHub MCP server: ${mcpError}`)
    return null
  }

  core.info('Successfully connected to GitHub MCP server')

  const toolsResponse = await client.listTools()
  core.info(`Retrieved ${toolsResponse.tools?.length || 0} tools from GitHub MCP server`)

  // Map GitHub MCP tools → Azure AI Inference tool definitions
  const tools = (toolsResponse.tools || []).map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }))

  core.info(`Mapped ${tools.length} GitHub MCP tools for Azure AI Inference`)

  return {client, tools}
}

/**
 * Execute a single tool call via GitHub MCP
 */
export async function executeToolCall(githubMcpClient: Client, toolCall: ToolCall): Promise<ToolResult> {
  core.info(`Executing GitHub MCP tool: ${toolCall.function.name} with args: ${toolCall.function.arguments}`)

  try {
    const args = JSON.parse(toolCall.function.arguments)

    const result = await githubMcpClient.callTool({
      name: toolCall.function.name,
      arguments: args,
    })

    core.info(`GitHub MCP tool ${toolCall.function.name} executed successfully`)

    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      name: toolCall.function.name,
      content: JSON.stringify(result.content),
    }
  } catch (toolError) {
    core.warning(`Failed to execute GitHub MCP tool ${toolCall.function.name}: ${toolError}`)

    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      name: toolCall.function.name,
      content: `Error: ${toolError}`,
    }
  }
}

/**
 * Execute all tool calls from a response via GitHub MCP
 */
export async function executeToolCalls(githubMcpClient: Client, toolCalls: ToolCall[]): Promise<ToolResult[]> {
  const toolResults: ToolResult[] = []

  for (const toolCall of toolCalls) {
    const result = await executeToolCall(githubMcpClient, toolCall)
    toolResults.push(result)
  }

  return toolResults
}
