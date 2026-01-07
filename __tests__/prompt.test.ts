import {describe, it, expect} from 'vitest'
import * as path from 'path'
import {fileURLToPath} from 'url'
import {
  parseTemplateVariables,
  replaceTemplateVariables,
  loadPromptFile,
  isPromptYamlFile,
  parseFileTemplateVariables,
} from '../src/prompt'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('prompt.ts', () => {
  describe('parseTemplateVariables', () => {
    it('should parse simple YAML variables', () => {
      const input = `
 a: hello
 b: world
      `
      const result = parseTemplateVariables(input)
      expect(result).toEqual({a: 'hello', b: 'world'})
    })

    it('should parse multiline variables', () => {
      const input = `
 var1: hello
 var2: |
   This is a
   multiline string
      `
      const result = parseTemplateVariables(input)
      expect(result.var1).toBe('hello')
      expect(result.var2).toContain('This is a')
      expect(result.var2).toContain('multiline string')
    })

    it('should return empty object for empty input', () => {
      const result = parseTemplateVariables('')
      expect(result).toEqual({})
    })

    it('should throw error for invalid YAML', () => {
      const input = 'invalid: yaml: content:'
      expect(() => parseTemplateVariables(input)).toThrow()
    })
  })

  describe('replaceTemplateVariables', () => {
    it('should replace simple variables', () => {
      const text = 'Hello {{name}}, welcome to {{place}}!'
      const variables = {name: 'John', place: 'GitHub'}
      const result = replaceTemplateVariables(text, variables)
      expect(result).toBe('Hello John, welcome to GitHub!')
    })

    it('should leave unreplaced variables as is', () => {
      const text = 'Hello {{name}}, welcome to {{unknown}}!'
      const variables = {name: 'John'}
      const result = replaceTemplateVariables(text, variables)
      expect(result).toBe('Hello John, welcome to {{unknown}}!')
    })

    it('should handle no variables', () => {
      const text = 'No variables here'
      const variables = {}
      const result = replaceTemplateVariables(text, variables)
      expect(result).toBe('No variables here')
    })
  })

  describe('isPromptYamlFile', () => {
    it('should detect .prompt.yml files', () => {
      expect(isPromptYamlFile('test.prompt.yml')).toBe(true)
      expect(isPromptYamlFile('path/to/test.prompt.yml')).toBe(true)
    })

    it('should detect .prompt.yaml files', () => {
      expect(isPromptYamlFile('test.prompt.yaml')).toBe(true)
      expect(isPromptYamlFile('path/to/test.prompt.yaml')).toBe(true)
    })

    it('should reject other file types', () => {
      expect(isPromptYamlFile('test.txt')).toBe(false)
      expect(isPromptYamlFile('test.yml')).toBe(false)
      expect(isPromptYamlFile('test.yaml')).toBe(false)
      expect(isPromptYamlFile('test.prompt')).toBe(false)
    })
  })

  describe('loadPromptFile', () => {
    it('should load simple prompt file', () => {
      const filePath = path.join(__dirname, '../__fixtures__/prompts/simple.prompt.yml')
      const variables = {a: 'cats', b: 'dogs'}
      const result = loadPromptFile(filePath, variables)

      expect(result.messages).toHaveLength(2)
      expect(result.messages[0]).toEqual({
        role: 'system',
        content: 'Be as concise as possible',
      })
      expect(result.messages[1]).toEqual({
        role: 'user',
        content: 'Compare cats and dogs, please',
      })
      expect(result.model).toBe('openai/gpt-4o')
    })

    it('should load JSON schema prompt file', () => {
      const filePath = path.join(__dirname, '../__fixtures__/prompts/json-schema.prompt.yml')
      const variables = {animal: 'dog'}
      const result = loadPromptFile(filePath, variables)

      expect(result.messages).toHaveLength(2)
      expect(result.messages[1].content).toContain('Describe a dog')
      expect(result.responseFormat).toBe('json_schema')
      expect(result.jsonSchema).toBeDefined()
      expect(result.jsonSchema).toContain('describe_animal')
    })

    it('should throw error for non-existent file', () => {
      expect(() => loadPromptFile('non-existent.prompt.yml')).toThrow('Prompt file not found')
    })
  })

  describe('parseFileTemplateVariables', () => {
    it('reads file contents for variables', () => {
      const configPath = path.join(__dirname, '../__fixtures__/prompts/json-schema.prompt.yml')
      const data = parseFileTemplateVariables(`sample: ${configPath}`)
      expect(data.sample).toContain('messages:')
      expect(data.sample).toContain('responseFormat:')
    })

    it('errors on missing files', () => {
      expect(() => parseFileTemplateVariables('x: ./does-not-exist.txt')).toThrow('was not found')
    })
  })
})
