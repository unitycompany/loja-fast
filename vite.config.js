import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use BASE_PATH when building for GitHub Pages (e.g., "/loja-fast/")
  base: process.env.BASE_PATH || '/',
})
