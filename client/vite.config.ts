import { defineConfig } from 'vite'
import React from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://chama-savings-app.onrender.com',
        changeOrigin: true
      }
    }
  }
})
