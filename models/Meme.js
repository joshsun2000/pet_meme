const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalImageUrl: { type: String, required: true },  // ⭐ New field for clean dog photo
  imageUrl: { type: String, required: true },          // Final burned meme image
  caption: { type: String, required: true },            // Caption text
  fontFamily: { type: String, default: 'Arial' },
  fontSize: { type: Number, default: 24 },
  positionX: { type: Number, default: 50 },
  positionY: { type: Number, default: 90 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meme', memeSchema);
