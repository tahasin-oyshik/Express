// MongoDB connection setup
const mongoose = require('mongoose');
const config = require('./config');

const dbURL = config.db.url;

// Connect to MongoDB
mongoose
  .connect(dbURL)
  .then(() => {
    console.log('mongodb is connected');
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1); // Exit if connection fails
  });
