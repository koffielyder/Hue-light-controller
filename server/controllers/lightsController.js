const hue = require('node-hue-api');
const Light = require('../models/Light');
const Bridge = require('../models/Bridge');


exports.syncLights = async (req, res) => {

  try {
    const bridgeId = req.params.id;
    const bridge = Bridge.find(bridgeId);

    const lights = await bridge.getLightStatuses();

    res.json({
      message: 'All lights',
      lights,
    });
  } catch (err) {
    console.error('Error fetching lights:', err);
  }
}

exports.getLights = async (req, res) => {
  const bridgeId = req.params.id;

  res.json({
    message: 'All lights',
    lights: Light.where('bridgeId', bridgeId),
  });
}