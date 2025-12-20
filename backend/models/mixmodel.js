const mongoose = require('mongoose');

const mixSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a mix title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description or tracklist'],
    },
    coverImage: {
      type: String,
      required: [true, 'Please upload a cover image'], // Visuals are key for DJ branding
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio file is required'],
    },
    genre: {
      type: String,
      required: true,
      enum: ['Afrobeat', 'Amapiano', 'HipHop', 'Reggae', 'Dancehall', 'EDM', 'Other'], // Enforce consistency
    },
    plays: {
      type: Number,
      default: 0, // We will increment this on every stream
    },
    downloads: {
      type: Number,
      default: 0, // Critical metric for your client
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Mix', mixSchema);