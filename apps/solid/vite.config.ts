import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@infinite-canvas-x/canvas-app': path.resolve(
        __dirname,
        '../../packages/canvas-app/src/index.ts',
      ),
      '@infinite-canvas-x/canvas-engine': path.resolve(
        __dirname,
        '../../packages/canvas-engine/src/index.ts',
      ),
    },
  },
})
