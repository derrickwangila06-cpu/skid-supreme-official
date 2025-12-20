const express = require('express');
const router = express.Router();
const { uploadMix, getMixes, deleteMix } = require('../controllers/mixController');
const upload = require('../middleware/uploadMiddleware');
const multer = require('multer');

// GET all mixes
router.get('/', getMixes);

// POST (Upload) - With Error Handling
router.post('/', (req, res, next) => {
  const uploadTask = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  uploadTask(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: `Upload Error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ message: `Server Error: ${err.message}` });
    }
    // Everything went fine.
    next();
  });
}, uploadMix);

// DELETE a mix
router.delete('/:id', deleteMix);

module.exports = router;