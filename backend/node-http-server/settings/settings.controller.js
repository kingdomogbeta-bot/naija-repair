const Settings = require('./settings.schema');

exports.getSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      return res.json({ success: true, value: null });
    }
    res.json({ success: true, value: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
