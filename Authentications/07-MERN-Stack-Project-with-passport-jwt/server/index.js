require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 40002;

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
