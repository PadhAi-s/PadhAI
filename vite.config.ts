import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from https://<user>.github.io/padhAi/
  // so every asset URL must be built relative to that subpath.
  // Update this if the repository is renamed.
  base: '/padhai/',
  plugins: [react(), tailwindcss()],
})
