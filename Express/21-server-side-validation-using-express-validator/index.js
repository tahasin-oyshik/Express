const express = require('express');
const userRoutes = require('./routes/user');

const app = express();

const PORT = 3009;

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', userRoutes);

app.get('/test', (request, response) => {
  response.send('testing the server');
});
