const express = require('express');
const cors = require('cors');

// Database connection
require('./config/db');

const userRouter = require('./routes/user.route');

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/users', userRouter);

// API Endpoints:
// GET    /api/users     - Get all users
// GET    /api/users/:id - Get single user
// POST   /api/users     - Create user
// PATCH  /api/users/:id - Update user
// DELETE /api/users/:id - Delete user

// Home route
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

// 404 handler
app.use((request, response, next) => {
  response.status(404).json({
    message: 'route not found',
  });
});

// Error handler
app.use((error, request, response, next) => {
  response.status(500).json({
    message: 'something broke',
  });
});

module.exports = app;
