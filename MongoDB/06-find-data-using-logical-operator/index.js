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
  rating: {
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

// CRUD -> create a product
app.post('/products', async (request, response) => {
  try {
    const { title, price, rating, description } = request.body;
    const newProduct = new Product({
      title,
      price,
      rating,
      description,
    });
    const productData = await newProduct.save();
    response.status(201).send(productData);
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// CRUD -> return all the products
app.get('/products', async (request, response) => {
  try {
    const { price, rating } = request.query;
    let products;
    if (price && rating) {
      products = await Product.find({
        $and: [{ price: { $gt: price } }, { rating: { $gt: rating } }],
      });
    } else {
      products = await Product.find();
    }

    if (products) {
      response.status(200).send({ success: true, message: 'return all products', data: products });
    } else {
      response.status(404).send({ success: false, message: 'products not found' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// CRUD -> return a specific product
app.get('/products/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const product = await Product.findOne({ _id: id });
    if (product) {
      response.status(200).send({ success: true, message: 'return single product', data: product });
    } else {
      response.status(404).send({ success: false, message: 'product not found' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// MongoDB Structure: DATABASE → collections → document

// POST: /products -> create a product
// GET: /products -> Return all the products
// GET: /products/:id -> return a specific product
// PUT: /products/:id -> update a product based on id
// DELETE: /products/:id -> delete a product based on id
