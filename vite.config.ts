import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { aiApi } from './server/vitePlugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), aiApi()],
})
