const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create products schema
const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create product model
const Product = mongoose.model('products', productsSchema);

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

app.post('/products', async (request, response) => {
  try {
    const { title, price, description } = request.body;
    const newProduct = new Product({
      title,
      price,
      description,
    });
    const productData = await newProduct.save();
    response.status(201).send(productData);
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});
