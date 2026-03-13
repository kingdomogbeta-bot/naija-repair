const Settings = require('../settings/settings.schema');

exports.checkMaintenance = async (req, res, next) => {
  try {
    const bypassRoutes = ['/api/users/login', '/api/users/register'];
    if (bypassRoutes.includes(req.path)) {
      return next();
    }

    const maintenanceSetting = await Settings.findOne({ key: 'maintenanceMode' });
    
    if (maintenanceSetting && maintenanceSetting.value === true) {
      if (req.user && req.user.role === 'admin') {
        return next();
      }
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
