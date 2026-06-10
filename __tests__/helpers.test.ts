import {describe, it, expect, vi, beforeEach} from 'vitest'
import * as core from '../__fixtures__/core.js'

const mockExistsSync = vi.fn()
const mockReadFileSync = vi.fn()

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

vi.mock('@actions/core', () => core)

const {loadContentFromFileOrInput, buildMessages} = await import('../src/helpers.js')

describe('helpers.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadContentFromFileOrInput', () => {
    it('reads content from file when file input is set', () => {
      core.getInput.mockImplementation((name: string) => {
        if (name === 'prompt-file') return 'prompt.txt'
        if (name === 'prompt') return ''
        return ''
      })
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('from-file')

      const result = loadContentFromFileOrInput('prompt-file', 'prompt')

      expect(result).toBe('from-file')
      expect(mockExistsSync).toHaveBeenCalledWith('prompt.txt')
      expect(mockReadFileSync).toHaveBeenCalledWith('prompt.txt', 'utf-8')
    })

    it('uses inline input when file input is empty', () => {
      core.getInput.mockImplementation((name: string) => {
        if (name === 'prompt-file') return ''
        if (name === 'prompt') return 'from-inline'
        return ''
      })

      const result = loadContentFromFileOrInput('prompt-file', 'prompt')

      expect(result).toBe('from-inline')
      expect(mockExistsSync).not.toHaveBeenCalled()
    })

    it('throws when neither file nor inline input is set', () => {
      core.getInput.mockImplementation(() => '')

      expect(() => loadContentFromFileOrInput('prompt-file', 'prompt')).toThrow(
        'Neither prompt-file nor prompt was set',
      )
    })
  })

  describe('buildMessages', () => {
    it('builds from prompt config messages when provided', () => {
      const result = buildMessages({
        messages: [
          {role: 'system', content: 'system-message'},
          {role: 'user', content: 'user-message'},
        ],
      })

      expect(result).toEqual([
        {role: 'system', content: 'system-message'},
        {role: 'user', content: 'user-message'},
      ])
    })

    it('builds legacy messages and applies default system prompt', () => {
      const result = buildMessages(undefined, undefined, 'hello')

      expect(result).toEqual([
        {role: 'system', content: 'You are a helpful assistant'},
        {role: 'user', content: 'hello'},
      ])
    })
  })
})
