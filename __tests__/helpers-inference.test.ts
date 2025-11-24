import {describe, it, expect} from 'vitest'
import {buildMessages, buildResponseFormat, buildInferenceRequest} from '../src/helpers'
import {PromptConfig} from '../src/prompt'

describe('helpers.ts - inference request building', () => {
  describe('buildMessages', () => {
    it('should build messages from prompt config', () => {
      const promptConfig: PromptConfig = {
        messages: [
          {role: 'system', content: 'System message'},
          {role: 'user', content: 'User message'},
        ],
      }

      const result = buildMessages(promptConfig)
      expect(result).toEqual([
        {role: 'system', content: 'System message'},
        {role: 'user', content: 'User message'},
      ])
    })

    it('should build messages from legacy format', () => {
      const result = buildMessages(undefined, 'System prompt', 'User prompt')
      expect(result).toEqual([
        {role: 'system', content: 'System prompt'},
        {role: 'user', content: 'User prompt'},
      ])
    })

    it('should use default system prompt when none provided', () => {
      const result = buildMessages(undefined, undefined, 'User prompt')
      expect(result).toEqual([
        {role: 'system', content: 'You are a helpful assistant'},
        {role: 'user', content: 'User prompt'},
      ])
    })
  })

  describe('buildResponseFormat', () => {
    it('should build JSON schema response format', () => {
      const promptConfig: PromptConfig = {
        messages: [],
        responseFormat: 'json_schema',
        jsonSchema: JSON.stringify({
          name: 'test_schema',
          schema: {type: 'object'},
        }),
      }

      const result = buildResponseFormat(promptConfig)
      expect(result).toEqual({
        type: 'json_schema',
        json_schema: {
          name: 'test_schema',
          schema: {type: 'object'},
        },
      })
    })

    it('should return undefined for text format', () => {
      const promptConfig: PromptConfig = {
        messages: [],
        responseFormat: 'text',
      }

      const result = buildResponseFormat(promptConfig)
      expect(result).toBeUndefined()
    })

    it('should return undefined when no response format specified', () => {
      const promptConfig: PromptConfig = {
        messages: [],
      }

      const result = buildResponseFormat(promptConfig)
      expect(result).toBeUndefined()
    })

    it('should throw error for invalid JSON schema', () => {
      const promptConfig: PromptConfig = {
        messages: [],
        responseFormat: 'json_schema',
        jsonSchema: 'invalid json',
      }

      expect(() => buildResponseFormat(promptConfig)).toThrow('Invalid JSON schema')
    })
  })

  describe('buildInferenceRequest', () => {
    it('should build complete inference request from prompt config', () => {
      const promptConfig: PromptConfig = {
        messages: [
          {role: 'system', content: 'System message'},
          {role: 'user', content: 'User message'},
        ],
        responseFormat: 'json_schema',
        jsonSchema: JSON.stringify({
          name: 'test_schema',
          schema: {type: 'object'},
        }),
      }

      const result = buildInferenceRequest(
        promptConfig,
        undefined,
        undefined,
        'gpt-4',
        undefined,
        undefined,
        100,
        'https://api.test.com',
        'test-token',
      )

      expect(result).toEqual({
        messages: [
          {role: 'system', content: 'System message'},
          {role: 'user', content: 'User message'},
        ],
        modelName: 'gpt-4',
        temperature: undefined,
        topP: undefined,
        maxTokens: 100,
        endpoint: 'https://api.test.com',
        token: 'test-token',
        responseFormat: {
          type: 'json_schema',
          json_schema: {
            name: 'test_schema',
            schema: {type: 'object'},
          },
        },
      })
    })

    it('should build inference request from legacy format', () => {
      const result = buildInferenceRequest(
        undefined,
        'System prompt',
        'User prompt',
        'gpt-4',
        undefined,
        undefined,
        100,
        'https://api.test.com',
        'test-token',
      )

      expect(result).toEqual({
        messages: [
          {role: 'system', content: 'System prompt'},
          {role: 'user', content: 'User prompt'},
        ],
        modelName: 'gpt-4',
        temperature: undefined,
        topP: undefined,
        maxTokens: 100,
        endpoint: 'https://api.test.com',
        token: 'test-token',
        responseFormat: undefined,
      })
    })
  })
})
