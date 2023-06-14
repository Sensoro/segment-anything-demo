import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/segment-anything/',
  plugins: [
    react(),
    viteExternalsPlugin({
      'onnxruntime-web': 'ort'
    })
  ],
  define: {
    'process.env': {},
  },
  server: {
    open: true,
  },
});
