const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = 3002;

// create products schema
const productsSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create product model
const Product = mongoose.model('Products', productsSchema);

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
