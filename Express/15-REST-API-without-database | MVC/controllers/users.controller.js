let users = require('../models/users.model');
const { v4: uuidv4 } = require('uuid');

// get users
const getAllUsers = (request, response) => {
  response.status(200).json({ users });
};

// create user
const createUser = (request, response) => {
  const { username, email } = request.body;
  const newUser = {
    id: uuidv4(),
    username,
    email,
  };
  users.push(newUser);
  response.status(201).json({ users });
};

// update user
const updateUser = (request, response) => {
  const { id } = request.params;
  const { username, email } = request.body;
  users
    .filter((user) => user.id == id)
    .map((selecteduser) => {
      selecteduser.username = username;
      selecteduser.email = email;
    });
  response.status(200).json({ users });
};

// delete user
const deleteUser = (request, response) => {
  const { id } = request.params;
  users = users.filter((user) => user.id !== id);
  response.status(200).json({ users });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
