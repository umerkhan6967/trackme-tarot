import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    base: '/',
    server: {
      port: 5173
    },
    plugins: [
      {
        name: 'api-dev-middleware',
        configureServer(server) {
          function wrapResponse(res) {
            res.status = function(code) {
              res.statusCode = code;
              return res;
            };
            res.json = function(data) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
              return res;
            };
            return res;
          }

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
            if (req.url && req.url.startsWith('/api/fortune')) {
              wrapResponse(res);
              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch (e) {
                  req.body = {};
                }
                try {
                  const fortuneModule = await import('./api/fortune.js');
                  await fortuneModule.default(req, res);
                } catch (err) {
                  console.error('[vite dev] /api/fortune error:', err);
                  if (!res.headersSent) {
                    res.status(500).json({ error: 'Fortune internal error: ' + err.message });
                  }
                }
              });
              return;
            }
            if (req.url && req.url.startsWith('/api/oracle')) {
              wrapResponse(res);
              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch (e) {
                  req.body = {};
                }
                try {
                  const oracleModule = await import('./api/oracle.js');
                  await oracleModule.default(req, res);
                } catch (err) {
                  console.error('[vite dev] /api/oracle error:', err);
                  if (!res.headersSent) {
                    res.status(500).json({ error: 'Oracle internal error: ' + err.message });
                  }
                }
              });
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
  };
});
