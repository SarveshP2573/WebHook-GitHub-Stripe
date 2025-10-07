const mongoose = require('mongoose')
const crypto = require('crypto')

const userServiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  accessToken: {
    type: String
  },
  webhookUrl: {
    type: String
  },
  webhookSecret: {
    type: String
  },
  status: {
    type: String,
    enum: ['connected', 'not_connected'],
    default: 'not_connected'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

userServiceSchema.methods.generateWebhookUrl = async function () {
  const uniqueId = crypto.randomBytes(16).toString('hex')

  // Populate serviceId
  await this.populate('serviceId')

  try {
    const ngrokService = require('../services/ngrokService')
    const ngrokUrl = await ngrokService.getNgrokUrl()
    this.webhookUrl = `${ngrokUrl}/api/webhooks/${this.serviceId.name}/${this._id}/${uniqueId}`
  } catch (error) {
    const localUrl = process.env.BASE_URL || 'http://localhost:5000'
    this.webhookUrl = `${localUrl}/api/webhooks/${this.serviceId.name}/${this._id}/${uniqueId}`
  }

  this.webhookSecret = crypto.randomBytes(32).toString('hex')
  return this.webhookUrl
}

module.exports = mongoose.model('UserService', userServiceSchema)
