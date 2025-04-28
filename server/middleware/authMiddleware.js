const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ msg: 'No token. Authorization denied.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) return res.status(401).json({ msg: 'User not found.' });

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};

module.exports = auth;
