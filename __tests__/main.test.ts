import {vi, describe, expect, it, beforeEach, type MockedFunction} from 'vitest'
import * as core from '../__fixtures__/core.js'

// Default to throwing errors to catch unexpected calls
const mockExistsSync = vi.fn().mockImplementation(() => {
  throw new Error('Unexpected call to existsSync - test should override this implementation')
})
const mockReadFileSync = vi.fn().mockImplementation(() => {
  throw new Error('Unexpected call to readFileSync - test should override this implementation')
})
const mockWriteFileSync = vi.fn()

/**
 * Helper function to mock file system operations for one or more files
 * @param fileContents - Object mapping file paths to their contents
 * @param nonExistentFiles - Array of file paths that should be treated as non-existent
 */
function mockFileContent(fileContents: Record<string, string> = {}, nonExistentFiles: string[] = []): void {
  // Mock existsSync to return true for files that exist, false for those that don't
  mockExistsSync.mockImplementation((...args: unknown[]): boolean => {
    const [path] = args as [string]
    if (nonExistentFiles.includes(path)) {
      return false
    }
    return path in fileContents || true
  })

  // Mock readFileSync to return the content for known files
  mockReadFileSync.mockImplementation((...args: unknown[]): string => {
    const [path, options] = args as [string, BufferEncoding]
    if (options === 'utf-8' && path in fileContents) {
      return fileContents[path]
    }
    throw new Error(`Unexpected file read: ${path}`)
  })
}

/**
 * Helper function to mock action inputs
 * @param inputs - Object mapping input names to their values
 */
function mockInputs(inputs: Record<string, string> = {}): void {
  // Default values that are applied unless overridden
  const defaultInputs: Record<string, string> = {
    token: 'fake-token',
    model: 'gpt-4',
    'max-tokens': '100',
    endpoint: 'https://api.test.com',
  }

  // Combine defaults with user-provided inputs
  const allInputs: Record<string, string> = {...defaultInputs, ...inputs}

  core.getInput.mockImplementation((name: string) => {
    return allInputs[name] || ''
  })

  core.getBooleanInput.mockImplementation((name: string) => {
    const value = allInputs[name]
    return value === 'true'
  })
}

/**
 * Helper function to verify common response assertions
 */
function verifyStandardResponse(): void {
  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'response', 'Hello, user!')
  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'response-file', expect.stringContaining('modelResponse.txt'))
}

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}))

// Mock MCP and inference modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockConnectToGitHubMCP = vi.fn() as MockedFunction<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSimpleInference = vi.fn() as MockedFunction<any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockMcpInference = vi.fn() as MockedFunction<any>

vi.mock('../src/mcp.js', () => ({
  connectToGitHubMCP: mockConnectToGitHubMCP,
}))

vi.mock('../src/inference.js', () => ({
  simpleInference: mockSimpleInference,
  mcpInference: mockMcpInference,
}))

vi.mock('@actions/core', () => core)

// Mock process.exit to prevent it from actually exiting during tests
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called')
})

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const {run} = await import('../src/main.js')

describe('main.ts', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    mockProcessExit.mockClear()

    // Remove any existing GITHUB_TOKEN
    delete process.env.GITHUB_TOKEN

    // Set up default mock responses
    mockSimpleInference.mockResolvedValue('Hello, user!')
    mockMcpInference.mockResolvedValue('Hello, user!')
  })

  it('Sets the response output', async () => {
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
    })

    await run()

    expect(core.setOutput).toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('Sets a failed status when no prompt is set', async () => {
    mockInputs({
      prompt: '',
      'prompt-file': '',
    })

    // Expect the run function to throw due to process.exit being mocked
    await expect(run()).rejects.toThrow('process.exit called')

    expect(core.setFailed).toHaveBeenCalledWith('Neither prompt-file nor prompt was set')
    expect(mockProcessExit).toHaveBeenCalledWith(1)
  })

  it('uses simple inference when MCP is disabled', async () => {
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'enable-github-mcp': 'false',
    })

    await run()

    expect(mockSimpleInference).toHaveBeenCalledWith({
      messages: [
        {role: 'system', content: 'You are a test assistant.'},
        {role: 'user', content: 'Hello, AI!'},
      ],
      modelName: 'gpt-4',
      maxTokens: 100,
      endpoint: 'https://api.test.com',
      token: 'fake-token',
      responseFormat: undefined,
    })
    expect(mockConnectToGitHubMCP).not.toHaveBeenCalled()
    expect(mockMcpInference).not.toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('uses MCP inference when enabled and connection succeeds', async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockMcpClient = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: {close: mockClose} as any,
      tools: [{type: 'function', function: {name: 'test-tool'}}],
    }

    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'enable-github-mcp': 'true',
    })

    mockConnectToGitHubMCP.mockResolvedValue(mockMcpClient)

    await run()

    expect(mockConnectToGitHubMCP).toHaveBeenCalledWith('fake-token')
    expect(mockMcpInference).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {role: 'system', content: 'You are a test assistant.'},
          {role: 'user', content: 'Hello, AI!'},
        ],
        token: 'fake-token',
      }),
      mockMcpClient,
    )
    expect(mockSimpleInference).not.toHaveBeenCalled()
    expect(mockClose).toHaveBeenCalledOnce() // Verify the close method was called
    verifyStandardResponse()
  })

  it('falls back to simple inference when MCP connection fails', async () => {
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'enable-github-mcp': 'true',
    })

    mockConnectToGitHubMCP.mockResolvedValue(null)

    await run()

    expect(mockConnectToGitHubMCP).toHaveBeenCalledWith('fake-token')
    expect(mockSimpleInference).toHaveBeenCalled()
    expect(mockMcpInference).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalledWith('MCP connection failed, falling back to simple inference')
    verifyStandardResponse()
  })

  it('handles MCP client close errors gracefully', async () => {
    const mockClose = vi.fn().mockRejectedValue(new Error('Close failed'))
    const mockMcpClient = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: {close: mockClose} as any,
      tools: [{type: 'function', function: {name: 'test-tool'}}],
    }

    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'enable-github-mcp': 'true',
    })

    mockConnectToGitHubMCP.mockResolvedValue(mockMcpClient)

    await run()

    expect(mockClose).toHaveBeenCalledOnce()
    expect(core.warning).toHaveBeenCalledWith('Failed to close MCP client connection: Error: Close failed')
    verifyStandardResponse()
  })

  it('handles MCP client without close method', async () => {
    const mockMcpClient = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: {} as any, // No close method
      tools: [{type: 'function', function: {name: 'test-tool'}}],
    }

    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'enable-github-mcp': 'true',
    })

    mockConnectToGitHubMCP.mockResolvedValue(mockMcpClient)

    await run()

    // Should not throw error even without close method
    expect(mockMcpInference).toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('properly integrates with loadContentFromFileOrInput', async () => {
    const promptFile = 'prompt.txt'
    const systemPromptFile = 'system-prompt.txt'
    const promptContent = 'File-based prompt'
    const systemPromptContent = 'File-based system prompt'

    mockFileContent({
      [promptFile]: promptContent,
      [systemPromptFile]: systemPromptContent,
    })

    mockInputs({
      'prompt-file': promptFile,
      'system-prompt-file': systemPromptFile,
      'enable-github-mcp': 'false',
    })

    await run()

    expect(mockSimpleInference).toHaveBeenCalledWith({
      messages: [
        {role: 'system', content: systemPromptContent},
        {role: 'user', content: promptContent},
      ],
      modelName: 'gpt-4',
      maxTokens: 100,
      endpoint: 'https://api.test.com',
      token: 'fake-token',
      responseFormat: undefined,
    })
    verifyStandardResponse()
  })

  it('handles non-existent prompt-file with an error', async () => {
    const promptFile = 'non-existent-prompt.txt'

    mockFileContent({}, [promptFile])

    mockInputs({
      'prompt-file': promptFile,
    })

    // Expect the run function to throw due to process.exit being mocked
    await expect(run()).rejects.toThrow('process.exit called')

    expect(core.setFailed).toHaveBeenCalledWith(`File for prompt-file was not found: ${promptFile}`)
    expect(mockProcessExit).toHaveBeenCalledWith(1)
  })
})
