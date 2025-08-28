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
    type: String // should be encrypted before saving
  },
  refreshToken: {
    type: String // optional, for services like Slack OAuth
  },
  status: {
    type: String,
    enum: ['connected', 'not_connected'],
    default: 'not_connected'
  },
  lastSyncedAt: {
    type: Date
  }
})

module.exports = mongoose.model('UserService', userServiceSchema)
