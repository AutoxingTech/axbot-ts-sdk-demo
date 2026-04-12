import { Buffer } from 'node:buffer';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import httpProxy from 'http-proxy';

type ProxyState = {
  restBaseUrl: string;
  wsUrl: string;
  cookie: string;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeRestBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    url.hash = '';
    url.search = '';
    url.pathname = trimTrailingSlash(
      url.pathname.replace(/\/device\/info\/?$/, ''),
    );
    return url.toString();
  } catch {
    return trimTrailingSlash(trimmed.replace(/\/device\/info\/?$/, ''));
  }
}

function deriveWsUrl(restBaseUrl: string): string {
  if (!restBaseUrl) {
    return '';
  }

  try {
    const url = new URL(restBaseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const robotApiPrefixMatch = url.pathname.match(/^(\/robot_api\/v1\/[^/]+)/);
    url.pathname = robotApiPrefixMatch
      ? `${robotApiPrefixMatch[1]}/ws/v2/topics`
      : '/ws/v2/topics';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function robotProxyPlugin(): Plugin {
  const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    secure: false,
    ws: true,
  });

  const state: ProxyState = {
    restBaseUrl: '',
    wsUrl: '',
    cookie: '',
  };

  proxy.on('error', (error, _req, res) => {
    if (res && 'writeHead' in res) {
      const response = res as ServerResponse;
      if (!response.headersSent) {
        sendJson(response, 502, { error: error.message });
      }
      return;
    }

    if (res && 'destroy' in res && typeof res.destroy === 'function') {
      res.destroy(error);
    }
  });

  return {
    name: 'robot-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/__robot/config', async (req, res, next) => {
        if (req.method === 'GET') {
          sendJson(res, 200, {
            restBaseUrl: state.restBaseUrl,
            wsUrl: state.wsUrl,
            hasCookie: Boolean(state.cookie),
          });
          return;
        }

        if (req.method !== 'POST') {
          next();
          return;
        }

        try {
          const body = await readBody(req);
          const parsed = body ? JSON.parse(body) : {};
          state.restBaseUrl = normalizeRestBaseUrl(parsed.restBaseUrl ?? '');
          state.wsUrl =
            (parsed.wsUrl ?? '').trim() || deriveWsUrl(state.restBaseUrl);
          state.cookie = (parsed.cookie ?? '').trim();

          sendJson(res, 200, {
            ok: true,
            restBaseUrl: state.restBaseUrl,
            wsUrl: state.wsUrl,
            hasCookie: Boolean(state.cookie),
          });
        } catch (error) {
          sendJson(res, 400, {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to parse proxy config.',
          });
        }
      });

      server.middlewares.use('/robot-api', (req, res) => {
        if (!state.restBaseUrl) {
          sendJson(res, 503, {
            error: 'Robot REST base URL is not configured.',
          });
          return;
        }

        const originalUrl = req.originalUrl ?? req.url ?? '/';
        const requestPath = originalUrl.replace(/^\/robot-api/, '') || '/';
        const target = new URL(
          state.restBaseUrl.endsWith('/')
            ? state.restBaseUrl
            : `${state.restBaseUrl}/`,
        );
        const resolved = new URL(requestPath.replace(/^\//, ''), target);
        req.url = `${resolved.pathname}${resolved.search}`;

        if (state.cookie) {
          req.headers.cookie = state.cookie;
        }

        proxy.web(req, res, {
          target: `${resolved.protocol}//${resolved.host}`,
        });
      });

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (!req.url?.startsWith('/robot-ws')) {
          return;
        }

        socket.on('error', () => {
          socket.destroy();
        });

        if (!state.wsUrl) {
          socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
          socket.destroy();
          return;
        }

        const target = new URL(state.wsUrl);
        req.url = `${target.pathname}${target.search}`;
        if (state.cookie) {
          req.headers.cookie = state.cookie;
        }

        proxy.ws(req, socket, head, {
          target: `${target.protocol}//${target.host}`,
          headers: state.cookie ? { cookie: state.cookie } : undefined,
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), robotProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 6173,
  },
});
