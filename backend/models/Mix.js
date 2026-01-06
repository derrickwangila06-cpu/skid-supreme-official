const mongoose = require('mongoose');

// This is the Blueprint
const MixSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    audioLink: { type: String, required: true }, // The link to the song
    coverArt: { type: String, default: 'logo.jpg' }, // Default image if none provided
    downloads: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mix', MixSchema);