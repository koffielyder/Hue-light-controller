const hue = require('node-hue-api');
const axios = require('axios');
const Bridge = require('../models/Bridge');
const Group = require('../models/Group');
const Effect = require('../models/Effect');
const hueStream = require('../singleton/hueStream');
exports.test = async (req, res) => {
  hueStream.setGroup(6);
  const lightsData = await hueStream.syncLights();

  res.json(lightsData)
  return;

  const lights = Array(4).fill(0);
  const effect = new Effect( {
    duration: 5000,
    interval: 50,
    repeat: true,
    lights: lights.map(light => [{
      start: 0, end: 1000, colors: [[0.7006, 0.2993, 200]], formula: 't * t'
    },
      {
        start: 2000, end: 3000, colors: [[0.1724, 0.7468, 200]], formula: 't * t'
      },
      {
        start: 4000, end: 5000, colors: [[0.1355, 0.0399, 200]], formula: 't * t'
      }]),
  })
  effect.parseEffect();
  if (res) res.json(effect.parsedEffect);
};
exports.getBridges = async (req, res) => {
  try {
    res.json({
      message: 'Hue Bridges found',
      bridges: Bridge.all(),
    });
  } catch (error) {
    console.error('Error getting bridges:', error);
    res.status(500).json({
      error: 'Failed to get Hue bridges', details: error.message
    });
  }
};

exports.discoverBridges = async (req, res) => {
  try {
    // Use the discovery method directly from the default export
    const bridges = await hue.discovery.nupnpSearch(); // Local network discovery

    if (bridges.length === 0) {
      return res.status(404).json({
        message: 'No Hue Bridges found on the local network.'
      });
    }

    res.json({
      message: 'Hue Bridges found',
      bridges: bridges.map((bridge) => ({
        name: bridge.config.name,
        ipaddress: bridge.ipaddress,
      })),
    });
  } catch (error) {
    console.error('Error discovering bridges:', error);
    res.status(500).json({
      error: 'Failed to discover Hue bridges', details: error.message
    });
  }
};


// Function to connect to a bridge and create a user
exports.connectToBridge = async (req, res) => {
  const {
    ip,
    appName,
    bridgeName
  } = req.body; // Expect IP address and app name from the request body

  if (!ip || !appName) {
    return res.status(400).json({
      error: 'ip and appName are required'
    });
  }
  try {

    const bridge = connectToBridgeFunc(ip, appName, bridgeName);
    res.json({
      message: 'Successfully connected to the bridge!',
      apiKey: bridge.apikey,
      appName: bridge.appName,
      ip: bridge.ip,
    });
  } catch (error) {
    if (error.getHueErrorType && error.getHueErrorType() === 101) {
      console.error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
      res.status(500).json({
        error: 'The Link button on the bridge was not pressed',
        details: error.message,
      });
    } else {
      console.error(`Unexpected Error: ${error.message}`);
      res.status(500).json({
        error: 'Failed to connect to the Hue Bridge',
        details: error.message,
      });
    }

  };


}
async function connectToBridgeFunc(ip, appName, bridgeName) {
  // Create an unauthenticated connection to the bridge
  const unauthenticatedApi = await hue.api.createLocal(ip).connect();

  // Create a new user (requires the link button to be pressed)
  const createdUser = await unauthenticatedApi.users.createUser(appName);

  return Bridge.make({
    apikey: createdUser.username,
    clientkey: createdUser.clientkey,
    name: bridgeName,
    app: appName,
    ip: ip,
  })
}

// connectToBridgeFunc("192.168.178.228", "new-hue-node", "someNamei");