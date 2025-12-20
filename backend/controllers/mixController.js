const Mix = require('../models/mixModel');
const fs = require('fs');
const path = require('path');

// @desc    Get all mixes
// @route   GET /api/mixes
const getMixes = async (req, res) => {
  try {
    const mixes = await Mix.find().sort({ createdAt: -1 }); // Newest first
    res.json(mixes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload a new mix
// @route   POST /api/mixes
const uploadMix = async (req, res) => {
  try {
    const { title, description, genre } = req.body;

    if (!req.files || !req.files.audio || !req.files.image) {
      return res.status(400).json({ message: 'Please upload both audio and image' });
    }

    const newMix = new Mix({
      title,
      description,
      genre,
      audioUrl: req.files.audio[0].path,
      coverImage: req.files.image[0].path,
    });

    const savedMix = await newMix.save();
    res.status(201).json(savedMix);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a mix
// @route   DELETE /api/mixes/:id
const deleteMix = async (req, res) => {
  try {
    const mix = await Mix.findById(req.params.id);

    if (!mix) {
      return res.status(404).json({ message: 'Mix not found' });
    }

    // 1. Delete the files from the computer to save space
    // We try/catch this in case the file was already deleted manually
    try {
        const audioPath = path.join(__dirname, '..', mix.audioUrl);
        const imagePath = path.join(__dirname, '..', mix.coverImage);

        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    } catch (err) {
        console.error("File deletion error:", err);
    }

    // 2. Delete from Database
    await mix.deleteOne();

    res.json({ message: 'Mix removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMixes, uploadMix, deleteMix };