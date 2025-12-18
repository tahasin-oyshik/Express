const express = require('express');
const chalk = require('chalk');

const app = express();

// const error = chalk.bold.red;
// const warning = chalk.hex('#bd8119ff');

// console.log(error('this is an error'));
// console.log(warning('this is an warning'));

app.get('/products', (request, response) => {
  response.send('list all the products');
});

app.listen(3000, () => {
  console.log(chalk.underline.bgRed.bold('server is running at http://localhost:3000'));
});
