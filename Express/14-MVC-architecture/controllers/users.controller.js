const path = require('path');
const users = require('../models/users.model.js');

exports.getUsers = (request, response) => {
  response.sendFile(path.join(__dirname, '../views/index.html'));
};

exports.saveUser = (request, response) => {
  const { name, age } = request.body;
  const user = {
    name,
    age: Number(age),
  };
  users.push(user);
  response.status(201).json({
    success: true,
    users,
  });
};
