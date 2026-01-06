require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import Models
const Mix = require('./models/Mix');
const Gig = require('./models/Gig'); // ADDED GIG MODEL

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ==========================================
// API ROUTES
// ==========================================

// --- MIXES ROUTES (Existing) ---
app.get('/api/mixes', async (req, res) => {
    try {
        const mixes = await Mix.find().sort({ uploadDate: -1 });
        res.json(mixes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/mixes', async (req, res) => {
    try {
        const { title, description, audioLink, coverArt } = req.body;
        const newMix = new Mix({
            title, description, audioLink, coverArt: coverArt || 'logo.jpg'
        });
        await newMix.save();
        res.json(newMix);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/mixes/:id/download', async (req, res) => {
    try {
        const mix = await Mix.findById(req.params.id);
        mix.downloads += 1;
        await mix.save();
        res.json({ downloads: mix.downloads });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GIGS ROUTES (NEWLY ADDED) ---
app.get('/api/gigs', async (req, res) => {
    try {
        const gigs = await Gig.find(); // Fetch all gigs
        res.json(gigs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/gigs', async (req, res) => {
    try {
        const { date, venue, location, ticketLink } = req.body;
        const newGig = new Gig({ date, venue, location, ticketLink });
        await newGig.save();
        res.json(newGig);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-All
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));