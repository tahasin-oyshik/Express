const express = require('express');
const multer = require('multer');

const app = express();

const PORT = 8005;

// File upload configuration: sets where files are saved and how they're named
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

app.get('/register', (request, response) => {
  response.status(200).sendFile(__dirname + '/index.html');
});

app.post('/register', upload.single('image'), (request, response) => {
  response.status(200).send('file is uploaded');
});

app.get('/test', (request, response) => {
  response.status(200).send('testing api');
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
