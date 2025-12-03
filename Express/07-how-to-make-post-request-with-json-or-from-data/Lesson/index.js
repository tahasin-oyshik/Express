const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.post('/user', (request, response) => {
  const { name, age } = request.body;
  response.send(`Welcome ${name}, Your age ${age}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
