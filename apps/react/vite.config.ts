import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
