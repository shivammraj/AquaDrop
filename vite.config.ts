import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/AquaDrop/'

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? repoName : './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  // @ts-ignore
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'vscode-extension', 'extension']
  }
})
