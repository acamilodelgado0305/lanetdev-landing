import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://server-auth.app.la-net.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/finanzas': {
        target: 'https://ms-finanzas.app.la-net.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/finanzas/, ''),
      },
      '/wisphub-api': {
        target: 'https://api.wisphub.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/wisphub-api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['jwt-decode'],
  },
});
