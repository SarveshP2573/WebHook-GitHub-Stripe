const {
  login,
  register,
  logout,
  getMe
} = require('../controllers/auth.controller')
const protect = require('../middleware/authMiddleware')
const router = require('express').Router()

router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.get('/me', protect, getMe)

module.exports = router
