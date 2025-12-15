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
    required: [true, 'product title is required'],
    minlength: [3, 'minimum length of the product title should be 3'],
    maxlength: [10, 'maximum length of the product title should be 10'],
    uppercase: true,
    trim: true,
    // enum: {
    //   values: ['vivo', 'samsung'],
    //   message: '{VALUE} is not supported',
    // },
    validate: {
      validator: (v) => {
        return v.length == 5;
      },
      message: (props) => `${props.value} is not valid title`,
    },
  },
  price: {
    type: Number,
    min: [5000, 'minimum price of the product should be 50000'],
    max: [100000, 'maximum price of the product should be 100000'],
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
  phone: {
    type: String,
    required: [true, 'phone number is required'],
    validate: {
      validator: (v) => {
        const phoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
        return phoneRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    validate: {
      validator: (v) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
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
    const { title, price, rating, description, phone, email } = request.body;
    const newProduct = new Product({
      title,
      price,
      rating,
      description,
      phone,
      email,
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
      response.status(404).send({ success: false, message: 'product was not found with this id' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// CRUD -> delete a product based on id
app.delete('/products/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const product = await Product.findByIdAndDelete({ _id: id });
    if (product) {
      response.status(200).send({ success: true, message: 'deleted singl product', data: product });
    } else {
      response.status(404).send({ success: false, message: 'product was not found with this id' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// CRUD -> update a product based on id
app.put('/products/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const { title, price, rating, description, phone, email } = request.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          price,
          rating,
          description,
          phone,
          email,
        },
      },
      { new: true },
    );
    if (updatedProduct) {
      response
        .status(200)
        .send({ success: true, message: 'updated single product', data: updatedProduct });
    } else {
      response.status(404).send({ success: false, message: 'product was not found with this id' });
    }
  } catch (error) {
    response.status(500).send({ message: error.message });
  }
});

// MongoDB Structure: DATABASE → collections → document

// POST: /products -> create a product
// GET: /products -> Return all the products
// GET: /products/:id -> return a specific product
// DELETE: /products/:id -> delete a product based on id
// PUT: /products/:id -> update a product based on id
