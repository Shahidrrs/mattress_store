import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Your live backend URL: https://mattress-store-ig3e.onrender.com

export default defineConfig({
  plugins: [react()],
  server: {
    // This setting tells Vite to proxy requests starting with /api
    proxy: {
      '/api': {
        target: 'https://mattress-store-ig3e.onrender.com', // Your Deployed Backend URL
        changeOrigin: true, // Required for cross-origin hosting
        secure: true,       // Since the backend is HTTPS
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Retain the /api path prefix
      },
    },
    // Set host to true so it works correctly in the Docker/Render container
    host: true,
  },
});
