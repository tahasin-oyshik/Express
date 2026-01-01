require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Server is connected with MongoDB database');
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
