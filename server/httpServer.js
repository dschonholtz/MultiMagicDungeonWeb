// Static file server for MultiMagicDungeonWeb
// Run: node server/httpServer.js
// Serves index.html and static assets from project root on port 3000

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseUrl } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = parseInt(process.env.HTTP_PORT || '3000', 10);

const MIMES = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.md':   'text/plain',
};

http.createServer((req, res) => {
  const pathname = parseUrl(req.url).pathname;
  const file = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  // Prevent path traversal outside ROOT
  if (!file.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ct = MIMES[path.extname(file)] || 'text/plain';
    res.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`HTTP server on http://localhost:${PORT}`));
