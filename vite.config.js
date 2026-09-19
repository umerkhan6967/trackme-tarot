import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  server: {
    port: 5173
  },
  plugins: [
    {
      name: 'api-dev-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api/ping')) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: true, timestamp: Date.now() }));
            return;
          }
          if (req.url && req.url.startsWith('/api/network')) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.statusCode = 200;
            res.end(JSON.stringify({ country: null }));
            return;
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        teams: resolve(__dirname, 'teams/index.html')
      }
    }
  }
});

