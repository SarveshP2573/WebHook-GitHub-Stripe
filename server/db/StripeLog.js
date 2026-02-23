const mongoose = require('mongoose');

const stripeLogSchema = new mongoose.Schema({
  eventId: String,
  type: String,
  data: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StripeLog', stripeLogSchema);
