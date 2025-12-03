const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/register', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});
app.post('/register', (request, response) => {
  const { fullName, age } = request.body;
  response.send(`<h2>Home boy your name is ${fullName}, and u ${age} years old</h2>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
