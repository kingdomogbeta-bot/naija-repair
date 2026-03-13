const Favorite = require('./favorite.schema');

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.json({ success: true, data: favorites.map(f => f.taskerId) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { taskerId } = req.body;
    const favorite = await Favorite.create({ userId: req.user.id, taskerId });
    res.json({ success: true, data: favorite });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { taskerId } = req.params;
    await Favorite.deleteOne({ userId: req.user.id, taskerId });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
