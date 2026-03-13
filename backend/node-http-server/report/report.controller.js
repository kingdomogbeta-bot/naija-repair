const Report = require('./report.schema');

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, reporterId: req.user.id, reporterEmail: req.user.email });
    if (global.io) {
      global.io.emit('report_created', report);
    }
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (global.io) {
      global.io.emit('report_updated', report);
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
