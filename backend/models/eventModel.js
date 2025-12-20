const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Open' },
  image: { type: String, required: true }, // <--- New: Cover Art
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);