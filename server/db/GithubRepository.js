const mongoose = require('mongoose')

const githubRepositorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  githubId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  private: {
    type: Boolean,
    default: false
  },
  fork: {
    type: Boolean,
    default: false
  },
  stars: {
    type: Number,
    default: 0
  },
  forks: {
    type: Number,
    default: 0
  },
  issues: {
    type: Number,
    default: 0
  },
  language: {
    type: String
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  lastUpdated: {
    type: Date
  },
  url: {
    type: String
  },
  hasWebhook: {
    type: Boolean,
    default: false
  },
  webhookId: {
    type: Number
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

githubRepositorySchema.index({ userId: 1, githubId: 1 }, { unique: true })
githubRepositorySchema.index({ userId: 1, fullName: 1 })

module.exports = mongoose.model('GithubRepository', githubRepositorySchema)
