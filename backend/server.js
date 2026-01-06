require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the Blueprint we just made
const Mix = require('./models/Mix');

const app = express();

// Middleware (Allows the frontend to talk to the backend)
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- ROUTES (The API Endpoints) ---

// 1. GET all mixes (For the Homepage)
app.get('/api/mixes', async (req, res) => {
    try {
        // Fetch mixes from DB and sort by newest first (-1)
        const mixes = await Mix.find().sort({ uploadDate: -1 });
        res.json(mixes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST a new mix (For the Dashboard)
app.post('/api/mixes', async (req, res) => {
    try {
        const { title, description, audioLink, coverArt } = req.body;

        // Create a new mix using our Blueprint
        const newMix = new Mix({
            title,
            description,
            audioLink,
            coverArt: coverArt || 'logo.jpg' // Use default if empty
        });

        // Save to Database
        const savedMix = await newMix.save();
        res.json(savedMix);
        console.log("💿 New Mix Uploaded:", title);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE Download Count (When someone clicks download)
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

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));