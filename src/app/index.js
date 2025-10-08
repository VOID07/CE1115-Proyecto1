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

// GraphiQL HTML
const graphiqlHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>GraphiQL</title>
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