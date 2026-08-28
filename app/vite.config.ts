import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  // Serve the shared image library (../assets) as static files, so the React app
  // and the plain-HTML build in the repo root use one copy of every asset.
  publicDir: fileURLToPath(new URL('../assets', import.meta.url)),
  // Relative base keeps the build portable: works at a domain root or under a
  // GitHub Pages project subpath without rebuilding.
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
});
