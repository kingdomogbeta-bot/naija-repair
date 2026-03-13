const Service = require('./service.schema');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    if (global.io) {
      global.io.emit('service_updated');
    }
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (global.io) {
      global.io.emit('service_updated');
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (global.io) {
      global.io.emit('service_updated');
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
