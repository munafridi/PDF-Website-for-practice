import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: '/PDF-Website-for-practice/',
  plugins: [react()],
})
