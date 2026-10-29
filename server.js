/**
 * server.js - Campus Lost-and-Found Portal Web Server
 * Built with Plain Node.js using the built-in 'http', 'fs', 'path', and 'url' modules.
 * Strictly NO Express or external web frameworks.
 *
 * REFERENCES:
 * Node.js HTTP:
 * https://nodejs.org/api/http.html
 *
 * Node.js File System:
 * https://nodejs.org/api/fs.html
 *
 * Node.js Path:
 * https://nodejs.org/api/path.html
 *
 * Node.js URL:
 * https://nodejs.org/api/url.html
 *
 * Node.js Crypto:
 * https://nodejs.org/api/crypto.html
 *
 * Node.js Buffer:
 * https://nodejs.org/api/buffer.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const db = require('./db');

// REFERENCE: Node.js process.env
// https://nodejs.org/api/process.html#processenv

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// REFERENCE: Node.js fs.existsSync() and fs.mkdirSync()
// https://nodejs.org/api/fs.html#fsexistssyncpath
// https://nodejs.org/api/fs.html#fsmkdirsyncpath-options
//
// Create the public and uploads directories if they do not exist.

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// REFERENCE: MDN MIME types
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types
//
// REFERENCE: HTTP Content-Type header
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type
//
// Map file extensions to their MIME content types.

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

/**
 * Helper to send JSON responses.
 *
 * REFERENCES:
 * Node.js response.writeHead():
 * https://nodejs.org/api/http.html#responsewriteheadstatuscode-statusmessage-headers
 *
 * Node.js response.end():
 * https://nodejs.org/api/http.html#responseenddata-encoding-callback
 *
 * JavaScript JSON.stringify():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 *
 * CORS:
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  res.end(JSON.stringify(data));
}

/**
 * Helper to parse JSON request bodies.
 *
 * REFERENCES:
 * Node.js HTTP request events:
 * https://nodejs.org/api/http.html#class-httpincomingmessage
 *
 * Node.js Streams:
 * https://nodejs.org/api/stream.html
 *
 * JavaScript Promises:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *
 * JavaScript JSON.parse():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;

      // REFERENCE: Node.js HTTP request body handling
      // https://nodejs.org/api/http.html#class-httpincomingmessage
      //
      // Safeguard against oversized payloads (limit 15MB for base64 images).

      if (body.length > 15 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });

    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        // REFERENCE: JSON.parse()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format in request body'));
      }
    });

    req.on('error', err => reject(err));
  });
}

/**
 * Saves base64 image data to the /uploads directory and returns relative URL.
 *
 * REFERENCES:
 * JavaScript String.startsWith():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
 *
 * JavaScript String.match() and regular expressions:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
 *
 * Node.js Buffer:
 * https://nodejs.org/api/buffer.html
 *
 * Node.js Crypto:
 * https://nodejs.org/api/crypto.html
 *
 * Node.js fs.writeFileSync():
 * https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options
 */
function saveBase64Image(base64String) {
  if (!base64String || !base64String.startsWith('data:image/')) {
    return base64String;
  }

  try {
    // REFERENCE: Regular expressions
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions

    const matches = base64String.match(
      /^data:image\/([A-Za-z0-9+]+);base64,(.+)$/
    );

    if (!matches || matches.length !== 3) {
      return base64String;
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];

    // REFERENCE: Buffer.from()
    // https://nodejs.org/api/buffer.html#static-method-bufferfromstring-encoding

    const dataBuffer = Buffer.from(matches[2], 'base64');

    // REFERENCE: Crypto randomBytes()
    // https://nodejs.org/api/crypto.html#cryptorandombytessize-callback

    const filename = `item-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // REFERENCE: Node.js fs.writeFileSync()
    // https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options

    fs.writeFileSync(filePath, dataBuffer);

    return `/uploads/${filename}`;

  } catch (err) {
    console.error('[Upload Error] Failed to write base64 image:', err);
    return base64String;
  }
}

/**
 * Serves static files from the ./public directory.
 *
 * REFERENCES:
 * Node.js File System:
 * https://nodejs.org/api/fs.html
 *
 * Node.js Path:
 * https://nodejs.org/api/path.html
 *
 * Node.js Streams:
 * https://nodejs.org/api/stream.html
 *
 * HTTP status codes:
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
 */
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname;

  // REFERENCE: path.normalize()
  // https://nodejs.org/api/path.html#pathnormalizepath
  //
  // Normalize the path and attempt to prevent directory traversal.

  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  // REFERENCE: path.join() and path.resolve()
  // https://nodejs.org/api/path.html#pathjoinpaths
  // https://nodejs.org/api/path.html#pathresolvepaths
  //
  // Security check: ensure the resolved file path stays inside PUBLIC_DIR.

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden: Access Denied');
  }

  // REFERENCE: fs.stat()
  // https://nodejs.org/api/fs.html#fsstatpath-options-callback
  //
  // REFERENCE: fs.createReadStream()
  // https://nodejs.org/api/fs.html#fscreatereadstreampath-options

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // REFERENCE: HTTP 404 Not Found
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404

      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });

      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>404 Not Found - Campus Lost & Found</title>
          <!-- REFERENCE: Bootstrap CSS -->
          <!-- https://getbootstrap.com/docs/5.3/getting-started/introduction/ -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
        </head>
        <body class="bg-light d-flex align-items-center justify-content-center min-vh-100">
          <div class="text-center p-5 bg-white rounded shadow-sm">
            <h1 class="display-4 text-primary">404</h1>
            <h4 class="mb-3">Resource Not Found</h4>
            <p class="text-muted">The requested page or asset does not exist on this portal.</p>
            <a href="/" class="btn btn-primary mt-3">Return to Portal Home</a>
          </div>
        </body>
        </html>
      `);
    }

    // REFERENCE: path.extname()
    // https://nodejs.org/api/path.html#pathextnamepath

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // REFERENCE: HTTP Cache-Control header
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    // REFERENCE: Node.js readable streams and pipe()
    // https://nodejs.org/api/stream.html
    // https://nodejs.org/api/stream.html#readablepipedestination-options

    const stream = fs.createReadStream(filePath);

    stream.on('error', streamErr => {
      console.error('[Stream Error]', streamErr);

      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    });

    stream.pipe(res);
  });
}

/**
 * Main HTTP Server Request Listener.
 *
 * REFERENCES:
 * Node.js HTTP server:
 * https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
 *
 * Node.js URL parsing:
 * https://nodejs.org/api/url.html
 *
 * JavaScript async functions:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */
const server = http.createServer(async (req, res) => {
  // REFERENCE: url.parse()
  // https://nodejs.org/api/url.html#urlparseurlstring-parsequerystring-slashesdenotehost

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // REFERENCE: HTTP request methods
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
  //
  // Handle CORS preflight OPTIONS requests.
  // REFERENCE: CORS preflight requests
  // https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    return res.end();
  }

  // -------------------------------------------------------------
  // REST API ROUTING (/api/*)
  //
  // REFERENCE: REST concepts
  // https://developer.mozilla.org/en-US/docs/Glossary/REST
  //
  // REFERENCE: HTTP request methods
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
  // -------------------------------------------------------------

  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/categories
      // REFERENCE: HTTP GET method
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET

      if (pathname === '/api/categories' && method === 'GET') {
        const categories = await db.getCategories();

        return sendJSON(res, 200, {
          success: true,
          data: categories
        });
      }

      // 2. GET /api/stats (Dashboard statistics)
      // REFERENCE: HTTP GET method
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET

      if (pathname === '/api/stats' && method === 'GET') {
        const stats = await db.getStats();

        return sendJSON(res, 200, {
          success: true,
          data: stats
        });
      }

      // 3. GET /api/items (List items with optional filters)
      // REFERENCE: URL query parameters
      // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

      if (pathname === '/api/items' && method === 'GET') {
        const items = await db.getItems(parsedUrl.query);

        return sendJSON(res, 200, {
          success: true,
          count: items.length,
          data: items
        });
      }

      // 4. POST /api/items (Create new report)
      // REFERENCE: HTTP POST method
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST

      if (pathname === '/api/items' && method === 'POST') {
        const body = await parseRequestBody(req);

        // REFERENCE: JavaScript Array.filter()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
        //
        // Validate required fields before creating a report.

        const required = [
          'title', 'category', 'item_type', 'description',
          'location_name', 'date_occurred', 'contact_name', 'contact_email'
        ];

        const missing = required.filter(
          f => !body[f] || !String(body[f]).trim()
        );

        if (missing.length > 0) {
          return sendJSON(res, 400, {
            success: false,
            error: `Missing required fields: ${missing.join(', ')}`
          });
        }

        // REFERENCE: JavaScript regular expressions
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
        //
        // Basic email-format validation.

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Invalid contact email format.'
          });
        }

        // Save image if uploaded as base64.
        // REFERENCE: Base64 encoding
        // https://developer.mozilla.org/en-US/docs/Glossary/Base64

        if (body.image_url && body.image_url.startsWith('data:image/')) {
          body.image_url = saveBase64Image(body.image_url);
        }

        // REFERENCE: Calling database module functions
        // See the project's ./db.js module.

        const createdItem = await db.createItem(body);

        return sendJSON(res, 201, {
          success: true,
          message: 'Report created successfully.',
          data: createdItem
        });
      }

      // 5. POST /api/upload (Direct image upload)
      // REFERENCE: HTTP POST method
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST
      //
      // REFERENCE: Base64 encoding
      // https://developer.mozilla.org/en-US/docs/Glossary/Base64

      if (pathname === '/api/upload' && method === 'POST') {
        const body = await parseRequestBody(req);

        if (!body.image || !body.image.startsWith('data:image/')) {
          return sendJSON(res, 400, {
            success: false,
            error: 'Expected base64 image string.'
          });
        }

        const fileUrl = saveBase64Image(body.image);

        return sendJSON(res, 200, {
          success: true,
          url: fileUrl
        });
      }

      // 6. Routes with IDs: /api/items/:id and /api/items/:id/status
      //
      // REFERENCE: JavaScript String.match() and regular expressions
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
      //
      // REFERENCE: parseInt()
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt

      const itemMatch = pathname.match(/^\/api\/items\/(\d+)(?:\/(status))?$/);

      if (itemMatch) {
        const id = parseInt(itemMatch[1], 10);
        const subAction = itemMatch[2];

        // GET /api/items/:id
        // REFERENCE: HTTP GET
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET

        if (method === 'GET' && !subAction) {
          const item = await db.getItemById(id);

          if (!item) {
            return sendJSON(res, 404, {
              success: false,
              error: `Item #${id} not found.`
            });
          }

          return sendJSON(res, 200, {
            success: true,
            data: item
          });
        }

        // PUT /api/items/:id/status
        // REFERENCE: HTTP PUT method
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT

        if (method === 'PUT' && subAction === 'status') {
          const body = await parseRequestBody(req);

          if (!body.status) {
            return sendJSON(res, 400, {
              success: false,
              error: 'Status is required.'
            });
          }

          const updated = await db.updateItemStatus(
            id,
            body.status,
            body.resolved_notes
          );

          if (!updated) {
            return sendJSON(res, 404, {
              success: false,
              error: `Item #${id} not found.`
            });
          }

          return sendJSON(res, 200, {
            success: true,
            message: `Item #${id} status updated to '${body.status}'.`,
            data: updated
          });
        }

        // PUT /api/items/:id (Update complete item)
        // REFERENCE: HTTP PUT method
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT

        if (method === 'PUT' && !subAction) {
          const body = await parseRequestBody(req);

          if (body.image_url && body.image_url.startsWith('data:image/')) {
            body.image_url = saveBase64Image(body.image_url);
          }

          const updated = await db.updateItem(id, body);

          if (!updated) {
            return sendJSON(res, 404, {
              success: false,
              error: `Item #${id} not found.`
            });
          }

          return sendJSON(res, 200, {
            success: true,
            message: `Item #${id} updated successfully.`,
            data: updated
          });
        }

        // DELETE /api/items/:id
        // REFERENCE: HTTP DELETE method
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE

        if (method === 'DELETE' && !subAction) {
          const deleted = await db.deleteItem(id);

          if (!deleted) {
            return sendJSON(res, 404, {
              success: false,
              error: `Item #${id} not found.`
            });
          }

          return sendJSON(res, 200, {
            success: true,
            message: `Item #${id} deleted successfully.`
          });
        }
      }

      // Unmatched API endpoint.
      // REFERENCE: HTTP 404 status
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404

      return sendJSON(res, 404, {
        success: false,
        error: `API route not found: ${pathname}`
      });

    } catch (err) {
      // REFERENCE: JavaScript try...catch
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
      //
      // REFERENCE: HTTP 500 Internal Server Error
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/500

      console.error('[API Error]', err);

      return sendJSON(res, 500, {
        success: false,
        error: 'Internal Server Error',
        details: err.message
      });
    }
  }

  // -------------------------------------------------------------
  // STATIC ASSET SERVING
  //
  // REFERENCE: HTTP GET and HEAD methods
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/HEAD
  // -------------------------------------------------------------

  if (method === 'GET' || method === 'HEAD') {
    serveStaticFile(req, res, pathname);
  } else {
    // REFERENCE: HTTP 405 Method Not Allowed
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/405

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
  }
});

// REFERENCE: Node.js process events
// https://nodejs.org/api/process.html#process-events
//
// REFERENCE: uncaughtException
// https://nodejs.org/api/process.html#event-uncaughtexception
//
// REFERENCE: unhandledRejection
// https://nodejs.org/api/process.html#event-unhandledrejection
//
// These handlers log process-level errors and lifecycle events.

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('exit', (code) => {
  console.log(`[Process Exit] Server exiting with code: ${code}`);
});

process.on('SIGTERM', () => {
  console.log('[Process Signal] Received SIGTERM');
});

process.on('SIGINT', () => {
  console.log('[Process Signal] Received SIGINT');
});

// REFERENCE: Node.js Timers
// https://nodejs.org/api/timers.html#setintervalcallback-delay-args
//
// Event loop keepalive timer.

setInterval(() => {}, 60000);

// Start the server after initializing the database.
//
// REFERENCE: JavaScript Promises and .then()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
//
// REFERENCE: Node.js server.listen()
// https://nodejs.org/api/net.html#serverlisten
//
// REFERENCE: Node.js server.address()
// https://nodejs.org/api/net.html#serveraddress

db.initDatabase().then(() => {
  server.on('error', (err) => {
    // REFERENCE: Node.js server errors
    // https://nodejs.org/api/net.html#event-error

    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Notice] Port ${PORT} is in use. Trying port ${PORT + 1}...`);
      server.listen(PORT + 1, '127.0.0.1');
    } else {
      console.error('[Server Error]', err);
    }
  });

  // REFERENCE: Node.js server.listen()
  // https://nodejs.org/api/net.html#serverlisten

  server.listen(PORT, '127.0.0.1', () => {
    const address = server.address();
    const actualPort = typeof address === 'string' ? address : address.port;

    console.log(`\n======================================================`);
    console.log(`🎓 Campus Lost-and-Found Portal Server Running`);
    console.log(`   URL: http://127.0.0.1:${actualPort}/`);
    console.log(`   Database Status: ${db.isDatabaseConnected() ? 'MySQL Connected' : 'High-Fidelity Memory Fallback'}`);
    console.log(`   Static Directory: ${PUBLIC_DIR}`);
    console.log(`======================================================\n`);
  });

}).catch(err => {
  // REFERENCE: Node.js process.exit()
  // https://nodejs.org/api/process.html#processexitcode

  console.error('[Fatal Initialization Error]', err);
  process.exit(1);
});