const stripeService = require('../services/stripeService');
const StripeEvent = require('../db/StripeEvent');
const StripeInvoice = require('../db/StripeInvoice');

exports.stripeWebhook = async (req, res) => {
  try {
    await stripeService.handleWebhook(req);
    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    res.status(500).json({ error: "Webhook failed" });
  }
};

// Get Logs
exports.getLogs = async (req, res) => {
  const logs = await StripeEvent.find().sort({ createdAt: -1 });
  res.json(logs);
};

// Get Invoices
exports.getInvoices = async (req, res) => {
  const invoices = await StripeInvoice.find().sort({ createdAt: -1 });
  res.json(invoices);
};
