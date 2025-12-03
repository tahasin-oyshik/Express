const express = require('express');
const router = express.Router();

router.get('/register', (request, response) => {
  response.send('<h1>I am a get request at register route</h1>');
});
router.get('/login', (request, response) => {
  response.send('<h1>I am a get request at login route</h1>');
});

module.exports = router;
