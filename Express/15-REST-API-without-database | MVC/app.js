const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const usersRouter = require('./routes/users.route.js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/users', usersRouter);

// Home route
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

// 404 Error Handler - Route not found
app.use((request, response, next) => {
  response.status(404).json({
    message: 'route not found',
  });
});

// Global Error Handler
app.use((error, request, response, next) => {
  response.status(500).json({
    message: 'something broke',
  });
});

module.exports = app;
