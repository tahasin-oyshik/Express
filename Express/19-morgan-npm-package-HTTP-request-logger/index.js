const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.get('/products', (request, response) => {
  response.send('list all the products');
});

app.post('/products', (request, response) => {
  response.send('create a product');
});

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000');
});
