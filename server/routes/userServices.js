const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const userServiceController = require('../controllers/userServiceController')

// Get all user services
router.get('/', auth, userServiceController.getUserServices)

// Enable a service
router.post('/:serviceName/enable', auth, userServiceController.enableService)

// Disable a service
router.post('/:serviceName/disable', auth, userServiceController.disableService)

// Save service token
router.post('/:serviceName/token', auth, userServiceController.saveToken)

// Get ngrok status
router.get('/status/ngrok', auth, userServiceController.getNgrokStatus)

module.exports = router
