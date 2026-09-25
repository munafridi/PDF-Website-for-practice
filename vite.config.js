import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

base: '/PDF-Website-for-practice/'

export default defineConfig({
  base: './',
  plugins: [react()],
})
