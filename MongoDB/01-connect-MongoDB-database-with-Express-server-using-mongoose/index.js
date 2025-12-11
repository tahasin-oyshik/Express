const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = 3002;

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/testProductDB');
    console.log('db is connected');
  } catch (error) {
    console.log('db is not connected');
    console.log(error.message);
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  await connectDB();
});

app.get('/', (request, response) => {
  response.send('welcome to home page');
});
