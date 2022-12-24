import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
      },
    },
  },
  build: {
    target: 'es2015',
  },
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
});
