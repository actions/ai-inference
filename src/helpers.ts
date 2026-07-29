import * as core from '@actions/core'
import * as fs from 'fs'
import {PromptConfig} from './prompt.js'

/**
 * Force-exit the process to avoid hanging on open connections.
 *
 * On Windows, briefly yield first so undici can finish closing TLS sockets;
 * otherwise the process aborts with a libuv UV_HANDLE_CLOSING assertion in
 * `src\win\async.c`. See https://github.com/nodejs/node/issues/56645.
 *
 * @param code - The exit code to pass to `process.exit`.
 */
export async function safeExit(code: number): Promise<never> {
  if (process.platform === 'win32') {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  process.exit(code)
}

/**
 * Helper function to load content from a file or use fallback input
 * @param filePathInput - Input name for the file path
 * @param contentInput - Input name for the direct content
 * @param defaultValue - Default value to use if neither file nor content is provided
 * @returns The loaded content
 */
export function loadContentFromFileOrInput(filePathInput: string, contentInput: string, defaultValue?: string): string {
  const filePath = core.getInput(filePathInput)
  const contentString = core.getInput(contentInput)

  if (filePath !== undefined && filePath !== '') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File for ${filePathInput} was not found: ${filePath}`)
    }
    return fs.readFileSync(filePath, 'utf-8')
  } else if (contentString !== undefined && contentString !== '') {
    return contentString
  } else if (defaultValue !== undefined) {
    return defaultValue
  } else {
    throw new Error(`Neither ${filePathInput} nor ${contentInput} was set`)
  }
}

/**
 * Build messages array from either prompt config or legacy format
 */
export function buildMessages(
  promptConfig?: PromptConfig,
  systemPrompt?: string,
  prompt?: string,
): Array<{role: 'system' | 'user' | 'assistant' | 'tool'; content: string}> {
  if (promptConfig?.messages && promptConfig.messages.length > 0) {
    // Use new message format
    return promptConfig.messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
      content: msg.content,
    }))
  } else {
    // Use legacy format
    return [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful assistant',
      },
      {role: 'user', content: prompt || ''},
    ]
  }
}
