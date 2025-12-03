// For this project install,
// - package.json (npm init -y)
// - npm install nodemon express body-parser
// - then in package.json script add "start": "nodemon index.js"
// - now we can use npm start for project run

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html');
});
app.get('/circle', (request, response) => {
  response.sendFile(__dirname + '/circle.html');
});
app.get('/triangle', (request, response) => {
  response.sendFile(__dirname + '/triangle.html');
});

app.post('/triangle', (request, response) => {
  const { base, height } = request.body;
  const area = 0.5 * base * height;
  response.send(`<h2>Area of Triangle = ${area}</h2>`);
});
app.post('/circle', (request, response) => {
  const { radius } = request.body;
  const area = Math.PI * radius * radius;
  response.send(`<h2>Area of Circle = ${area}</h2>`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
