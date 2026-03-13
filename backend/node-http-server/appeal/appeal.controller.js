const Appeal = require('./appeal.schema');

exports.submitAppeal = async (req, res) => {
  try {
    const appeal = await Appeal.create(req.body);
    if (global.io) {
      global.io.emit('appeal_submitted', appeal);
    }
    res.status(201).json({ success: true, data: appeal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: appeals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppeal = async (req, res) => {
  try {
    const appeal = await Appeal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (global.io) {
      global.io.emit('appeal_updated', appeal);
    }
    res.json({ success: true, data: appeal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
