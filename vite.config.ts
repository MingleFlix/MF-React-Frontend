import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    cors: false,
    proxy: {
      '/api/user-management': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/api\/user-management/, ''),
        changeOrigin: true,
        secure: false,
      },
      '/api/room-management': {
        target: 'http://localhost:3001',
        rewrite: path => path.replace(/^\/api\/room-management/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
