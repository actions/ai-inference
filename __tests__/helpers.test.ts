import {vi, it, expect, beforeEach, describe} from 'vitest'
import * as core from '../__fixtures__/core.js'

const mockExistsSync = vi.fn()
const mockReadFileSync = vi.fn()

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  readFileSync: mockReadFileSync,
}))

vi.mock('@actions/core', () => core)

const {loadContentFromFileOrInput} = await import('../src/helpers.js')

describe('helpers.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadContentFromFileOrInput', () => {
    it('loads content from file when file path is provided', () => {
      const filePath = '/path/to/file.txt'
      const fileContent = 'File content here'

      core.getInput.mockImplementation((name: string) => {
        if (name === 'file-input') return filePath
        if (name === 'content-input') return ''
        return ''
      })

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)

      const result = loadContentFromFileOrInput('file-input', 'content-input')

      expect(core.getInput).toHaveBeenCalledWith('file-input')
      expect(mockExistsSync).toHaveBeenCalledWith(filePath)
      expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf-8')
      expect(result).toBe(fileContent)
    })

    it('throws error when file path is provided but file does not exist', () => {
      const filePath = '/path/to/nonexistent.txt'

      core.getInput.mockImplementation((name: string) => {
        if (name === 'file-input') return filePath
        if (name === 'content-input') return ''
        return ''
      })

      mockExistsSync.mockReturnValue(false)

      expect(() => {
        loadContentFromFileOrInput('file-input', 'content-input')
      }).toThrow('File for file-input was not found: /path/to/nonexistent.txt')

      expect(mockExistsSync).toHaveBeenCalledWith(filePath)
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('uses content input when file path is empty', () => {
      const contentInput = 'Direct content input'

      core.getInput.mockImplementation((name: string) => {
        if (name === 'file-input') return ''
        if (name === 'content-input') return contentInput
        return ''
      })

      const result = loadContentFromFileOrInput('file-input', 'content-input')

      expect(core.getInput).toHaveBeenCalledWith('file-input')
      expect(core.getInput).toHaveBeenCalledWith('content-input')
      expect(mockExistsSync).not.toHaveBeenCalled()
      expect(mockReadFileSync).not.toHaveBeenCalled()
      expect(result).toBe(contentInput)
    })

    it('prefers file path over content input when both are provided', () => {
      const filePath = '/path/to/file.txt'
      const fileContent = 'File content'
      const contentInput = 'Direct content input'

      core.getInput.mockImplementation((name: string) => {
        if (name === 'file-input') return filePath
        if (name === 'content-input') return contentInput
        return ''
      })

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)

      const result = loadContentFromFileOrInput('file-input', 'content-input')

      expect(result).toBe(fileContent)
      expect(mockExistsSync).toHaveBeenCalledWith(filePath)
      expect(mockReadFileSync).toHaveBeenCalledWith(filePath, 'utf-8')
    })

    it('uses default value when neither file nor content is provided', () => {
      const defaultValue = 'Default content'

      core.getInput.mockImplementation(() => '')

      const result = loadContentFromFileOrInput('file-input', 'content-input', defaultValue)

      expect(result).toBe(defaultValue)
      expect(mockExistsSync).not.toHaveBeenCalled()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('throws error when neither file nor content is provided and no default', () => {
      core.getInput.mockImplementation(() => '')

      expect(() => {
        loadContentFromFileOrInput('file-input', 'content-input')
      }).toThrow('Neither file-input nor content-input was set')

      expect(mockExistsSync).not.toHaveBeenCalled()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('handles undefined inputs correctly', () => {
      const defaultValue = 'Default content'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      core.getInput.mockImplementation(() => undefined as any)

      const result = loadContentFromFileOrInput('file-input', 'content-input', defaultValue)

      expect(result).toBe(defaultValue)
    })
  })
})
