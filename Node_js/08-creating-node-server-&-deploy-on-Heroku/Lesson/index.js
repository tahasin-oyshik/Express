const http = require('http');
const fs = require('fs');
const port = process.env.port;
const hostName = '127.0.0.1';

const handleReadFile = (fileName, statusCode, request, response) => {
  fs.readFile(fileName, 'utf-8', (error, data) => {
    if (error) {
      console.log(error);
    } else {
      response.writeHead(statusCode, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    }
  });
};

const server = http.createServer((request, response) => {
  if (request.url == '/') {
    handleReadFile('./views/index.html', 200, request, response);
  } else if (request.url == '/about') {
    handleReadFile('./views/about.html', 200, request, response);
  } else if (request.url == '/contact') {
    handleReadFile('./views/contact.html', 200, request, response);
  } else {
    handleReadFile('./views/error.html', 404, request, response);
  }
});

server.listen(port, hostName, () => {
  console.log(`Server is running at http://${hostName}:${port}`);
});
