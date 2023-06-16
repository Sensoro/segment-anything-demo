import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/segment-anything-demo/',
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
