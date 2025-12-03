const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('I am a get request at home route');
  response.end();
});
app.post('/', (request, response) => {
  response.send('I am a post request at home route');
  response.end();
});
app.put('/', (request, response) => {
  response.send('I am a put request at home route');
  response.end();
});
app.delete('/', (request, response) => {
  response.send('I am a delete request at home route');
  response.end();
});

module.exports = app;
