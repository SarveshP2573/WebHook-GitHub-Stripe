// Simple webhook receiver - just log the incoming webhooks
exports.receiveWebhook = async (req, res) => {
  try {
    const { serviceName, userServiceId, uniqueId } = req.params
    const payload = req.body
    const headers = req.headers

    console.log(`📨 Received webhook for ${serviceName}:`, {
      userServiceId,
      uniqueId,
      payload: payload,
      headers: headers
    })

    // Just acknowledge receipt - no processing
    res.json({
      success: true,
      message: 'Webhook received successfully',
      service: serviceName,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webhook reception error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
