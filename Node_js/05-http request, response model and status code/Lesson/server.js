// • For request there are some common methods – get(), post(), delete(), put(), head()

// • In response we will get status code and data (including head and body).

// HTTP Status code
// 1. Informational response (100–199)
// 2. Successful Response (200–299)
// 3. Redirects (300–399)
// 4. Client Errors (400–499)
// 5. Server Errors (500–599)

const http = require('http');
const port = 3000;
const hostname = '127.0.0.1';

const myServer = http.createServer((request, response) => {
  response.writeHead(202, { 'Content-Type': 'text/html' });
  response.write('<h1>Hello</h1>');
  response.write('<h1>Hello</h1>');
  response.write('<h1>Hello</h1>');
  response.end();
});

myServer.listen(port, hostname, () => {
  console.log(`server is running successfully at http://${hostname}:${port}`);
});
