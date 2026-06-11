import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = filePath.split('?')[0];
  filePath = resolve(__dirname, filePath.slice(1));

  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'text/plain';

  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
