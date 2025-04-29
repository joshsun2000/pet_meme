const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');


const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + ext);
    }
  });
  
const upload = multer({ storage: storage });

// Configure OpenAI API (v4 style)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCaption = async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',  // or 'gpt-4' if you want
      messages: [
        { role: 'system', content: 'You are a witty internet comedian specializing in dog memes.' },
        { role: 'user', content: 'Imagine that I gave you a funny picture of a dog. Please create a short, funny meme caption based on this image. It is up to you to image what is actually in the image, which can be random. Note that please do not put your response in quotes, and do not include emojis or hashtags in the response.' }
      ],
      max_tokens: 60,
      temperature: 0.8,
    });
  
    return response.choices[0].message.content.trim();
  };

// Helper function: Analyze the dog image and generate a witty caption
const generateCaptionFromImage = async (imageUrl) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a witty internet comedian specializing in dog memes.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Look at this image of a dog. Please create a short, funny meme caption based on the image contents. Note that please do not put your response in quotes, and do not include emojis or hashtags in the response.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });
  
    return response.choices[0].message.content.trim();
  };
  
  // Route 1: Upload and generate meme from uploaded file
  router.post('/generate/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
      const imagePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
      const caption = await generateCaption();
  
      res.json({ memeUrl: imagePath, caption });
    } catch (err) {
      console.error('Upload meme generation error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  
  // Route 2: Generate meme from an online image URL
  router.post('/generate/url', async (req, res) => {
    try {
      let { imageUrl } = req.body;
      if (!imageUrl) return res.status(400).json({ error: 'No image URL provided' });
  
      // If the imageUrl is proxied (starts with your own server), extract the real one
      const match = imageUrl.match(/\/proxy\?url=(.+)/);
      if (match) {
      imageUrl = decodeURIComponent(match[1]);  // get the real CDN URL
      }

      const caption = await generateCaptionFromImage(imageUrl);
  
      res.json({ memeUrl: imageUrl, caption });
    } catch (err) {
      console.error('URL meme generation error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

const Meme = require('../models/Meme');
const User = require('../models/User');

// Save a meme
router.post('/save', auth, async (req, res) => {
    try {
      const { memeUrl, caption, originalImageUrl, fontFamily, fontSize, positionX, positionY } = req.body;
  
      if (!memeUrl || !caption || !originalImageUrl) {
        return res.status(400).json({ msg: 'Meme URL, caption, and original image URL are required.' });
      }
  
      const newMeme = new Meme({
        owner: req.user._id,
        originalImageUrl,
        imageUrl: memeUrl,
        caption,
        fontFamily: fontFamily || 'Arial',
        fontSize: fontSize || 24,
        positionX: positionX ?? 50,
        positionY: positionY ?? 90
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
  
      res.json({
        username: user.username,
        memes: user.memes
      });
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
