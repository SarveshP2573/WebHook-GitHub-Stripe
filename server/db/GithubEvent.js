const mongoose = require('mongoose')

const githubEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'push',
      'pull_request',
      'issues',
      'issue_comment',
      'create',
      'delete',
      'fork',
      'star'
    ]
  },
  repository: {
    type: String,
    required: true
  },
  branch: {
    type: String
  },
  author: {
    type: String
  },
  avatar: {
    type: String
  },
  message: {
    type: String
  },
  commitId: {
    type: String
  },
  pullNumber: {
    type: Number
  },
  issueNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'merged']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  url: {
    type: String
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

githubEventSchema.index({ userId: 1, createdAt: -1 })
githubEventSchema.index({ userId: 1, eventType: 1 })
githubEventSchema.index({ userId: 1, repository: 1 })

module.exports = mongoose.model('GithubEvent', githubEventSchema)
