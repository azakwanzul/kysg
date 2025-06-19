import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kysg/', // This matches your repository name
  server: {
    port: 3000,
    open: true
  }
}) 