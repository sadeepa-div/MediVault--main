import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API calls (/api, /uploads) are forwarded to the Express server during development.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1000 },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
