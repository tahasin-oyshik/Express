// Server entry point
const app = require('./app');
const config = require('./config/config');

const PORT = config.app.port;

// Start server
app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
