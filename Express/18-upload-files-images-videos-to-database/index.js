const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = 8005;

// Connecting Server to MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/usersTestDB');
    console.log('server connected to MongoDB database');
  } catch (error) {
    console.log('server is not connected to MongoDB database');
    console.log(error.message);
    process.exit(1);
  }
};

// Creating schema and model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user name is required'],
  },
  image: {
    type: String,
    required: [true, 'user image is required'],
  },
});

const User = mongoose.model('users', userSchema);

// File upload configuration: sets where files are saved and how they're named
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

app.get('/register', (request, response) => {
  response.status(200).sendFile(__dirname + '/index.html');
});

app.post('/register', upload.single('image'), async (request, response) => {
  try {
    const newUser = new User({
      name: request.body.name,
      image: request.file?.filename,
    });
    await newUser.save();
    response.status(201).send(newUser);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

app.get('/test', (request, response) => {
  response.status(200).send('testing api');
});

app.listen(PORT, async () => {
  console.log(`server is running at http://localhost:${PORT}`);
  await connectDB();
});
