const mongoose = require('mongoose')

const codeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repository: {
    type: String,
    required: true
  },
  commitSha: {
    type: String,
    required: true
  },
  commitMessage: {
    type: String
  },
  author: {
    type: String
  },
  branch: {
    type: String
  },
  filesAnalyzed: [
    {
      filename: String,
      language: String,
      analysis: {
        security_issues: [String],
        code_quality: [String],
        improvements: [String],
        overall_score: Number,
        summary: String
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('CodeAnalysis', codeAnalysisSchema)
