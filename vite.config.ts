import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/Drink_water/' : './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
