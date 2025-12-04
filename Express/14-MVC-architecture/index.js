const express = require('express');
const userRouter = require('./routes/users.route');
const productRouter = require('./routes/products.route');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(userRouter);
app.use(productRouter);

app.use((request, response) => {
  response.status(404).json({
    message: 'resource not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// User Request Flow (GET /users)
// * index.js:18-20 - Server starts listening on port 3000
// * Client - User navigates to http://localhost:3000/users (GET request)
// * index.js:8 - Express middleware parses URL-encoded data
// * index.js:9 - Request goes to userRouter
// * users.route.js:5 - Route matches GET /users and calls getUsers controller
// * users.controller.js:4 - getUsers function executes
// * users.controller.js:5 - Sends HTML file from views folder
// * index.html - User sees the form

// Save User Flow (POST /users)
// * index.html:9-13 - User fills form and clicks "save user" button
// * Client - Form submits POST request to /users with name and age
// * index.js:8 - Express middleware parses URL-encoded form data into request.body
// * index.js:9 - Request goes to userRouter
// * users.route.js:6 - Route matches POST /users and calls saveUser controller
// * users.controller.js:2 - Controller imports users model (data array)
// * users.controller.js:8-14 - saveUser function:
//     1. Extracts name and age from request.body
//     2. Creates user object
//     3. Pushes to users array
// * models/users.model.js:1-10 - Users array is updated in model
// * users.controller.js:15-18 - Response sent back with status 201 and updated users list
