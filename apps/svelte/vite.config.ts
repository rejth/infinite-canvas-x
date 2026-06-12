import path from 'path'

import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
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
