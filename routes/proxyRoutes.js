const express = require('express');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/proxy
// @desc    Proxy an external image to avoid CORS issues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'No image URL provided' });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });

    res.set('Content-Type', response.headers['content-type']);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(response.data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;
