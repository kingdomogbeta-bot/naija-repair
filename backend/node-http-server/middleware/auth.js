const jwt = require('jsonwebtoken');
const User = require('../user/user.schema');
const Tasker = require('../tasker/tasker.schema');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    
    // Try to find user first
    let user = await User.findById(decoded.id).select('-password');
    
    // If not found, try tasker
    if (!user) {
      user = await Tasker.findById(decoded.id).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};
