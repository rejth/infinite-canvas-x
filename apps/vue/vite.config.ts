import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
