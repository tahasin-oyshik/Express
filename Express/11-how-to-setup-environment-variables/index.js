require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (request, response) => {
  response.send('Hello I am home route');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
