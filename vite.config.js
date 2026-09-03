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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 5173
  }
});
