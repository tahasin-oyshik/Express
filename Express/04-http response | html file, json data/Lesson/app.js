const express = require('express');
const app = express();
const userRouter = require('./routes/users.route');

app.use('/api/user', userRouter);

app.use('/register', (request, response) => {
  // // sending JSON data for response
  response.status(200).json({
    message: 'I am register page',
    statusCode: 200,
  });

  // // sending HTML file for response
  // response.statusCode = 200;
  // response.sendFile(__dirname + '/views/register.html');

  // response.redirect('/login');
});
app.use('/login', (request, response) => {
  // // sending Cookies for response
  response.cookie('name', 'Mr Vulturi');
  response.cookie('age', '999');
  response.clearCookie('name');
  response.end();

  // // sending Header value for response
  // response.append('id', '2024200000372');
  // response.end();
});
app.use('/', (request, response) => {
  // // sending HTML file for response
  response.statusCode = 200;
  response.sendFile(__dirname + '/views/index.html');
});
app.use((request, response) => {
  response.send('<h1>404 !!! Not a valid url</h1>');
});

module.exports = app;
