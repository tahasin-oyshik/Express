// User controller - handles all user-related business logic

const { v4: uuidv4 } = require('uuid');

// Import User model to interact with the users collection in MongoDB
const User = require('../models/user.model');

// GET all users
const getAllUsers = async (request, response) => {
  try {
    const users = await User.find();
    response.status(200).json(users);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

// GET single user by ID
const getOneUser = async (request, response) => {
  try {
    const { id } = request.params;
    const user = await User.findOne({ id: id });
    response.status(200).json(user);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

// POST create new user
const createUser = async (request, response) => {
  try {
    const { name, age } = request.body;
    const newUser = new User({
      id: uuidv4(),
      name,
      age: Number(age),
    });
    await newUser.save();
    response.status(201).json(newUser);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

// PATCH update user by ID
const updateUser = async (request, response) => {
  try {
    const { id } = request.params;
    const { name, age } = request.body;
    const updatedUser = await User.findOneAndUpdate(
      { id: id },
      {
        $set: {
          name,
          age: Number(age),
        },
      },
      { new: true },
    );
    response.status(200).json(updatedUser);
  } catch (error) {
    response.status(500).send(error.message);
  }
};

// DELETE user by ID
const deleteUser = async (request, response) => {
  try {
    const { id } = request.params;
    await User.findOneAndDelete({ id: id });
    response.status(200).json({ message: 'user is deleted' });
  } catch (error) {
    response.status(500).send(error.message);
  }
};

module.exports = { getAllUsers, getOneUser, createUser, updateUser, deleteUser };
