import { defineConfig, loadEnv } from 'vite';
import compression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_APP_BASE_PATH || './';

  return {
    base: basePath,
    plugins: [
      react(),
      compression({ algorithm: 'brotliCompress', apply: 'build', deleteOriginFile: false }),
      compression({ algorithm: 'gzip', apply: 'build', deleteOriginFile: false })
    ],
    server: {
      host: true,
      port: 5173
    },
    preview: {
      host: true,
      port: 5173
    },
    build: {
      assetsDir: 'assets',
      assetsInlineLimit: 0,
      emptyOutDir: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three']
          }
        }
      },
      esbuild: {
        drop: ['console', 'debugger']
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    }
  };
});
