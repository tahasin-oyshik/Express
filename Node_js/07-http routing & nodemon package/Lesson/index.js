const http = require('http');
const fs = require('fs');
const port = 3000;
const hostName = '127.0.0.1';

const server = http.createServer((request, response) => {
  const handleReadFile = (statusCode, fileLocation) => {
    fs.readFile(fileLocation, (error, data) => {
      response.writeHead(statusCode, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    });
  };

  if (request.url == '/') {
    handleReadFile(200, './views/index.html');
  } else if (request.url == '/about') {
    handleReadFile(200, './views/about.html');
  } else if (request.url == '/contact') {
    handleReadFile(200, './views/contact.html');
  } else {
    handleReadFile(404, './views/error.html');
  }
});

server.listen(port, hostName, () => {
  console.log(`Server is running at http://${hostName}:${port}`);
});
