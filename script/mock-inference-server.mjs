#!/usr/bin/env node
/**
 * A simple mock OpenAI-compatible inference server for CI testing.
 * This returns predictable responses without needing real API credentials.
 */

import http from 'http'

const PORT = process.env.MOCK_SERVER_PORT || 3456

const server = http.createServer((req, res) => {
  let body = ''

  req.on('data', chunk => {
    body += chunk.toString()
  })

  req.on('end', () => {
    console.log(`[Mock Server] ${req.method} ${req.url}`)

    // Handle chat completions endpoint
    if (req.url === '/chat/completions' && req.method === 'POST') {
      const request = JSON.parse(body)
      const userMessage = request.messages?.find(m => m.role === 'user')?.content || 'No prompt'

      const response = {
        id: 'mock-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: request.model || 'mock-model',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: `Mock response to: "${userMessage.slice(0, 50)}..."`,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }

      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify(response))
      return
    }

    // Health check endpoint
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({status: 'ok'}))
      return
    }

    // 404 for unknown routes
    res.writeHead(404, {'Content-Type': 'application/json'})
    res.end(JSON.stringify({error: 'Not found'}))
  })
})

server.listen(PORT, () => {
  console.log(`[Mock Server] Listening on http://localhost:${PORT}`)
  console.log('[Mock Server] Endpoints:')
  console.log('  POST /chat/completions - Mock chat completion')
  console.log('  GET  /health           - Health check')
})
