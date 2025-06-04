import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/FlowMusic/", // This is correct for your GitHub Pages deployment
  server: {
    proxy: {
      // Requests to /api/... will be proxied
      '/api': {
        target: 'https://api.deezer.com', // The target API
        changeOrigin: true, // Recommended for most cases
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix before sending to target
      },
    }
  }
})
