import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Mafia-Game/',  // <--- هذا السطر هو الأهم! بدونه الشاشة ستكون بيضاء
  server: {
    host: true
  }
})
