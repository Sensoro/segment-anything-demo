import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/segment-anything-demo/',
  resolve: {
    alias: [
      {
        find: /^onnxruntime-web/,
        replacement: path.join(__dirname, 'node_modules/onnxruntime-web'),
      }
    ]
  },
  plugins: [
    react(),
    viteExternalsPlugin({}),
  ],
  define: {
    'process.env': {},
  },
  server: {
    open: true,
  },
});
