const express = require('express');
const app = express();
const PORT = 3001;

app.get('/studentId/:id/studentName/:name', (request, response) => {
  const { id, name } = request.params;
  response.send(`<h1>Student id is: ${id}, name is: ${name}</h1>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// // http request with header
// const express = require('express');
// const app = express();
// const PORT = 3001;

// app.get('/', (request, response) => {
//   const { id, name } = request.headers;
//   response.send(`<h1>Student id is: ${id}, name is: ${name}</h1>`);
// });

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
