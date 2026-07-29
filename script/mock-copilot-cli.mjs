#!/usr/bin/env node

const promptIndex = process.argv.indexOf('-p')
const prompt = promptIndex >= 0 ? process.argv[promptIndex + 1] : ''

process.stdout.write(`Mock response to: "${prompt.slice(0, 50)}..."`)
