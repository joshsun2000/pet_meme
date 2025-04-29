require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const memeRoutes = require('./routes/memeRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

connectDB();

const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// File uploads static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/memes', express.static(path.join(__dirname, 'memes')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/proxy', proxyRoutes);

// Serve React build files
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client', 'build')));
    
    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));