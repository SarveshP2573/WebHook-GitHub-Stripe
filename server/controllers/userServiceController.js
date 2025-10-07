const Service = require('../db/Service')
const UserService = require('../db/UserService')
const ngrokService = require('../services/ngrokService')

exports.getUserServices = async (req, res) => {
  try {
    // ✅ FIXED: Use req.userId instead of req.user.id
    const userServices = await UserService.find({
      userId: req.userId
    }).populate('serviceId')

    const formattedServices = {}

    userServices.forEach(us => {
      const serviceName = us.serviceId.name
      formattedServices[serviceName] = {
        enabled: us.status === 'connected',
        token: us.accessToken ? '••••••••' : '',
        webhookUrl: us.webhookUrl || '',
        loading: false
      }
    })

    const allServices = await Service.find()
    allServices.forEach(service => {
      if (!formattedServices[service.name]) {
        formattedServices[service.name] = {
          enabled: false,
          token: '',
          webhookUrl: '',
          loading: false
        }
      }
    })

    res.json(formattedServices)
  } catch (error) {
    console.error('Error fetching user services:', error)
    res.status(500).json({ error: 'Failed to fetch user services' })
  }
}

// Enable a service for user
exports.enableService = async (req, res) => {
  try {
    const { serviceName } = req.params
    // ✅ FIXED: Use req.userId instead of req.user.id
    const userId = req.userId

    // Check if ngrok is running
    if (!ngrokService.isConnected) {
      return res.status(503).json({
        error:
          'Ngrok tunnel is not ready. Webhook URLs will not be publicly accessible.',
        ngrokStatus: ngrokService.getStatus()
      })
    }

    // Find service by name
    const service = await Service.findOne({ name: serviceName })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    // Check if user service already exists
    let userService = await UserService.findOne({
      userId,
      serviceId: service._id
    })

    if (userService && userService.status === 'connected') {
      return res.status(400).json({ error: 'Service already enabled' })
    }

    if (!userService) {
      userService = new UserService({
        userId,
        serviceId: service._id,
        status: 'connected'
      })
    } else {
      userService.status = 'connected'
    }

    // Generate webhook URL with ngrok
    const webhookUrl = await userService.generateWebhookUrl()
    await userService.save()

    console.log(`✅ ${serviceName} service enabled with URL: ${webhookUrl}`)

    res.json({
      enabled: true,
      webhookUrl: webhookUrl,
      message: `${serviceName} service enabled successfully`,
      ngrokUrl: ngrokService.ngrokUrl
    })
  } catch (error) {
    console.error('Error enabling service:', error)
    res.status(500).json({
      error: 'Failed to enable service: ' + error.message
    })
  }
}

// Disable a service for user
exports.disableService = async (req, res) => {
  try {
    const { serviceName } = req.params
    // ✅ FIXED: Use req.userId instead of req.user.id
    const userId = req.userId

    const service = await Service.findOne({ name: serviceName })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    const userService = await UserService.findOne({
      userId,
      serviceId: service._id
    })

    if (!userService) {
      return res.status(404).json({ error: 'User service not found' })
    }

    userService.status = 'not_connected'
    userService.accessToken = undefined
    userService.webhookUrl = undefined
    userService.webhookSecret = undefined

    await userService.save()

    res.json({
      enabled: false,
      message: `${serviceName} service disabled successfully`
    })
  } catch (error) {
    console.error('Error disabling service:', error)
    res.status(500).json({ error: 'Failed to disable service' })
  }
}

// Save service token
exports.saveToken = async (req, res) => {
  try {
    const { serviceName } = req.params
    const { token } = req.body
    // ✅ FIXED: Use req.userId instead of req.user.id
    const userId = req.userId

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const service = await Service.findOne({ name: serviceName })
    if (!service) {
      return res.status(404).json({ error: 'Service not found' })
    }

    let userService = await UserService.findOne({
      userId,
      serviceId: service._id
    })

    if (!userService || userService.status !== 'connected') {
      return res.status(400).json({ error: 'Service must be enabled first' })
    }

    userService.accessToken = token
    await userService.save()

    res.json({ message: 'Token saved successfully' })
  } catch (error) {
    console.error('Error saving token:', error)
    res.status(500).json({ error: 'Failed to save token' })
  }
}

// Get ngrok status
exports.getNgrokStatus = async (req, res) => {
  try {
    res.json(ngrokService.getStatus())
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ngrok status' })
  }
}
