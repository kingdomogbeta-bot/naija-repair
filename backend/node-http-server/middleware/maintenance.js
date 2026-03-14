const Settings = require('../settings/settings.schema');
const jwt = require('jsonwebtoken');

exports.checkMaintenance = async (req, res, next) => {
  try {
    const maintenanceSetting = await Settings.findOne({ key: 'maintenanceMode' });
    
    if (maintenanceSetting && maintenanceSetting.value === true) {
      // Check if request has a valid admin token
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWTSECRET);
          const User = require('../user/user.schema');
          const user = await User.findById(decoded.id).select('role');
          if (user && user.role === 'admin') isAdmin = true;
        } catch {}
      }
      if (isAdmin) return next();
      return res.status(503).json({ 
        maintenance: true,
        message: 'Site is currently under maintenance. Please check back later.' 
      });
    }
    
    next();
  } catch (error) {
    next();
  }
};
