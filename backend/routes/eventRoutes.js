const express = require('express');
const router = express.Router();
const Event = require('../models/eventModel');
const upload = require('../middleware/uploadMiddleware'); // Reusing your upload logic

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST new event (Now supports image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, venue, date, status } = req.body;
    
    // Check if image exists
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an event cover image' });
    }

    const newEvent = new Event({ 
      title, 
      venue, 
      date, 
      status,
      image: req.file.path // Save the file path
    });
    
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating event' });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;