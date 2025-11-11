import { defineConfig, loadEnv } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_APP_BASE_PATH || './';

  return {
    base: basePath,
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react'
    },
    plugins: [
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
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
        drop: ['console', 'debugger']
      }
    }
  };
});
