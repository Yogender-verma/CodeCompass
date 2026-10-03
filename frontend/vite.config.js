import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Load environment variables from the root CodeCompass/ directory (.env, .env.example)
  envDir: path.resolve(__dirname, '..'),
  server: {
    port: 5173,
  },
})
