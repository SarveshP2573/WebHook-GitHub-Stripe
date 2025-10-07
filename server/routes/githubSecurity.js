const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const CodeAnalysis = require('../db/CodeAnalysis')

// Get all security analyses for user
router.get('/analyses', auth, async (req, res) => {
  try {
    const analyses = await CodeAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ analyses })
  } catch (error) {
    console.error('Error fetching security analyses:', error)
    res.status(500).json({ error: 'Failed to fetch security analyses' })
  }
})

// Get analyses for specific repository
router.get('/analyses/:repository', auth, async (req, res) => {
  try {
    const { repository } = req.params

    const analyses = await CodeAnalysis.find({
      userId: req.user.id,
      repository: repository
    }).sort({ createdAt: -1 })

    res.json({ analyses })
  } catch (error) {
    console.error('Error fetching repository analyses:', error)
    res.status(500).json({ error: 'Failed to fetch repository analyses' })
  }
})

// Get security overview stats
router.get('/overview', auth, async (req, res) => {
  try {
    const totalAnalyses = await CodeAnalysis.countDocuments({
      userId: req.user.id
    })

    const analyses = await CodeAnalysis.find({ userId: req.user.id })

    let totalSecurityIssues = 0
    let totalScore = 0

    analyses.forEach(analysis => {
      analysis.filesAnalyzed.forEach(file => {
        totalSecurityIssues += file.analysis.security_issues.length
        totalScore += file.analysis.overall_score
      })
    })

    const averageScore = totalAnalyses > 0 ? totalScore / totalAnalyses : 0

    res.json({
      totalAnalyses,
      totalSecurityIssues,
      averageScore: Math.round(averageScore),
      recentAnalyses: analyses.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching security overview:', error)
    res.status(500).json({ error: 'Failed to fetch security overview' })
  }
})


module.exports = router
