import {describe, it, expect, beforeEach, vi, type MockedFunction} from 'vitest'
import * as core from '../__fixtures__/core.js'

const mockExistsSync = vi.fn().mockReturnValue(true)
const mockReadFileSync = vi.fn()
const mockWriteFileSync = vi.fn()

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
  writeFileSync: mockWriteFileSync,
}))

const mockFileSync = vi.fn().mockReturnValue({
  name: '/tmp/modelResponse-test.txt',
})

vi.mock('tmp', () => ({
  fileSync: mockFileSync,
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCopilotInference = vi.fn() as MockedFunction<any>
vi.mock('../src/copilot.js', () => ({
  copilotInference: mockCopilotInference,
}))

vi.mock('@actions/core', () => core)

const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`process.exit:${code}`)
})

const {run} = await import('../src/main.js')

function mockInputs(overrides: Record<string, string> = {}): void {
  const defaults: Record<string, string> = {
    prompt: 'Hello, AI!',
    'system-prompt': 'You are a test assistant.',
    token: 'fake-token',
    provider: 'copilot',
    model: 'gpt-4.1',
    'prompt-file': '',
    'system-prompt-file': '',
    input: '',
    file_input: '',
    'copilot-cli-path': '',
    'copilot-allow-tools': '',
  }

  const all = {...defaults, ...overrides}
  core.getInput.mockImplementation((name: string) => all[name] || '')
}

async function runAndCaptureExit(): Promise<void> {
  await expect(run()).rejects.toThrow(/process\.exit:/)
}

describe('main.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.GITHUB_TOKEN
    mockCopilotInference.mockResolvedValue('copilot-response')
  })

  it('routes to copilot inference by default', async () => {
    mockInputs({provider: ''})

    await runAndCaptureExit()

    expect(mockCopilotInference).toHaveBeenCalledWith({
      messages: [
        {role: 'system', content: 'You are a test assistant.'},
        {role: 'user', content: 'Hello, AI!'},
      ],
      model: 'gpt-4.1',
      cliPath: undefined,
      allowTools: [],
    })
    expect(core.setSecret).toHaveBeenCalledWith('fake-token')
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'response', 'copilot-response')
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'response-file', '/tmp/modelResponse-test.txt')
    expect(mockWriteFileSync).toHaveBeenCalledWith('/tmp/modelResponse-test.txt', 'copilot-response', 'utf-8')
    expect(mockProcessExit).toHaveBeenCalledWith(0)
  })

  it('forwards copilot CLI options', async () => {
    mockInputs({
      'copilot-cli-path': '/opt/copilot',
      'copilot-allow-tools': 'shell(git:*), write',
    })

    await runAndCaptureExit()

    expect(mockCopilotInference).toHaveBeenCalledWith(
      expect.objectContaining({
        cliPath: '/opt/copilot',
        allowTools: ['shell(git:*)', 'write'],
      }),
    )
  })

  it('loads prompt and system prompt from files', async () => {
    mockInputs({
      'prompt-file': 'prompt.txt',
      'system-prompt-file': 'system.txt',
      prompt: '',
      'system-prompt': '',
    })

    mockReadFileSync.mockImplementation((path: string) => {
      if (path === 'prompt.txt') return 'file prompt'
      if (path === 'system.txt') return 'file system'
      return ''
    })

    await runAndCaptureExit()

    expect(mockCopilotInference).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {role: 'system', content: 'file system'},
          {role: 'user', content: 'file prompt'},
        ],
      }),
    )
  })

  it('fails when provider is unsupported', async () => {
    mockInputs({provider: 'legacy-provider'})

    await runAndCaptureExit()

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining('Unsupported provider "legacy-provider"'))
    expect(mockProcessExit).toHaveBeenCalledWith(1)
  })
})
