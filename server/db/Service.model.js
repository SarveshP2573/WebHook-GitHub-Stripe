const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g. "slack", "stripe"
    unique: true
  },
  description: {
    type: String
  }
})

module.exports = mongoose.model('Service', serviceSchema)
