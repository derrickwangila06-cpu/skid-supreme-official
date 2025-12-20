const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the File System module

// 1. Configure Storage Engine with AUTO-CREATE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';

    // Determine correct folder
    if (file.fieldname === 'audio') {
      uploadPath = 'uploads/audio/';
    } else {
      uploadPath = 'uploads/images/';
    }

    // *** MAGIC FIX: Create folder if it doesn't exist ***
    // This prevents the ENOENT error permanently
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Initialize Multer (High Limits for m4a)
const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // Increased to 300MB for safety
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. Flexible File Validation
const checkFileType = (file, cb) => {
  if (file.fieldname === 'audio') {
    // Allow mp3, wav, m4a, mp4
    const filetypes = /mp3|mpeg|wav|m4a|mp4/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Audio files only (MP3, WAV, M4A)!'));
    }
  } else {
    // Images
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
};

module.exports = upload;