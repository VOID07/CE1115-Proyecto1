const http = require('http');
const { graphql, buildSchema } = require('graphql');

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

// Content Security Policy
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://unpkg.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

// GraphiQL HTML
const graphiqlHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>GraphiQL</title>
    <meta http-equiv="Content-Security-Policy" content="${csp}">

    <link rel="stylesheet" href="https://unpkg.com/graphiql@1.4.7/graphiql.min.css" />
  </head>
  <body style="margin: 0;">
    <div id="graphiql" style="height: 100vh;"></div>
    <script
      crossorigin
      src="https://unpkg.com/react@17/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
    ></script>
    <script
      src="https://unpkg.com/graphiql@1.4.7/graphiql.min.js"
    ></script>
    <script>
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

// Create HTTP server
const server = http.createServer((req, res) => {
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
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4000, () => {
  console.log('🚀 Vanilla GraphQL server running at http://localhost:4000/graphql');
  console.log('🔎 GraphiQL available at http://localhost:4000/graphiql');
});