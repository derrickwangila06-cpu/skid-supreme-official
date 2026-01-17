// --- 1. SETUP & IMPORTS ---
const path = require('path');
// Point to .env file safely so it never fails
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

// Import Models
const Mix = require('./models/Mix');
const Gig = require('./models/Gig');

const app = express();

app.use(cors());
app.use(express.json());

// --- 2. CONFIGURE FILE STORAGE ---
const uploadDir = path.join(__dirname, 'uploads');
// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, Date.now() + '-' + cleanName);
    }
});

const upload = multer({ storage: storage });

// --- 3. DATABASE CONNECTION (FIXED FOR DNS ERRORS) ---
const dbUri = process.env.MONGO_URI;

if (!dbUri) {
    console.error("❌ ERROR: MONGO_URI is missing in .env file");
} else {
    // FIX: specific options to bypass DNS SRV errors
    const clientOptions = {
        serverSelectionTimeoutMS: 5000,
        family: 4 // Force IPv4 to fix 'ECONNREFUSED' errors
    };

    mongoose.connect(dbUri, clientOptions)
        .then(() => console.log("✅ MongoDB Connected Successfully"))
        .catch(err => {
            console.error("❌ MongoDB Connection Error:", err);
            console.log("💡 TIP: If this fails, check your internet or firewall.");
        });
}

// --- 4. SERVE FILES ---
// Serve the Website (Frontend)
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve Uploaded Music/Images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 5. API ROUTES
// ==========================================

// --- MIXES ROUTES ---

// GET ALL MIXES
app.get('/api/mixes', async (req, res) => {
    try {
        const mixes = await Mix.find().sort({ uploadDate: -1 });
        res.json(mixes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPLOAD MIX (Audio + Cover)
const mixUpload = upload.fields([
    { name: 'audio', maxCount: 1 }, 
    { name: 'cover', maxCount: 1 }
]);

app.post('/api/mixes', mixUpload, async (req, res) => {
    try {
        console.log("📥 Upload Request Received...");

        // Safety Check: Do files exist?
        if (!req.files) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
        const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

        if (!audioFile) {
            return res.status(400).json({ error: "Audio file is required!" });
        }

        // Create links
        const audioLink = `/uploads/${audioFile.filename}`;
        const coverArt = coverFile ? `/uploads/${coverFile.filename}` : 'logo.jpg';

        const { title, description } = req.body;
        const newMix = new Mix({ title, description, audioLink, coverArt });
        
        await newMix.save();
        console.log("🎉 Mix Saved Successfully!");
        res.json(newMix);

    } catch (err) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DOWNLOAD COUNTER
app.post('/api/mixes/:id/download', async (req, res) => {
    try {
        const mix = await Mix.findById(req.params.id);
        if (mix) {
            mix.downloads += 1;
            await mix.save();
            res.json({ downloads: mix.downloads });
        } else {
            res.status(404).json({ error: "Mix not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE MIX
app.delete('/api/mixes/:id', async (req, res) => {
    try {
        const mix = await Mix.findByIdAndDelete(req.params.id);
        if (!mix) return res.status(404).json({ error: "Mix not found" });
        res.json({ message: "Mix deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GIGS ROUTES ---

// GET ALL GIGS
app.get('/api/gigs', async (req, res) => {
    try {
        const gigs = await Gig.find();
        res.json(gigs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD GIG
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

// DELETE GIG
app.delete('/api/gigs/:id', async (req, res) => {
    try {
        await Gig.findByIdAndDelete(req.params.id);
        res.json({ message: "Gig deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CATCH-ALL ROUTE ---
app.use((req, res) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.status(404).json({ error: "Not Found" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));