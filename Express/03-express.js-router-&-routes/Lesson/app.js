const express = require('express');
const app = express();
const userRouter = require('./routes/users.route');

app.use('/api/user', userRouter);

app.use('/', (request, response) => {
  response.send('<h1>I am a get request at home route</h1>');
});
app.use((request, response) => {
  response.send('<h1>404 !!! Not a valid url</h1>');
});

module.exports = app;
