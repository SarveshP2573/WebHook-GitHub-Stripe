const ngrok = require('ngrok')

class NgrokService {
  constructor() {
    this.ngrokUrl = process.env.NGROK_URL || 'http://localhost:5000'
this.isConnected = !!process.env.NGROK_URL

  }

  async startNgrok(port = process.env.PORT || 5000) {
    if (this.isConnected) {
      console.log(`✅ Using existing Ngrok URL from CLI: ${this.ngrokUrl}`)
    } else {
      console.log('🔄 No Ngrok URL provided, falling back to local URL')
    }
    return this.ngrokUrl
  }

  async stopNgrok() {
    console.log('⚠️ Stop called, but Ngrok is managed externally via CLI')
    this.isConnected = false
    this.ngrokUrl = 'http://localhost:5000'
  }

  getNgrokUrl() {
    return this.ngrokUrl
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      ngrokUrl: this.ngrokUrl
    }
  }
}

module.exports = new NgrokService()
