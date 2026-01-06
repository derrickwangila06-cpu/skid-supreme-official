require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // 1. Import the GPS tool

const Mix = require('./models/Mix');

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- SERVE FRONTEND (THE FIX) ---
// "path.join" tells the server: Start here (__dirname), go UP one level (..), THEN go to frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// --- API ROUTES ---
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
            title,
            description,
            audioLink,
            coverArt: coverArt || 'logo.jpg'
        });
        const savedMix = await newMix.save();
        res.json(savedMix);
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

// --- CATCH-ALL ROUTE (Safety Net) ---
// If the server gets a request it doesn't understand, send the website HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));