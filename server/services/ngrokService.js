const ngrok = require('ngrok')

class NgrokService {
  constructor () {
    this.ngrokUrl = null
    this.isConnected = false
    this.fallbackUrl = 'http://localhost:3000'
  }

  async startNgrok (port = 5000) {
    try {
      console.log('🌐 Starting ngrok tunnel with authentication...')

      // Use your auth token directly
      this.ngrokUrl = await ngrok.connect({
        addr: port,
        proto: 'http',
        authtoken: '2yDJLM3R56m4E4atRq3xOA8Tm4W_7pKLWQvvGkL537ZPqsBs9',
        region: 'in'
      })

      console.log(`✅ Authenticated ngrok tunnel created: ${this.ngrokUrl}`)
      this.isConnected = true

      // Set up cleanup
      process.on('SIGINT', async () => {
        console.log('🛑 Closing ngrok tunnel...')
        await this.stopNgrok()
        process.exit(0)
      })

      return this.ngrokUrl
    } catch (error) {
      console.error('❌ Ngrok failed:', error.message)
      console.log('🔄 Falling back to local URL for webhooks')
      this.isConnected = false
      this.ngrokUrl = this.fallbackUrl
      return this.fallbackUrl
    }
  }

  async stopNgrok () {
    try {
      await ngrok.disconnect()
      await ngrok.kill()
      this.isConnected = false
      this.ngrokUrl = null
      console.log('✅ Ngrok tunnel stopped')
    } catch (error) {
      console.error('Error stopping ngrok:', error)
    }
  }

  async getNgrokUrl () {
    return this.isConnected ? this.ngrokUrl : this.fallbackUrl
  }

  getStatus () {
    return {
      isConnected: this.isConnected,
      ngrokUrl: this.ngrokUrl
    }
  }
}

module.exports = new NgrokService()
