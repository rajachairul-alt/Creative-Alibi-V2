import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

/**
 * HTTPS is enabled via @vitejs/plugin-basic-ssl so that the Word desktop
 * client (which requires HTTPS) can sideload the add-in from localhost:3000.
 * Word Online works with both HTTP and HTTPS on localhost.
 *
 * To run without HTTPS (e.g. in a CI/headless environment):
 *   VITE_NO_HTTPS=1 npm run dev
 */
const useHttps = process.env.VITE_NO_HTTPS !== '1';

export default defineConfig({
  plugins: [
    react(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@creative-alibi/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 3000,
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
