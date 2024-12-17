const hue = require('node-hue-api');
const axios = require('axios');
const Bridge = require('../models/Bridge');
const Group = require('../models/Group');
const Effect = require('../models/Effect');
const hueStream = require('../singleton/hueStream');

exports.list = Bridge.all.bind(Bridge);
exports.get = getBridge;
exports.discover = discoverBridges;
exports.connect = connectToBridge;
exports.sync = syncBridge;


async function getBridge(id = 1) {
  const bridge = Bridge.find(id);
  if (bridge) return bridge;
  throw new Error(`Bridge with id '${id}' not found`, 404)
}

async function discoverBridges() {
  const bridges = await hue.discovery.nupnpSearch(); // Local network discovery
  if (bridges.length === 0) throw Error('No Hue Bridges found on the local network.')
  return bridges.map(bridge => ({
    name: bridge.config.name,
    ipaddress: bridge.ipaddress,
  }));
}

// Function to connect to a bridge and create a user
async function connectToBridge (ip = "192.168.178.228", appName = 'hue-light-controller', bridgeName = 'new bridge') {
  if (!ip || !appName || !bridgeName) throw new Error('ip, appName and bridgeName are required');
  try {
    console.log(ip)
    const unauthenticatedApi = await hue.api.createLocal(ip).connect();
    const createdUser = await unauthenticatedApi.users.createUser(appName); // Create a new user (requires the link button to be pressed)

    return Bridge.make({
      apikey: createdUser.username,
      clientkey: createdUser.clientkey,
      name: bridgeName,
      app: appName,
      ip: ip,
    })
  } catch (error) {
    if (error.getHueErrorType && error.getHueErrorType() === 101) {
      throw new Error('The Link button on the bridge was not pressed')
    } else {
      throw error;
    }
  };
}

async function syncBridge(id) {
  const bridge = getBridge(id);
  return await bridge.syncGroups();
}