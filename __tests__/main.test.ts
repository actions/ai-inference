/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

const mockPost = jest.fn().mockImplementation(() => ({
  body: {
    choices: [
      {
        message: {
          content: 'Hello, user!'
        }
      }
    ]
  }
}))

jest.unstable_mockModule('@azure-rest/ai-inference', () => ({
  default: jest.fn(() => ({
    path: jest.fn(() => ({
      post: mockPost
    }))
  })),
  isUnexpected: jest.fn(() => false)
}))

// Default to throwing errors to catch unexpected calls
const mockExistsSync = jest.fn().mockImplementation(() => {
  throw new Error(
    `Unexpected call: fs.existsSync(${mockExistsSync.mock.calls})`
  )
})
const mockReadFileSync = jest.fn().mockImplementation(() => {
  throw new Error(
    `Unexpected call: fs.readFileSync(${mockReadFileSync.mock.calls})`
  )
})
const mockWriteFileSync = jest.fn()
const mockMkdirSync = jest.fn()

/**
 * Helper function to mock file system operations for one or more files
 * @param fileContents - Object mapping paths to their contents
 * @param nonExistentPaths - Array of file paths that should be treated as non-existent
 */
function mockFileContent(
  fileContents: Record<string, string> = {},
  nonExistentPaths: string[] = []
): void {
  // Mock existsSync to return true for paths that exist, false for those that don't
  mockExistsSync.mockImplementation((...args: unknown[]): boolean => {
    const [path] = args as [string]
    if (nonExistentPaths.includes(path)) {
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
    token: 'fake-token'
  }

  // Combine defaults with user-provided inputs
  const allInputs: Record<string, string> = { ...defaultInputs, ...inputs }

  core.getInput.mockImplementation((name: string) => {
    return allInputs[name] || ''
  })
}

/**
 * Helper function to verify common response assertions
 * @param customResponseFile - Optional custom response file path. If not provided, verifies standard response with default path
 */
function verifyStandardResponse(customResponseFile?: string): void {
  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'response', 'Hello, user!')

  if (customResponseFile) {
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'response-file',
      customResponseFile
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      customResponseFile,
      'Hello, user!',
      'utf-8'
    )
  } else {
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'response-file',
      expect.stringContaining('modelResponse.txt')
    )
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('modelResponse.txt'),
      'Hello, user!',
      'utf-8'
    )
  }
}

jest.unstable_mockModule('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
  mkdirSync: mockMkdirSync
}))

jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Sets the response output', async () => {
    // Set the action's inputs as return values from core.getInput().
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.'
    })

    await run()

    expect(core.setOutput).toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('Sets the response output when no system prompt is set', async () => {
    // Set the action's inputs as return values from core.getInput().
    mockInputs({
      prompt: 'Hello, AI!'
    })

    await run()

    expect(core.setOutput).toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('Sets a failed status when no token is set', async () => {
    // Clear the getInput mock and simulate no prompt or prompt-file input
    mockInputs({
      prompt: 'Hello, AI!',
      token: ''
    })

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'GITHUB_TOKEN is not set')
  })

  it('Sets a failed status when no prompt is set', async () => {
    // Clear the getInput mock and simulate no prompt or prompt-file input
    mockInputs({
      prompt: '',
      'prompt-file': ''
    })

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Neither prompt-file nor prompt was set'
    )
  })

  it('uses prompt-file', async () => {
    const promptFile = 'prompt.txt'
    const promptContent = 'This is a prompt from a file'

    // Set up mock to return specific content for the prompt file
    mockFileContent({
      [promptFile]: promptContent
    })

    // Set up input mocks
    mockInputs({
      'prompt-file': promptFile,
      'system-prompt': 'You are a test assistant.'
    })

    await run()

    expect(mockReadFileSync).toHaveBeenCalledWith(promptFile, 'utf-8')
    verifyStandardResponse()
  })

  it('handles non-existent prompt-file with an error', async () => {
    const promptFile = 'non-existent-prompt.txt'

    // Mock the file not existing
    mockFileContent({}, [promptFile])

    // Set up input mocks
    mockInputs({
      'prompt-file': promptFile
    })

    await run()

    // Verify that the error was correctly reported
    expect(core.setFailed).toHaveBeenCalledWith(
      `File for prompt-file was not found: ${promptFile}`
    )
  })

  it('prefers prompt-file over prompt when both are provided', async () => {
    const promptFile = 'prompt.txt'
    const promptFileContent = 'This is a prompt from a file that should be used'
    const promptString = 'This is a direct prompt that should be ignored'

    // Set up mock to return specific content for the prompt file
    mockFileContent({
      [promptFile]: promptFileContent
    })

    // Set up input mocks
    mockInputs({
      prompt: promptString,
      'prompt-file': promptFile,
      'system-prompt': 'You are a test assistant.'
    })

    await run()

    expect(mockExistsSync).toHaveBeenCalledWith(promptFile)
    expect(mockReadFileSync).toHaveBeenCalledWith(promptFile, 'utf-8')

    // Check that the post call was made with the prompt from the file, not the input parameter
    expect(mockPost).toHaveBeenCalledWith({
      body: {
        messages: [
          {
            role: 'system',
            content: expect.any(String)
          },
          { role: 'user', content: promptFileContent } // Should use the file content, not the string input
        ],
        max_tokens: expect.any(Number),
        model: expect.any(String)
      }
    })

    verifyStandardResponse()
  })

  it('uses system-prompt-file', async () => {
    const systemPromptFile = 'system-prompt.txt'
    const systemPromptContent =
      'You are a specialized system assistant for testing'

    // Set up mock to return specific content for the system prompt file
    mockFileContent({
      [systemPromptFile]: systemPromptContent
    })

    // Set up input mocks
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt-file': systemPromptFile
    })

    await run()

    expect(mockExistsSync).toHaveBeenCalledWith(systemPromptFile)
    expect(mockReadFileSync).toHaveBeenCalledWith(systemPromptFile, 'utf-8')
    verifyStandardResponse()
  })

  it('handles non-existent system-prompt-file with an error', async () => {
    const systemPromptFile = 'non-existent-system-prompt.txt'

    // Mock the file not existing
    mockFileContent({}, [systemPromptFile])

    // Set up input mocks
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt-file': systemPromptFile
    })

    await run()

    // Verify that the error was correctly reported
    expect(core.setFailed).toHaveBeenCalledWith(
      `File for system-prompt-file was not found: ${systemPromptFile}`
    )
  })

  it('prefers system-prompt-file over system-prompt when both are provided', async () => {
    const systemPromptFile = 'system-prompt.txt'
    const systemPromptFileContent =
      'You are a specialized system assistant from file'
    const systemPromptString =
      'You are a basic system assistant from input parameter'

    // Set up mock to return specific content for the system prompt file
    mockFileContent({
      [systemPromptFile]: systemPromptFileContent
    })

    // Set up input mocks
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt-file': systemPromptFile,
      'system-prompt': systemPromptString
    })

    await run()

    expect(mockExistsSync).toHaveBeenCalledWith(systemPromptFile)
    expect(mockReadFileSync).toHaveBeenCalledWith(systemPromptFile, 'utf-8')

    // Check that the post call was made with the system prompt from the file, not the input parameter
    expect(mockPost).toHaveBeenCalledWith({
      body: {
        messages: [
          {
            role: 'system',
            content: systemPromptFileContent // Should use the file content, not the string input
          },
          { role: 'user', content: 'Hello, AI!' }
        ],
        max_tokens: expect.any(Number),
        model: expect.any(String)
      }
    })

    verifyStandardResponse()
  })

  it('uses both prompt-file and system-prompt-file together', async () => {
    const promptFile = 'prompt.txt'
    const promptContent = 'This is a prompt from a file'
    const systemPromptFile = 'system-prompt.txt'
    const systemPromptContent =
      'You are a specialized system assistant from file'

    // Set up mock to return specific content for both files
    mockFileContent({
      [promptFile]: promptContent,
      [systemPromptFile]: systemPromptContent
    })

    // Set up input mocks
    mockInputs({
      'prompt-file': promptFile,
      'system-prompt-file': systemPromptFile
    })

    await run()

    expect(mockExistsSync).toHaveBeenCalledWith(promptFile)
    expect(mockExistsSync).toHaveBeenCalledWith(systemPromptFile)
    expect(mockReadFileSync).toHaveBeenCalledWith(promptFile, 'utf-8')
    expect(mockReadFileSync).toHaveBeenCalledWith(systemPromptFile, 'utf-8')

    // Check that the post call was made with both the prompt and system prompt from files
    expect(mockPost).toHaveBeenCalledWith({
      body: {
        messages: [
          {
            role: 'system',
            content: systemPromptContent
          },
          { role: 'user', content: promptContent }
        ],
        max_tokens: expect.any(Number),
        model: expect.any(String)
      }
    })

    verifyStandardResponse()
  })

  it('passes custom max-tokens parameter to the model', async () => {
    const customMaxTokens = 42

    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'max-tokens': customMaxTokens.toString()
    })

    await run()

    // Check that the post call was made with the correct max_tokens parameter
    expect(mockPost).toHaveBeenCalledWith({
      body: {
        messages: expect.any(Array),
        max_tokens: customMaxTokens,
        model: expect.any(String)
      }
    })

    verifyStandardResponse()
  })

  it('uses custom response-file path when provided', async () => {
    const customResponseFile = '/custom/path/response.txt'

    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.',
      'response-file': customResponseFile
    })
    mockFileContent({}, ['/custom/path'])

    await run()

    expect(mockExistsSync).toHaveBeenCalledWith('/custom/path')
    expect(mockMkdirSync).toHaveBeenCalledWith('/custom/path', {
      recursive: true
    })
    verifyStandardResponse(customResponseFile)
  })

  it('uses default response-file path when not provided', async () => {
    mockInputs({
      prompt: 'Hello, AI!',
      'system-prompt': 'You are a test assistant.'
    })

    await run()

    expect(mockExistsSync).not.toHaveBeenCalled()
    expect(mockMkdirSync).not.toHaveBeenCalled()
    verifyStandardResponse()
  })

  it('handles empty model response content', async () => {
    // Mock the API client to return empty string content
    mockPost.mockImplementationOnce(() => ({
      body: {
        choices: [
          {
            message: {
              content: ''
            }
          }
        ]
      }
    }))

    mockInputs({
      prompt: 'Hello, AI!'
    })

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'response', '')
    expect(mockWriteFileSync).not.toHaveBeenCalled()
  })

  it('handles Error exceptions gracefully', async () => {
    // Mock the API client to throw a non-Error object
    mockPost.mockImplementationOnce(() => {
      throw Error('Strange error')
    })

    mockInputs({
      prompt: 'Hello, AI!'
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Strange error')
  })

  it('handles non-Error exceptions gracefully', async () => {
    // Mock the API client to throw a non-Error object
    mockPost.mockImplementationOnce(() => {
      throw 'String error' // Not an Error instance
    })

    mockInputs({
      prompt: 'Hello, AI!'
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('An unexpected error occurred')
  })
})
