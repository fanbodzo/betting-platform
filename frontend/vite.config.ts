import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Twój port frontu
    proxy: {
      '/api': {
        target: 'http://host.docker.internal:9000', // <-- Adres Gatewaya
        changeOrigin: true,
        secure: false,
      },
    },
  },
})