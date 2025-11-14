const http = require('http');
const { graphql, buildSchema } = require('graphql');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Define schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// Define resolvers
const root = {
  hello: () => 'Hello world!',
};

// Generate a nonce for each request
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Generate unique nonce for this request
  const nonce = generateNonce();

  // Improved Content Security Policy with nonce
  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'self'`,
    `style-src 'nonce-${nonce}' 'self'`,
    "img-src 'self' data:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // GraphiQL HTML with nonce
  const graphiqlHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>GraphiQL</title>
    <link rel="stylesheet" href="/lib/graphiql.min.css" nonce="${nonce}" />
  </head>
  <body style="margin: 0;">
    <div id="graphiql" style="height: 100vh;"></div>
    <script
      nonce="${nonce}"
      src="/lib/react.production.min.js"
    ></script>
    <script
      nonce="${nonce}"
      src="/lib/react-dom.production.min.js"
    ></script>
    <script
      nonce="${nonce}"
      src="/lib/graphiql.min.js"
    ></script>
    <script nonce="${nonce}">
      const graphQLFetcher = graphQLParams =>
        fetch('/graphql', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(graphQLParams),
        }).then(response => response.json());
      ReactDOM.render(
        React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
</html>
`;

  // Set security headers for all responses
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (req.method === 'GET' && req.url === '/graphiql') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(graphiqlHTML);
  } else if (req.method === 'POST' && req.url === '/graphql') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      try {
        const { query } = JSON.parse(body);
        const result = await graphql({ schema, source: query, rootValue: root });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/lib/')) {
    const filePath = path.join(__dirname, '..', '..', req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      const ext = path.extname(filePath);
      const contentType = ext === '.js' ? 'application/javascript' : 
                         ext === '.css' ? 'text/css' : 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4000, () => {
  console.log('🚀 Vanilla GraphQL server running at http://localhost:4000/graphql');
  console.log('🔎 GraphiQL available at http://localhost:4000/graphiql');
});