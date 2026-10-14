import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiServerPlugin() {
  return {
    name: 'api-server-middleware',

    async configureServer(server) {
      const { default: expressApp } = await import('./server/index.js');
      server.middlewares.use(expressApp);
    },

    async configurePreviewServer(server) {
      const { default: expressApp } = await import('./server/index.js');
      server.middlewares.use(expressApp);
    }
  };
}

export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 800
  }
});
