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
  server: {
    port: 3000,
    https: true, // Required for Office Add-ins
    cors: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        taskpane: resolve(__dirname, 'index.html'),
      },
    },
  },
});
