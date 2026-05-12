import {vi, describe, it, expect, beforeEach} from 'vitest'
import * as core from '../__fixtures__/core.js'

vi.mock('@actions/core', () => core)

const {copilotInference, buildCopilotPrompt, DEFAULT_GITHUB_MODELS_MODEL} = await import('../src/copilot.js')

type RunResult = {stdout: string; stderr: string; exitCode: number | null}

function makeSpawner(result: RunResult | Error) {
  return vi.fn(() => {
    if (result instanceof Error) {
      return Promise.reject(result)
    }
    return Promise.resolve({...result})
  })
}

describe('buildCopilotPrompt', () => {
  it('separates system and user messages', () => {
    const {systemMessage, prompt} = buildCopilotPrompt([
      {role: 'system', content: 'Be concise.'},
      {role: 'user', content: 'Hello.'},
    ])
    expect(systemMessage).toBe('Be concise.')
    expect(prompt).toBe('Hello.')
  })

  it('joins multiple system messages and labels non-user/system roles', () => {
    const {systemMessage, prompt} = buildCopilotPrompt([
      {role: 'system', content: 'System A'},
      {role: 'system', content: 'System B'},
      {role: 'user', content: 'Question'},
      {role: 'assistant', content: 'Prior answer'},
    ])
    expect(systemMessage).toBe('System A\n\nSystem B')
    expect(prompt).toContain('Question')
    expect(prompt).toContain('ASSISTANT:\nPrior answer')
  })

  it('skips empty messages', () => {
    const {systemMessage, prompt} = buildCopilotPrompt([
      {role: 'system', content: '   '},
      {role: 'user', content: 'Hi'},
    ])
    expect(systemMessage).toBe('')
    expect(prompt).toBe('Hi')
  })

  it('throws if there is no prompt content', () => {
    expect(() => buildCopilotPrompt([{role: 'system', content: 'only system'}])).toThrow(/no prompt configured/i)
  })
})

describe('copilotInference', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('spawns copilot with the merged prompt and returns stdout', async () => {
    const spawner = makeSpawner({stdout: '  hello world  \n', stderr: '', exitCode: 0})

    const result = await copilotInference(
      {
        messages: [
          {role: 'system', content: 'Be brief.'},
          {role: 'user', content: 'Say hi.'},
        ],
        model: DEFAULT_GITHUB_MODELS_MODEL,
      },
      spawner,
    )

    expect(result).toBe('hello world')
    expect(spawner).toHaveBeenCalledTimes(1)
    const [cmd, args] = spawner.mock.calls[0]
    expect(cmd).toBe('copilot')
    expect(args[0]).toBe('-p')
    expect(args[1]).toBe('Be brief.\n\nSay hi.')
    expect(args).toContain('--no-ask-user')
    expect(args).toContain('-s')
    // Default github-models model should NOT be forwarded
    expect(args).not.toContain('--model')
  })

  it('forwards a non-default model via --model', async () => {
    const spawner = makeSpawner({stdout: 'ok', stderr: '', exitCode: 0})

    await copilotInference(
      {
        messages: [{role: 'user', content: 'hi'}],
        model: 'claude-sonnet-4.5',
      },
      spawner,
    )

    const [, args] = spawner.mock.calls[0]
    const modelIdx = args.indexOf('--model')
    expect(modelIdx).toBeGreaterThan(-1)
    expect(args[modelIdx + 1]).toBe('claude-sonnet-4.5')
  })

  it('forwards allow-tool entries', async () => {
    const spawner = makeSpawner({stdout: 'ok', stderr: '', exitCode: 0})

    await copilotInference(
      {
        messages: [{role: 'user', content: 'hi'}],
        model: '',
        allowTools: ['shell(git:*)', 'write'],
      },
      spawner,
    )

    const [, args] = spawner.mock.calls[0]
    expect(args).toContain('--allow-tool=shell(git:*)')
    expect(args).toContain('--allow-tool=write')
  })

  it('uses a custom cli path when provided', async () => {
    const spawner = makeSpawner({stdout: 'ok', stderr: '', exitCode: 0})

    await copilotInference(
      {
        messages: [{role: 'user', content: 'hi'}],
        model: '',
        cliPath: '/opt/copilot/bin/copilot',
      },
      spawner,
    )

    expect(spawner.mock.calls[0][0]).toBe('/opt/copilot/bin/copilot')
  })

  it('throws a helpful error when the CLI is not installed', async () => {
    const enoent = new Error('spawn copilot ENOENT')
    const spawner = makeSpawner(enoent)

    await expect(
      copilotInference(
        {
          messages: [{role: 'user', content: 'hi'}],
          model: '',
        },
        spawner,
      ),
    ).rejects.toThrow(/Copilot CLI not found/)
  })

  it('throws on non-zero exit code with stderr context', async () => {
    const spawner = makeSpawner({stdout: '', stderr: 'auth failed\nbad token', exitCode: 2})

    await expect(
      copilotInference(
        {
          messages: [{role: 'user', content: 'hi'}],
          model: '',
        },
        spawner,
      ),
    ).rejects.toThrow(/exited with code 2.*bad token/s)
  })

  it('returns null when stdout is empty', async () => {
    const spawner = makeSpawner({stdout: '   ', stderr: '', exitCode: 0})

    const result = await copilotInference(
      {
        messages: [{role: 'user', content: 'hi'}],
        model: '',
      },
      spawner,
    )

    expect(result).toBeNull()
  })
})
