const { v4: uuidv4 } = require('uuid');

const users = [
  {
    id: uuidv4(),
    username: 'Mr Vulturi',
    email: 'mrvulturi@gmail.com',
  },
  {
    id: uuidv4(),
    username: 'GG Hulk',
    email: 'gghulkastine@gmail.com',
  },
];

module.exports = users;
