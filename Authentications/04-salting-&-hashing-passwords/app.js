require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = require('./models/user.model');

const app = express();

const port = process.env.PORT || 5000;
const dbURL = process.env.MONGO_URL;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log('Server is connected with MongoDB database');
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/register', async (request, response) => {
  try {
    const { email, password } = request.body;
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      const newUser = new User({ email, password: hash });
      await newUser.save();
      response.status(200).json(newUser);
    });
  } catch (error) {
    response.status(500).json(error.message);
  }
});

app.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email });
    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result == true) {
          response.status(200).json({ status: 'valid user' });
        }
      });
    } else {
      response.status(404).json({ status: 'Not valid user' });
    }
  } catch (error) {
    response.status(500).json(error.message);
  }
});

// Route not found error
app.use((request, response, next) => {
  response.status(404).json({ message: 'route not found' });
});

// Server error
app.use((error, request, response, next) => {
  response.status(500).json({ message: 'something broke' });
});

app.listen(port, (request, response) => {
  console.log(`server is running at http://localhost:${port}`);
});
