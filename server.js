import express from 'express';
import http from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const server = http.createServer(app);

app.use('/service/', (req, res) => {
  const targetUrl = decodeURIComponent(req.url.replace(/^\//, ''));
  if (!targetUrl) return res.status(400).send('No target URL provided');

  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    onProxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
    }
  });

  return proxy(req, res, (err) => {
    if (err) res.status(500).send('Proxy Error');
  });
});

app.get('/', (req, res) => { res.send('Quantum Proxy is Live!'); });
server.listen(process.env.PORT || 8080);
