const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');


const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Configure OpenAI API (v4 style)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to generate a witty caption
const generateCaption = async (imageDescription) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',  // or 'gpt-4' if you want
    messages: [
      { role: 'system', content: 'You are a witty internet comedian specializing in dog memes.' },
      { role: 'user', content: `Given the following dog image description, generate a funny short meme caption: "${imageDescription}"` }
    ],
    max_tokens: 60,
    temperature: 0.8,
  });

  return response.choices[0].message.content.trim();
};

// Route 1: Upload and generate meme from uploaded file
router.post('/generate/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const caption = await generateCaption("A cute dog uploaded by user.");

    res.json({ memeUrl: imagePath, caption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Route 2: Generate meme from an online image URL
router.post('/generate/url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'No image URL provided' });

    const caption = await generateCaption("A random dog photo from the internet.");

    res.json({ memeUrl: imageUrl, caption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const Meme = require('../models/Meme');
const User = require('../models/User');

// Save a meme
router.post('/save', auth, async (req, res) => {
  try {
    const { memeUrl, caption } = req.body;

    if (!memeUrl || !caption) {
      return res.status(400).json({ msg: 'Meme URL and caption are required.' });
    }

    // Create a new meme
    const newMeme = new Meme({
      owner: req.user._id,
      imageUrl: memeUrl,
      caption,
    });

    await newMeme.save();

    // Add meme to user's list
    req.user.memes.push(newMeme._id);
    await req.user.save();

    res.json({ msg: 'Meme saved successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/mine', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('memes');
  
      res.json(user.memes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });

  router.delete('/:id', auth, async (req, res) => {
    try {
      const meme = await Meme.findById(req.params.id);
  
      if (!meme) {
        return res.status(404).json({ msg: 'Meme not found' });
      }
  
      // Make sure the meme belongs to the logged-in user
      if (meme.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
  
      await meme.deleteOne();  // ✅ use deleteOne() not remove()
  
      res.json({ msg: 'Meme deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  

module.exports = router;
