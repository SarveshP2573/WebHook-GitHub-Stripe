const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const UserService = require('../db/UserService')
const Service = require('../db/Service')
const GithubRepository = require('../db/GithubRepository')
const GithubEvent = require('../db/GithubEvent')
const githubService = require('../services/githubService')

// Check GitHub connection status
router.get('/status', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOne({
      userId: req.user.id,
      serviceId: service._id
    })

    const connected = !!(userService && userService.accessToken)
    const webhookActive = !!(userService && userService.webhookUrl)

    res.json({
      connected,
      username: userService?.githubUsername || null,
      webhookConfigured: webhookActive,
      webhookUrl: userService?.webhookUrl
    })
  } catch (error) {
    console.error('Error checking GitHub status:', error)
    res.status(500).json({ error: 'Failed to check GitHub status' })
  }
})

// Get ALL user repositories (global)
router.get('/repositories', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOne({
      userId: req.user.id,
      serviceId: service._id
    })

    if (!userService || !userService.accessToken) {
      return res.status(400).json({ error: 'GitHub not connected' })
    }

    const { refresh } = req.query

    // Always fetch fresh from GitHub for global view
    try {
      const githubRepos = await githubService.getUserRepositories(
        userService.accessToken
      )

      // Save/update in MongoDB
      for (const repoData of githubRepos) {
        await GithubRepository.findOneAndUpdate(
          {
            userId: req.user.id,
            githubId: repoData.id
          },
          {
            userId: req.user.id,
            githubId: repoData.id,
            name: repoData.name,
            fullName: repoData.fullName,
            owner: repoData.owner,
            description: repoData.description,
            private: repoData.private,
            fork: repoData.fork,
            stars: repoData.stars,
            forks: repoData.forks,
            issues: repoData.issues,
            language: repoData.language,
            defaultBranch: repoData.defaultBranch,
            lastUpdated: repoData.lastUpdated,
            url: repoData.url,
            hasWebhook: false // Global webhook covers all repos
          },
          { upsert: true, new: true }
        )
      }

      // Get from DB with updated info
      const repositories = await GithubRepository.find({
        userId: req.user.id
      }).sort({ stars: -1, updatedAt: -1 })

      res.json({ repositories })
    } catch (githubError) {
      // Fallback to DB if GitHub API fails
      const repositories = await GithubRepository.find({
        userId: req.user.id
      }).sort({ stars: -1, updatedAt: -1 })

      res.json({ repositories })
    }
  } catch (error) {
    console.error('Error fetching repositories:', error)
    res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// Get ALL GitHub activities (global)
router.get('/activities', auth, async (req, res) => {
  try {
    const { eventType, repository, dateRange, status } = req.query

    let dateFilter = {}
    if (dateRange) {
      const now = new Date()
      switch (dateRange) {
        case '24h':
          dateFilter = {
            createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
          }
          break
        case '7d':
          dateFilter = {
            createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
          }
          break
        case '30d':
          dateFilter = {
            createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
          }
          break
      }
    }

    const filter = {
      userId: req.user.id,
      ...dateFilter
    }

    if (eventType && eventType !== 'all') {
      filter.eventType = eventType
    }

    if (repository && repository !== 'all') {
      filter.repository = repository
    }

    const activities = await GithubEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(100) // Increased limit for global view

    res.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})
// In your github.js routes - statistics endpoint
router.get('/statistics', auth, async (req, res) => {
  try {
    const { dateRange } = req.query

    let dateFilter = {}
    if (dateRange) {
      const now = new Date()
      switch (dateRange) {
        case '24h':
          dateFilter = {
            createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
          }
          break
        case '7d':
          dateFilter = {
            createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
          }
          break
        case '30d':
          dateFilter = {
            createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) }
          }
          break
      }
    }

    const totalRepositories = await GithubRepository.countDocuments({
      userId: req.user.id
    })

    // Debug: Check what events exist
    const allEvents = await GithubEvent.find({
      userId: req.user.id,
      ...dateFilter
    })
    console.log(`📊 Found ${allEvents.length} events for user ${req.user.id}`)

    const eventStats = await GithubEvent.aggregate([
      {
        $match: {
          userId: req.user.id,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ])

    console.log('Event stats:', eventStats)

    const stats = {
      totalRepositories,
      totalActivities: allEvents.length, // Use actual count
      pushes: 0,
      pullRequests: 0,
      issues: 0,
      activeContributors: 0,
      successRate: 98.5
    }

    eventStats.forEach(stat => {
      if (stat._id === 'push') stats.pushes = stat.count
      if (stat._id === 'pull_request') stats.pullRequests = stat.count
      if (stat._id === 'issues') stats.issues = stat.count
    })

    // Calculate unique contributors
    const contributors = await GithubEvent.distinct('author', {
      userId: req.user.id,
      ...dateFilter
    })
    stats.activeContributors = contributors.length

    console.log('Final stats:', stats)
    res.json({ stats })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})
// Setup GLOBAL webhook (for ALL repositories)
router.post('/setup-global-webhook', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOne({
      userId: req.user.id,
      serviceId: service._id
    })

    if (!userService || !userService.accessToken) {
      return res.status(400).json({ error: 'GitHub not connected' })
    }

    // Generate webhook URL if not exists
    if (!userService.webhookUrl) {
      await userService.generateWebhookUrl()
      await userService.save()
    }

    res.json({
      success: true,
      message: 'Global webhook URL generated successfully',
      webhookUrl: userService.webhookUrl,
      instructions:
        'Add this webhook URL to your GitHub account settings to receive events from ALL repositories'
    })
  } catch (error) {
    console.error('Error setting up global webhook:', error)
    res.status(500).json({ error: 'Failed to setup global webhook' })
  }
})

// Check webhook status
router.get('/webhook-status', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOne({
      userId: req.user.id,
      serviceId: service._id
    })

    if (!userService) {
      return res.json({
        active: false,
        webhookUrl: null,
        repositories: [],
        totalEvents: 0
      })
    }

    // Get last webhook event
    const lastEvent = await GithubEvent.findOne({
      userId: req.user.id
    }).sort({ createdAt: -1 })

    // Get all repositories
    const repositories = await GithubRepository.find({
      userId: req.user.id
    })

    res.json({
      active: !!userService.webhookUrl,
      webhookUrl: userService.webhookUrl,
      repositories: repositories.map(repo => repo.fullName),
      lastReceived: lastEvent?.createdAt || null,
      totalEvents: await GithubEvent.countDocuments({ userId: req.user.id }),
      totalRepositories: repositories.length
    })
  } catch (error) {
    console.error('Error checking webhook status:', error)
    res.status(500).json({ error: 'Failed to check webhook status' })
  }
})

// Remove webhook
router.post('/remove-webhook', auth, async (req, res) => {
  try {
    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOne({
      userId: req.user.id,
      serviceId: service._id
    })

    if (!userService) {
      return res.status(400).json({ error: 'GitHub not connected' })
    }

    // Disable webhook in UserService
    userService.webhookUrl = null
    userService.webhookSecret = null
    await userService.save()

    res.json({
      success: true,
      message: 'Webhook removed successfully'
    })
  } catch (error) {
    console.error('Error removing webhook:', error)
    res.status(500).json({ error: 'Failed to remove webhook' })
  }
})

// Connect GitHub
router.get('/connect', auth, async (req, res) => {
  try {
    const { code } = req.query

    if (code) {
      const tokenData = await githubService.exchangeCodeForToken(code)

      const service = await Service.findOne({ name: 'github' })
      const userService = await UserService.findOneAndUpdate(
        { userId: req.user.id, serviceId: service._id },
        {
          accessToken: tokenData.access_token,
          status: 'connected',
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      )

      const userInfo = await githubService.getUserInfo(tokenData.access_token)
      userService.githubUsername = userInfo.login
      await userService.save()

      res.json({ success: true, message: 'GitHub connected successfully' })
    } else {
      const authUrl = githubService.getOAuthUrl()
      res.json({ authUrl })
    }
  } catch (error) {
    console.error('Error connecting GitHub:', error)
    res.status(500).json({ error: 'Failed to connect GitHub' })
  }
})

// Save GitHub token
router.post('/token', auth, async (req, res) => {
  try {
    const { token } = req.body

    const service = await Service.findOne({ name: 'github' })
    const userService = await UserService.findOneAndUpdate(
      { userId: req.user.id, serviceId: service._id },
      {
        accessToken: token,
        status: 'connected',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    const userInfo = await githubService.getUserInfo(token)
    userService.githubUsername = userInfo.login
    await userService.save()

    res.json({ success: true, message: 'GitHub token saved successfully' })
  } catch (error) {
    console.error('Error saving GitHub token:', error)
    res.status(500).json({ error: 'Failed to save GitHub token' })
  }
})

module.exports = router
