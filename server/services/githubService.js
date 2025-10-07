const axios = require('axios')

class GitHubService {
  constructor () {
    this.baseURL = 'https://api.github.com'
    this.clientId = process.env.GITHUB_CLIENT_ID
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET
  }

  async makeRequest (token, endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Webhook-Manager'
        }
      }

      if (
        data &&
        (method === 'POST' || method === 'PATCH' || method === 'PUT')
      ) {
        config.data = data
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error('GitHub API error:', {
        endpoint,
        method,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  }

  async getUserRepositories (token) {
    try {
      let allRepos = []
      let page = 1
      const perPage = 100

      while (true) {
        const repos = await this.makeRequest(
          token,
          `/user/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`
        )

        if (repos.length === 0) break

        allRepos = allRepos.concat(repos)

        // GitHub API limits to 1000 repos max
        if (repos.length < perPage || allRepos.length >= 1000) break

        page++
      }

      return allRepos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        description: repo.description,
        private: repo.private,
        fork: repo.fork,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        language: repo.language,
        defaultBranch: repo.default_branch,
        lastUpdated: repo.updated_at,
        createdAt: repo.created_at,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        hasIssues: repo.has_issues,
        hasProjects: repo.has_projects,
        hasWiki: repo.has_wiki,
        archived: repo.archived,
        disabled: repo.disabled
      }))
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      throw new Error('Failed to fetch repositories from GitHub')
    }
  }

  async getUserInfo (token) {
    try {
      return await this.makeRequest(token, '/user')
    } catch (error) {
      console.error('Error fetching user info from GitHub:', error)
      throw new Error('Failed to fetch user info from GitHub')
    }
  }

  async getRepositoryWebhooks (token, repository) {
    try {
      return await this.makeRequest(token, `/repos/${repository}/hooks`)
    } catch (error) {
      console.error(`Error fetching webhooks for ${repository}:`, error)
      throw new Error(`Failed to fetch webhooks for ${repository}`)
    }
  }

  async createRepositoryWebhook (token, repository, webhookUrl, secret) {
    try {
      const webhookData = {
        name: 'web',
        active: true,
        events: [
          'push',
          'pull_request',
          'issues',
          'issue_comment',
          'create',
          'delete',
          'fork',
          'star',
          'release',
          'watch'
        ],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: secret,
          insecure_ssl: '0'
        }
      }

      const result = await this.makeRequest(
        token,
        `/repos/${repository}/hooks`,
        'POST',
        webhookData
      )

      console.log(`Webhook created for ${repository}: ${result.id}`)

      return {
        success: true,
        webhookId: result.id,
        webhookUrl: result.config.url,
        events: result.events
      }
    } catch (error) {
      console.error(
        `Error creating webhook for ${repository}:`,
        error.response?.data || error.message
      )
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create webhook',
        details: error.response?.data
      }
    }
  }

  async updateRepositoryWebhook (token, repository, webhookId, updates) {
    try {
      const result = await this.makeRequest(
        token,
        `/repos/${repository}/hooks/${webhookId}`,
        'PATCH',
        updates
      )

      return {
        success: true,
        webhookId: result.id
      }
    } catch (error) {
      console.error(`Error updating webhook for ${repository}:`, error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update webhook'
      }
    }
  }

  async deleteRepositoryWebhook (token, repository, webhookId) {
    try {
      await this.makeRequest(
        token,
        `/repos/${repository}/hooks/${webhookId}`,
        'DELETE'
      )

      console.log(`Webhook deleted for ${repository}: ${webhookId}`)

      return {
        success: true,
        message: `Webhook ${webhookId} deleted successfully from ${repository}`
      }
    } catch (error) {
      console.error(`Error deleting webhook for ${repository}:`, error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete webhook'
      }
    }
  }

  async testRepositoryWebhook (token, repository, webhookId) {
    try {
      await this.makeRequest(
        token,
        `/repos/${repository}/hooks/${webhookId}/tests`,
        'POST'
      )

      return { success: true }
    } catch (error) {
      console.error(`Error testing webhook for ${repository}:`, error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to test webhook'
      }
    }
  }

  async getRepository (token, repository) {
    try {
      return await this.makeRequest(token, `/repos/${repository}`)
    } catch (error) {
      console.error(`Error fetching repository ${repository}:`, error)
      throw new Error(`Failed to fetch repository ${repository}`)
    }
  }

  async getRepositoryEvents (token, repository) {
    try {
      return await this.makeRequest(token, `/repos/${repository}/events`)
    } catch (error) {
      console.error(`Error fetching events for ${repository}:`, error)
      throw new Error(`Failed to fetch events for ${repository}`)
    }
  }

  getOAuthUrl () {
    const state = require('crypto').randomBytes(16).toString('hex')
    const scope = 'repo,user,admin:repo_hook'
    return `https://github.com/oauth/authorize?client_id=${this.clientId}&scope=${scope}&state=${state}`
  }

  async exchangeCodeForToken (code) {
    try {
      const response = await axios.post(
        'https://github.com/oauth/access_token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error)
      }

      return response.data
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      throw new Error('Failed to exchange code for token')
    }
  }

  async validateToken (token) {
    try {
      await this.makeRequest(token, '/user')
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.message || 'Invalid token'
      }
    }
  }
}

module.exports = new GitHubService()
