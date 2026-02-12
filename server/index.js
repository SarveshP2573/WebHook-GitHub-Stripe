const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const app = express()

// ----------------------
// MIDDLEWARE
// ----------------------

// Parse cookies
app.use(cookieParser())

// Parse JSON bodies
app.use(express.json())

// HTTP request logging
app.use(morgan('dev'))

// CORS: allow frontend to send cookies
app.use(cors({
  origin: 'http://localhost:5173', // React dev server
  credentials: true
}));


// ----------------------
// ROUTES
// ----------------------
app.use('/api/user-services', require('./routes/userServices'))
app.use('/auth', require('./routes/auth.route'))

// GitHub routes
app.use('/api/github', require('./routes/github'))
app.use('/api/webhooks/github', require('./routes/githubWebhooks'))
app.use('/api/github-security', require('./routes/githubSecurity'))

// Health check
app.get('/', (req, res) => res.send('Hello from Node.js!'))
app.get('/api/health', (req, res) =>
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Webhook Manager',
  })
)

// Attach DB connection to requests
app.use((req, res, next) => {
  req.db = mongoose.connection
  next()
})

// ----------------------
// INITIALIZE SERVICES
// ----------------------
const initializeServices = async () => {
  const Service = require('./db/Service')
  const services = [
    { name: 'slack', description: 'Slack Integration' },
    { name: 'stripe', description: 'Stripe Integration' },
    { name: 'github', description: 'GitHub Integration' },
    { name: 'blockchain', description: 'Blockchain Integration' },
  ]

  for (const service of services) {
    await Service.findOneAndUpdate(
      { name: service.name },
      service,
      { upsert: true, new: true }
    )
  }
  console.log('✅ Services initialized')
}

// ----------------------
// CONNECT TO MONGODB + START SERVER
// ----------------------
mongoose
  .connect('mongodb://localhost:27017/webhookhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB')
    await initializeServices()

    // Start ngrok tunnel (optional)
    try {
      const ngrokService = require('./services/ngrokService')
      const ngrokUrl = await ngrokService.startNgrok(PORT)
      console.log('🚀 Ngrok Public URL:', ngrokUrl)
      console.log('📝 Use this for webhook endpoints')
    } catch (err) {
      console.log('⚠️  Ngrok not available. Using local URLs')
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
