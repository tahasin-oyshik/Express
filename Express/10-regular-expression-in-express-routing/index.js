const express = require('express');

const app = express();

app.get('/products/id/:id', (request, response) => {
  if (!/^\d{3}$/.test(request.params.id)) return response.sendStatus(400);
  response.send(`<h2>ID = ${request.params.id}</h2>`);
});
app.get('/products/title/:title', (request, response) => {
  if (!/^[a-zA-Z\d]{3}$/.test(request.params.title)) return response.sendStatus(400);
  response.send(`<h2>Title = ${request.params.title}</h2>`);
});

app.use((request, response) => {
  response.status(400).send({
    message: 'not a valid route',
  });
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
