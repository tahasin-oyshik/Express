const express = require('express');

const app = express();
const PORT = 3000;

const myMiddleWare = (request, response, next) => {
  console.log('Middleware function');

  request.currentTime = new Date(Date.now());
  next();
};

app.use(myMiddleWare);

app.get('/', (request, response) => {
  console.log('I am home ' + request.currentTime);
  response.send(`<h1>I am home route</h1>`);
});
app.get('/about', (request, response) => {
  console.log('I am about ' + request.currentTime);
  response.send(`<h1>I am about route</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
