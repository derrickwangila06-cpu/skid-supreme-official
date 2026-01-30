/* =========================================
   1. SERVER SETUP & DEPENDENCIES
   ========================================= */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ➤ Added this back!
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/* =========================================
   2. CLOUDINARY CONFIGURATION
   ========================================= */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dj-skid-uploads',
        resource_type: 'auto',
        allowed_formats: ['mp3', 'm4a', 'jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

/* =========================================
   3. DATABASE CONNECTION
   ========================================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ Database Connection Error:', err));

/* =========================================
   4. DATA MODELS
   ========================================= */
const MixSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    audio: String,
    createdAt: { type: Date, default: Date.now }
});
const Mix = mongoose.model('Mix', MixSchema);

const GigSchema = new mongoose.Schema({
    date: String,
    venue: String,
    location: String,
    ticketLink: String
});
const Gig = mongoose.model('Gig', GigSchema);

/* =========================================
   5. API ROUTES
   ========================================= */

// GET MIXES
app.get('/api/mixes', async (req, res) => {
    try {
        const mixes = await Mix.find().sort({ createdAt: -1 });
        res.json(mixes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mixes' });
    }
});

// UPLOAD MIX (Cloud Version)
app.post('/api/mixes', upload.fields([{ name: 'audioFile' }, { name: 'imageFile' }]), async (req, res) => {
    try {
        const audioUrl = req.files['audioFile'] ? req.files['audioFile'][0].path : '';
        const imageUrl = req.files['imageFile'] ? req.files['imageFile'][0].path : '';

        const newMix = new Mix({
            title: req.body.title,
            description: req.body.description,
            audio: audioUrl,
            image: imageUrl
        });

        await newMix.save();
        res.status(201).json({ message: 'Mix Uploaded to Cloud Successfully!' });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// GET GIGS
app.get('/api/gigs', async (req, res) => {
    try {
        const gigs = await Gig.find();
        res.json(gigs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch gigs' });
    }
});

// ADD GIG
app.post('/api/gigs', async (req, res) => {
    try {
        const newGig = new Gig(req.body);
        await newGig.save();
        res.json({ message: 'Gig Added!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add gig' });
    }
});

/* =========================================
   6. SERVE FRONTEND (THE MISSING PIECE)
   ========================================= */
// This tells the server: "Look in the frontend folder for HTML files"
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-All (Optional but safe): Redirect to home if file not found
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* =========================================
   7. START SERVER
   ========================================= */
app.listen(PORT, () => {
    console.log(`🚀 DJ Server (Cloud Edition) running on port ${PORT}`);
});