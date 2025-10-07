const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

// Middleware
app.use(
  cors({
    origin: '*'
  })
)
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/user-services', require('./routes/userServices'))
app.use('/auth', require('./routes/auth.route'))

// NEW: Add GitHub specific routes
app.use('/api/github', require('./routes/github'))
app.use('/api/webhooks/github', require('./routes/githubWebhooks'))
app.use('/api/github-security', require('./routes/githubSecurity'))

// Health check
app.get('/', (req, res) => {
  res.send('Hello from Node.js!')
})
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Webhook Manager'
  })
})

// NEW: Add database middleware for routes that need it
app.use((req, res, next) => {
  req.db = mongoose.connection
  next()
})

// Initialize default services
const initializeServices = async () => {
  const Service = require('./db/Service') // Changed from db/Service to models/Service
  const services = [
    { name: 'slack', description: 'Slack Integration' },
    { name: 'stripe', description: 'Stripe Integration' },
    { name: 'github', description: 'GitHub Integration' },
    { name: 'blockchain', description: 'Blockchain Integration' }
  ]

  for (const service of services) {
    await Service.findOneAndUpdate({ name: service.name }, service, {
      upsert: true,
      new: true
    })
  }
  console.log('✅ Services initialized')
}

mongoose
  .connect('mongodb://localhost:27017/webhookhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB')
    await initializeServices()

    // Start authenticated ngrok tunnel
    try {
      const ngrokService = require('./services/ngrokService')
      const ngrokUrl = await ngrokService.startNgrok(process.env.PORT || 3000)
      console.log('🚀 Authenticated Ngrok Public URL:', ngrokUrl)
      console.log(
        '📝 Use this base URL for webhook configurations in GitHub, Slack, etc.'
      )
    } catch (error) {
      console.log('⚠️  Ngrok not available. Webhooks will use local URLs.')
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
  })

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on port ${PORT}`)
})
