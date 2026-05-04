const serverPath = require.resolve('./server-build.js');

let handler;
try {
  const server = require(serverPath);
  handler = server.handler || server.default?.handler;
} catch (e) {
  console.log('Loading SSR handler:', e.message);
}

const path = require('path');
const fs = require('fs');

const clientDir = path.join(__dirname, '../dist/client');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

module.exports = async (req, res) => {
  const url = req.url || '/';
  
  if (handler) {
    try {
      const response = await handler({
        request: req,
        url,
        method: req.method,
        headers: req.headers,
      });
      
      if (response) {
        res.statusCode = response.status || 200;
        if (response.headers) {
          Object.entries(response.headers).forEach(([k, v]) => res.setHeader(k, v));
        }
        if (response.body) {
          res.end(response.body);
          return;
        }
      }
    } catch (e) {
      console.log('SSR Error:', e.message);
    }
  }

  let filePath = path.join(clientDir, url === '/' ? 'index.html' : url);
  
  if (!fs.existsSync(filePath) || !MIME_TYPES[path.extname(filePath)]) {
    filePath = path.join(clientDir, 'index.html');
  }
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'text/plain');
    res.end(fs.readFileSync(filePath));
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
};