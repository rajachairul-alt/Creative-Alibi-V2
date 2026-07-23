import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@creative-alibi/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  // GitHub Pages deploys to /Creative-Alibi-V2/ — set base accordingly
  base: process.env.GITHUB_PAGES === '1' ? '/Creative-Alibi-V2/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react','react-dom','react-router-dom'],
          charts:   ['recharts'],
          pdf:      ['jspdf','html2canvas'],
        },
      },
    },
  },
});
