const jwt = require('jsonwebtoken');
const Tasker = require('../tasker/tasker.schema');

exports.protectTasker = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    req.tasker = await Tasker.findById(decoded.id).select('-password');
    
    if (!req.tasker) {
      return res.status(401).json({ message: 'Tasker not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};