const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const UserService = require('../db/UserService')
const GithubRepository = require('../db/GithubRepository')
const GithubEvent = require('../db/GithubEvent')
const CodeAnalysis = require('../db/CodeAnalysis')
const geminiService = require('../services/geminiService')

// GitHub webhook handler
router.post('/:userServiceId/:uniqueId', async (req, res) => {
  try {
    const { userServiceId, uniqueId } = req.params

    console.log(`📨 Incoming webhook for userServiceId: ${userServiceId}`)

    // Find user service
    const userService = await UserService.findById(userServiceId)
      .populate('userId')
      .populate('serviceId')

    if (!userService) {
      console.log(`❌ Webhook not found for userServiceId: ${userServiceId}`)
      return res.status(404).json({ error: 'Webhook not found' })
    }

    console.log(`✅ Found user service for user: ${userService.userId._id}`)

    const signature = req.headers['x-hub-signature-256']
    const eventType = req.headers['x-github-event']
    const deliveryId = req.headers['x-github-delivery']

    console.log(
      `🔍 Event: ${eventType}, Delivery: ${deliveryId}, Signature: ${
        signature ? 'Yes' : 'No'
      }`
    )
    console.log(`🔑 Webhook secret exists: ${!!userService.webhookSecret}`)

    // Verify signature if both secret and signature exist
    if (userService.webhookSecret && signature) {
      console.log('🔐 Verifying signature...')

      const expectedSignature =
        'sha256=' +
        crypto
          .createHmac('sha256', userService.webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex')

      console.log(`📥 Expected: ${expectedSignature}`)
      console.log(`📤 Received: ${signature}`)

      if (signature !== expectedSignature) {
        console.log(`❌ Invalid signature for userServiceId: ${userServiceId}`)
        return res.status(401).json({ error: 'Invalid signature' })
      }
      console.log('✅ Signature verified successfully!')
    } else if (signature && !userService.webhookSecret) {
      console.log('⚠️ Signature provided but no webhook secret configured')
    } else if (!signature && userService.webhookSecret) {
      console.log('⚠️ Webhook secret configured but no signature received')
    } else {
      console.log('ℹ️ No signature verification required')
    }

    console.log(`🔄 Processing GitHub event: ${eventType}`)

    // Process GitHub event
    await processGitHubEvent(
      userService.userId._id,
      eventType,
      req.body,
      deliveryId
    )

    console.log(`✅ Successfully processed event: ${eventType}`)

    res.status(200).json({
      success: true,
      message: 'Event processed successfully',
      eventType: eventType
    })
  } catch (error) {
    console.error('❌ Error processing GitHub webhook:', error)
    res.status(500).json({ error: 'Error processing webhook' })
  }
})

// Process GitHub events
async function processGitHubEvent (userId, eventType, payload, deliveryId) {
  try {
    let eventData = {
      userId: userId,
      eventType: eventType,
      repository: payload.repository?.full_name,
      payload: payload,
      deliveryId: deliveryId
    }

    // Common fields for most events
    if (payload.sender) {
      eventData.author = payload.sender.login
      eventData.avatar = payload.sender.avatar_url
    }

    switch (eventType) {
      case 'push':
        eventData = {
          ...eventData,
          branch: payload.ref?.replace('refs/heads/', ''),
          author: payload.pusher?.name || payload.sender?.login,
          message:
            payload.head_commit?.message ||
            `Pushed to ${payload.ref?.replace('refs/heads/', '')}`,
          commitId: payload.head_commit?.id,
          url: payload.head_commit?.url,
          commits: payload.commits?.length || 0
        }

        await processPushForSecurityAnalysis(userId, payload)
        break

      case 'pull_request':
        eventData = {
          ...eventData,
          branch: payload.pull_request?.head?.ref,
          author: payload.pull_request?.user?.login,
          avatar: payload.pull_request?.user?.avatar_url,
          message: payload.pull_request?.title,
          pullNumber: payload.pull_request?.number,
          status: payload.action, // opened, closed, reopened, merged
          url: payload.pull_request?.html_url,
          sourceBranch: payload.pull_request?.head?.ref,
          targetBranch: payload.pull_request?.base?.ref
        }
        break

      case 'issues':
        eventData = {
          ...eventData,
          author: payload.issue?.user?.login,
          avatar: payload.issue?.user?.avatar_url,
          message: payload.issue?.title,
          issueNumber: payload.issue?.number,
          status: payload.action, // opened, closed, reopened, assigned
          url: payload.issue?.html_url,
          priority: determineIssuePriority(payload.issue?.labels)
        }
        break

      case 'issue_comment':
        eventData = {
          ...eventData,
          author: payload.comment?.user?.login,
          avatar: payload.comment?.user?.avatar_url,
          message: payload.comment?.body,
          issueNumber: payload.issue?.number,
          status: payload.action, // created, edited, deleted
          url: payload.comment?.html_url,
          repository: payload.repository?.full_name
        }
        break

      case 'create':
        eventData = {
          ...eventData,
          branch: payload.ref,
          refType: payload.ref_type, // branch or tag
          message: `Created ${payload.ref_type}: ${payload.ref}`
        }
        break

      case 'delete':
        eventData = {
          ...eventData,
          branch: payload.ref,
          refType: payload.ref_type, // branch or tag
          message: `Deleted ${payload.ref_type}: ${payload.ref}`
        }
        break

      case 'fork':
        eventData = {
          ...eventData,
          message: `Forked to ${payload.forkee?.full_name}`,
          url: payload.forkee?.html_url
        }
        break

      case 'star':
        eventData = {
          ...eventData,
          message:
            payload.action === 'created'
              ? 'Starred repository'
              : 'Unstarred repository'
        }
        break

      case 'release':
        eventData = {
          ...eventData,
          author: payload.release?.author?.login,
          message: payload.release?.name || payload.release?.tag_name,
          tag: payload.release?.tag_name,
          url: payload.release?.html_url,
          status: payload.action // published, edited, etc.
        }
        break

      case 'watch':
        eventData = {
          ...eventData,
          message:
            payload.action === 'started'
              ? 'Started watching repository'
              : 'Stopped watching repository'
        }
        break

      default:
        eventData.message = `GitHub ${eventType} event`
        break
    }

    // Save to GitHub events collection
    const githubEvent = await GithubEvent.create(eventData)
    console.log(
      `💾 Saved GitHub event: ${eventType} for user ${userId}, event ID: ${githubEvent._id}`
    )

    // Trigger additional processing
    await triggerEventProcessing(githubEvent)
  } catch (error) {
    console.error('Error processing GitHub event:', error)
    throw error
  }
}

// Determine issue priority from labels
function determineIssuePriority (labels) {
  if (!labels || !Array.isArray(labels)) return 'medium'

  const labelNames = labels
    .map(label => (typeof label === 'string' ? label : label.name))
    .map(name => name.toLowerCase())

  if (
    labelNames.some(
      name => name.includes('critical') || name.includes('urgent')
    )
  ) {
    return 'critical'
  }
  if (
    labelNames.some(name => name.includes('high') || name.includes('important'))
  ) {
    return 'high'
  }
  if (labelNames.some(name => name.includes('low') || name.includes('minor'))) {
    return 'low'
  }
  return 'medium'
}

// Trigger additional event processing
async function triggerEventProcessing (githubEvent) {
  try {
    // Update repository stats if needed
    if (githubEvent.repository) {
      await updateRepositoryStats(githubEvent.userId, githubEvent.repository)
    }

    // Mark as processed
    githubEvent.processed = true
    githubEvent.processedAt = new Date()
    await githubEvent.save()

    console.log(
      `✅ Processed GitHub event: ${githubEvent.eventType} for ${githubEvent.repository}`
    )
  } catch (error) {
    console.error('Error in event processing:', error)
  }
}

// Update repository statistics
async function updateRepositoryStats (userId, repositoryFullName) {
  try {
    const repo = await GithubRepository.findOne({
      userId: userId,
      fullName: repositoryFullName
    })

    if (repo) {
      // Update last activity timestamp
      repo.updatedAt = new Date()
      await repo.save()
    }
  } catch (error) {
    console.error('Error updating repository stats:', error)
  }
}

// Webhook test endpoint
router.post('/:userServiceId/:uniqueId/test', async (req, res) => {
  try {
    const { userServiceId, uniqueId } = req.params
    const { eventType, testData } = req.body

    const userService = await UserService.findById(userServiceId)
    if (!userService) {
      return res.status(404).json({ error: 'Webhook not found' })
    }

    // Create a test event
    const testEvent = {
      eventType: eventType || 'push',
      repository: 'test-owner/test-repo',
      author: 'test-user',
      message: 'Test webhook event',
      payload: testData || { test: true }
    }

    await processGitHubEvent(
      userService.userId,
      testEvent.eventType,
      testEvent.payload,
      'test-delivery-id'
    )

    res.json({
      success: true,
      message: 'Test event processed successfully',
      event: testEvent
    })
  } catch (error) {
    console.error('Error in webhook test:', error)
    res.status(500).json({ error: 'Error processing test event' })
  }
}) // Process push events for security analysis - FIXED VERSION
async function processPushForSecurityAnalysis (userId, payload) {
  try {
    console.log('🚀 STARTING SECURITY ANALYSIS PROCESS')
    console.log('👤 User ID:', userId)
    console.log('📦 Payload received:', {
      repository: payload.repository?.full_name,
      commitSha: payload.head_commit?.id,
      hasCommits: !!payload.commits?.length,
      commitsCount: payload.commits?.length
    })

    // FIXED: First get the GitHub service ID, then find UserService
    const Service = require('../db/Service')
    const githubService = await Service.findOne({ name: 'github' })

    if (!githubService) {
      console.log('❌ GitHub service not found in database')
      return
    }

    console.log('🔍 GitHub service ID:', githubService._id)

    // FIXED: Find UserService using the serviceId ObjectId
    const userService = await UserService.findOne({
      userId: userId,
      serviceId: githubService._id
    })

    console.log('🔍 UserService found:', !!userService)
    console.log('🔑 Access token exists:', !!userService?.accessToken)

    if (!userService) {
      console.log('❌ UserService not found for user:', userId)
      return
    }

    if (!userService.accessToken) {
      console.log('❌ No GitHub access token for security analysis')
      return
    }

    const repository = payload.repository.full_name
    const commitSha = payload.head_commit.id
    const commitMessage = payload.head_commit.message

    console.log(
      `🔍 Starting security analysis for: ${repository} - ${commitSha}`
    )

    // Get the code content
    console.log('📥 Fetching code content...')
    const codeContent = await getSimpleCodeContent(
      userService.accessToken,
      repository,
      commitSha
    )

    console.log('📄 Code content result:', {
      found: !!codeContent,
      filename: codeContent?.filename,
      language: codeContent?.language,
      contentLength: codeContent?.content?.length
    })

    if (!codeContent) {
      console.log('❌ No code content found to analyze')
      return
    }

    // Analyze with Gemini
    console.log('🤖 Sending to Gemini for analysis...')
    const analysis = await geminiService.analyzeCode(
      codeContent.content,
      codeContent.language,
      codeContent.filename
    )

    console.log('📊 Gemini analysis result:', {
      success: !!analysis,
      securityIssues: analysis?.security_issues?.length,
      overallScore: analysis?.overall_score
    })

    // Save analysis
    console.log('💾 Saving analysis to database...')
    const savedAnalysis = await CodeAnalysis.create({
      userId: userId,
      repository: repository,
      commitSha: commitSha,
      commitMessage: commitMessage,
      author: payload.pusher?.name,
      branch: payload.ref?.replace('refs/heads/', ''),
      filesAnalyzed: [
        {
          filename: codeContent.filename,
          language: codeContent.language,
          analysis: analysis
        }
      ]
    })

    console.log(
      `✅ Security analysis saved for ${repository}, ID: ${savedAnalysis._id}`
    )
    console.log('🎉 SECURITY ANALYSIS COMPLETED SUCCESSFULLY')
  } catch (error) {
    console.error('❌ Security analysis error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    })
  }
}

// Simple function to get code content - DEBUG VERSION
// Fixed function to prioritize CODE files over README
async function getSimpleCodeContent (token, repository, commitSha) {
  try {
    console.log('🔍 Searching for code files...')
    const axios = require('axios')

    // FIRST: Get commit files to see what was actually changed
    console.log('📁 Getting commit files...')
    const commitResponse = await axios({
      method: 'GET',
      url: `https://api.github.com/repos/${repository}/commits/${commitSha}`,
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    const commitFiles = commitResponse.data.files || []
    console.log(`📄 Found ${commitFiles.length} files in commit`)

    commitFiles.forEach(file => {
      console.log(`   - ${file.filename} (${file.status})`)
    })

    // PRIORITIZE CODE FILES over README
    const codeExtensions = [
      '.java',
      '.js',
      '.py',
      '.cpp',
      '.ts',
      '.html',
      '.css',
      '.php',
      '.rb',
      '.go',
      '.cs',
      '.c'
    ]

    // Find the first CODE file that was modified/added
    const codeFile = commitFiles.find(file => {
      const isCodeFile = codeExtensions.some(ext => file.filename.endsWith(ext))
      const isModified = file.status === 'modified' || file.status === 'added'
      return isCodeFile && isModified
    })

    if (codeFile) {
      console.log(
        `✅ Found code file: ${codeFile.filename} (${codeFile.status})`
      )
      const fileResponse = await axios({
        method: 'GET',
        url: `https://api.github.com/repos/${repository}/contents/${codeFile.filename}?ref=${commitSha}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      const content = Buffer.from(fileResponse.data.content, 'base64').toString(
        'utf8'
      )
      const language = getLanguageFromFile(codeFile.filename)
      console.log(
        `📝 Code file content length: ${content.length}, language: ${language}`
      )
      return { content, language, filename: codeFile.filename }
    }

    // Only if NO code files found, check for README
    console.log('📖 No code files found, checking for README...')
    const readmeFiles = ['README.md', 'readme.md', 'README.txt']

    for (const filename of readmeFiles) {
      try {
        console.log(`   Trying README: ${filename}`)
        const response = await axios({
          method: 'GET',
          url: `https://api.github.com/repos/${repository}/contents/${filename}?ref=${commitSha}`,
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        })

        const content = Buffer.from(response.data.content, 'base64').toString(
          'utf8'
        )
        console.log(
          `✅ Found README: ${filename}, content length: ${content.length}`
        )
        return { content, language: 'markdown', filename }
      } catch (error) {
        console.log(`   README not found: ${filename}`)
        continue
      }
    }

    console.log('❌ No suitable files found for analysis')
    return null
  } catch (error) {
    console.error('❌ Error getting code content:', error.message)
    return null
  }
}

// Helper function to detect language from filename
function getLanguageFromFile (filename) {
  const extensionMap = {
    '.java': 'java',
    '.js': 'javascript',
    '.py': 'python',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.ts': 'typescript',
    '.html': 'html',
    '.css': 'css',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go'
  }

  for (const [ext, lang] of Object.entries(extensionMap)) {
    if (filename.endsWith(ext)) {
      return lang
    }
  }

  return 'text'
}

module.exports = router
