// User routes - defines all user API endpoints
const router = require('express').Router();

const {
  getAllUsers,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

// Route definitions
router.get('/', getAllUsers); // GET /api/users
router.get('/:id', getOneUser); // GET /api/users/:id
router.post('/', createUser); // POST /api/users
router.delete('/:id', deleteUser); // DELETE /api/users/:id
router.patch('/:id', updateUser); // PATCH /api/users/:id

module.exports = router;
