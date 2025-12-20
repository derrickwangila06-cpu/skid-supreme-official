const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');

// POST: Submit a Booking
router.post('/', async (req, res) => {
  try {
    console.log("📥 New Booking Request Received:", req.body);

    const { clientName, email, eventType, details } = req.body;

    // Validation
    if (!clientName || !email || !eventType || !details) {
      console.log("⚠️  Rejected: Missing Fields");
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const newBooking = new Booking({
      clientName,
      email,
      eventType,
      details
    });

    await newBooking.save();
    console.log("✅ Booking Saved!");
    
    res.status(201).json({ message: 'Booking Request Sent Successfully!' });

  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: 'Server Error: Could not save booking.' });
  }
});

// GET: Read all Bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;