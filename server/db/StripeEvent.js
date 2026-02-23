const mongoose = require('mongoose');

const stripeEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  eventType: { type: String, required: true },
  status: String,
  amount: Number,
  currency: String,
  email: String,
  rawPayload: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StripeEvent', stripeEventSchema);
