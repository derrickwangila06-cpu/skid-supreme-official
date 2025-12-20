const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const mixRoutes = require('./routes/mixRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const eventRoutes = require('./routes/eventRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));

// --- API ROUTES ---
app.use('/api/mixes', mixRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);

// --- SERVE STATIC FILES (IMAGES/AUDIO) ---
// This allows the frontend to see the uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SERVE FRONTEND (PRODUCTION MODE) ---
// This tells the server: "If anyone visits the website, show them the frontend folder"
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is ONLINE and running on port ${PORT}`);
});