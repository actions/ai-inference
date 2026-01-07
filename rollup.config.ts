// See: https://rollupjs.org/introduction/
import {builtinModules} from 'node:module'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
  },
  external: [...builtinModules, /^node:/],
  plugins: [
    typescript(),
    nodeResolve({
      preferBuiltins: true,
      browser: false,
      exportConditions: ['node'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    json(),
  ],
}

export default config
