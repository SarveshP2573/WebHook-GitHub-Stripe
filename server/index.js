// ----------------------
// LOAD ENV VARIABLES
// ----------------------
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// DEBUG ENV
// ----------------------
console.log("Stripe ENV:", process.env.STRIPE_SECRET_KEY ? "Loaded ✅" : "Missing ❌");
console.log("Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET ? "Loaded ✅" : "Missing ❌");
console.log("NGROK_URL:", process.env.NGROK_URL);

// ----------------------
// MIDDLEWARE
// ----------------------
app.use(cookieParser());
app.use(morgan('dev'));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ----------------------
// STRIPE RAW WEBHOOK (MUST BE BEFORE express.json())
// ----------------------
app.use('/api/stripe/webhook',
  express.raw({ type: 'application/json' })
);

// Normal JSON parser
app.use(express.json());

// ----------------------
// ROUTES
// ----------------------
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/user-services', require('./routes/userServices'));
app.use('/auth', require('./routes/auth.route'));

app.use('/api/github', require('./routes/github'));
app.use('/api/webhooks/github', require('./routes/githubWebhooks'));
app.use('/api/github-security', require('./routes/githubSecurity'));

// ----------------------
// HEALTH CHECK
// ----------------------
app.get('/', (req, res) => res.send('Hello from Node.js!'));

app.get('/api/health', (req, res) =>
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Webhook Manager',
  })
);

// ----------------------
// INITIALIZE SERVICES
// ----------------------
const initializeServices = async () => {
  const Service = require('./db/Service');

  const services = [
    { name: 'slack', description: 'Slack Integration' },
    { name: 'stripe', description: 'Stripe Integration' },
    { name: 'github', description: 'GitHub Integration' },
    { name: 'blockchain', description: 'Blockchain Integration' },
  ];

  for (const service of services) {
    await Service.findOneAndUpdate(
      { name: service.name },
      service,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Services initialized');
};


// ----------------------
// CONNECT TO MONGODB
// ----------------------
mongoose.connect('mongodb://localhost:27017/webhookhub')
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await initializeServices();

    try {
      const ngrokService = require('./services/ngrokService');
      const ngrokUrl = await ngrokService.startNgrok(PORT);
      console.log('🚀 Ngrok Public URL:', ngrokUrl);
    } catch {
      console.log('⚠️ Using local URLs');
    }

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
