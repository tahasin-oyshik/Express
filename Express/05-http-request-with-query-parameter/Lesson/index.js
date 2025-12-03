const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (request, response) => {
  const { id, name } = request.query;
  response.send(`<h1>Student id is: ${id}, name is: ${name}</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
