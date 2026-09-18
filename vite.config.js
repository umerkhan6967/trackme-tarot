import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173
    },
    plugins: [
      {
        name: 'local-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/fortune' && req.method === 'POST') {
              try {
                // Read request body
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                req.body = body ? JSON.parse(body) : {};

                // Load handler dynamically
                process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                const { default: handler } = await import('./api/fortune.js');

                const mockRes = {
                  statusCode: 200,
                  headers: {},
                  setHeader(k, v) { this.headers[k] = v; return this; },
                  status(code) { this.statusCode = code; return this; },
                  json(data) {
                    res.statusCode = this.statusCode;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  }
                };

                await handler(req, mockRes);
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, fallback: true }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  };
});
