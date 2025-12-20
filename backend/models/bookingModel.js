const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  eventType: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Defaults to 'Pending'
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);