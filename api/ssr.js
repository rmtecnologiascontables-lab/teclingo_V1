const { createServer } = require('http');
const { readFileSync, existsSync } = require('fs');
const { join, extname } = require('path');

const serverBuild = join(__dirname, '../dist/server');
const clientBuild = join(__dirname, '../dist/client');

let handler;
try {
  handler = require(join(serverBuild, 'index.js')).handler;
} catch (e) {
  console.log('SSR handler not found, using static fallback');
  handler = null;
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

module.exports = async (req, res) => {
  const url = req.url || '/';
  
  if (handler) {
    try {
      const response = await handler({
        url,
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });
      
      if (response) {
        res.statusCode = response.status || 200;
        response.headers?.forEach((v, k) => res.setHeader(k, v));
        if (response.body) {
          res.end(response.body);
          return;
        }
      }
    } catch (e) {
      console.log('SSR error:', e.message);
    }
  }

  const filePath = join(clientBuild, url === '/' ? 'index.html' : url);
  const ext = extname(filePath);
  
  if (existsSync(filePath) && MIME_TYPES[ext]) {
    const content = readFileSync(filePath);
    res.setHeader('Content-Type', MIME_TYPES[ext] + '; charset=utf-8');
    res.end(content);
  } else {
    const indexPath = join(clientBuild, 'index.html');
    if (existsSync(indexPath)) {
      const content = readFileSync(indexPath);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(content);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  }
};