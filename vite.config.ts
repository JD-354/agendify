import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4173,
    host: '0.0.0.0', 
  },
  preview: {
    allowedHosts: ['gestion-eventos-f.onrender.com'], 
  }
  
})
