const mongoose = require('mongoose');

const stripeInvoiceSchema = new mongoose.Schema({
  paymentIntentId: String,
  customerEmail: String,
  amount: Number,
  currency: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StripeInvoice', stripeInvoiceSchema);
