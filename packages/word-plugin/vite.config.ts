import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * HTTP by default — works in any browser without cert warnings.
 * Enable HTTPS only for Word Desktop sideloading:
 *   set VITE_HTTPS=1 && npm run dev
 */
export default defineConfig(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extraPlugins: any[] = [];

  if (process.env.VITE_HTTPS === '1') {
    const { default: basicSsl } = await import('@vitejs/plugin-basic-ssl');
    extraPlugins.push(basicSsl());
  }

  return {
    plugins: [react(), ...extraPlugins],
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
  };
});
