const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
    date: { type: String, required: true }, // e.g. "24 OCT"
    venue: { type: String, required: true }, // e.g. "Club Cubana"
    location: { type: String, required: true }, // e.g. "Nairobi"
    ticketLink: { type: String, default: '#' } // Link to buy tickets
});

module.exports = mongoose.model('Gig', GigSchema);