require('dotenv').config();
const express = require('express');

const userRouter = require('./routes/user');

const app = express();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', userRouter);

app.get('/test', (request, response) => {
  response.json({ message: 'testing' });
});
