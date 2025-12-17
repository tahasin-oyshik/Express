🎯 How to Build a REST API Project Like Yours - Complete Guide

Based on your actual code, here's the exact order you should follow:

1. 📋 PHASE 1: Project Foundation

   Step 1: Create Project Folder & Initialize NPM

   mkdir my-user-api
   cd my-user-api
   npm init -y
   Why first? Sets up the project structure and creates package.json.

   Step 2: Install Dependencies

   npm install express mongoose cors dotenv uuid body-parser
   npm install --save-dev nodemon
   Why now? You need these packages before writing any code.

   Step 3: Update package.json Scripts
   Edit package.json and add:

   "scripts": {
   "start": "nodemon index.js",
   "test": "echo \"Error: no test specified\" && exit 1"
   }

   Step 4: Create .env File (Environment Variables)

   PORT=5001
   DB_URL=mongodb://localhost:27017/userDemoDB
   Why now? Configuration should be ready before writing code that uses it.

2. 📁 PHASE 2: Configuration Layer (Brain of your app)

   Step 5: Create Folder Structure

   mkdir config models controllers routes views

   Step 6: Create config/config.js (Load environment variables)

   // Environment configuration
   require('dotenv').config();

   const dev = {
   app: {
   port: process.env.PORT || 4000,
   },
   db: {
   url: process.env.DB_URL || 'mongodb://localhost:27017/userDemoDB',
   },
   };

   module.exports = dev;
   Why now? Other files will import this config, so create it early.

   Step 7: Create config/db.js (Database connection)

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
   Why now? Database connection needs config file, so create it after config.

3. 🗄️ PHASE 3: Model Layer (Database Schema)

   Step 8: Create models/user.model.js (Define data structure)

   const { default: mongoose } = require('mongoose');

   const userSchema = mongoose.Schema({
   id: {
   type: String,
   required: true,
   },
   name: {
   type: String,
   required: true,
   },
   age: {
   type: Number,
   required: true,
   },
   createdOn: {
   type: Date,
   default: Date.now,
   },
   });

   module.exports = mongoose.model('User', userSchema);
   Why now? Controllers need the model to interact with database.

4. 🎮 PHASE 4: Controller Layer (Business Logic)

   Step 9: Create controllers/user.controller.js (CRUD operations)

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
   Why now? Routes need these controller functions.

5. PHASE 5: Routes Layer (API Endpoints)

   Step 10: Create routes/user.route.js (Define URL endpoints)

   // User routes - defines all user API endpoints
   const router = require('express').Router();

   const {
   getAllUsers,
   getOneUser,
   createUser,
   updateUser,
   deleteUser,
   } = require('../controllers/user.controller');

   // Route definitions
   router.get('/', getAllUsers); // GET /api/users
   router.get('/:id', getOneUser); // GET /api/users/:id
   router.post('/', createUser); // POST /api/users
   router.delete('/:id', deleteUser); // DELETE /api/users/:id
   router.patch('/:id', updateUser); // PATCH /api/users/:id

   module.exports = router;
   Why now? app.js needs this router.

6. 🖥️ PHASE 6: View Layer (Frontend)

   Step 11: Create views/index.html (Home page)

   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Document</title>
   </head>
   <body>
     <h1>Welcome to the server</h1>
   </body>
   </html>
   Why now? app.js will serve this file.

7. 🚀 PHASE 7: Application Setup

   Step 12: Create app.js (Express application configuration)

   const express = require('express');
   const cors = require('cors');

   // Database connection
   require('./config/db');

   const userRouter = require('./routes/user.route');

   const app = express();

   // Middleware
   app.use(cors());
   app.use(express.urlencoded({ extended: true }));
   app.use(express.json());

   // Routes
   app.use('/api/users', userRouter);

   // API Endpoints:
   // GET /api/users - Get all users
   // GET /api/users/:id - Get single user
   // POST /api/users - Create user
   // PATCH /api/users/:id - Update user
   // DELETE /api/users/:id - Delete user

   // Home route
   app.get('/', (request, response) => {
   response.sendFile(\_\_dirname + '/views/index.html');
   });

   // 404 handler
   app.use((request, response, next) => {
   response.status(404).json({
   message: 'route not found',
   });
   });

   // Error handler
   app.use((error, request, response, next) => {
   response.status(500).json({
   message: 'something broke',
   });
   });

   module.exports = app;
   Why now? index.js needs this app to start the server.

   Step 13: Create index.js (Server entry point)

   // Server entry point
   const app = require('./app');
   const config = require('./config/config');

   const PORT = config.app.port;

   // Start server
   app.listen(PORT, () => {
   console.log(`app is running at http://localhost:${PORT}`);
   });
   Why last? This is the entry point that ties everything together.
