const path = require('path');
const products = require('../models/products.model.js');

exports.getProducts = (request, response) => {
  response.sendFile(path.join(__dirname, '../views/product.html'));
};

exports.saveProduct = (request, response) => {
  const { name, price } = request.body;
  const product = {
    name,
    price: Number(price),
  };
  products.push(product);
  response.status(201).json({
    success: true,
    products,
  });
};
