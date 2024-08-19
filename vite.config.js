import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {  // Ruta para la primera API
        target: 'http://server-auth.app.la-net.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
      '/api/finanzas': {  // Ruta para la segunda API
        target: 'http://ms-finanzas.app.la-net.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/finanzas/, ''),
      },
    },
  },
})

