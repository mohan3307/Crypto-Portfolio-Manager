const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const { symbol, coinName, type, value, note } = req.body;
    const alert = new Alert({
      userId: req.user.id,
      symbol,
      coinName,
      type,
      value,
      note
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user.id });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    alert.active = !alert.active;
    alert.triggered = false; // Reset if toggled
    await alert.save();
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
