const hue = require('node-hue-api');
const Group = require('../models/Group');
const Bridge = require('../models/Bridge');
const axios = require('axios');

const utilities = require('../services/utilities');
const isTesting = true;
exports.list = getGroups;
exports.sync = syncGroups;
exports.lights = groupLights;

async function getGroups(bridgeId) {
  const groups = Group.where('bridgeId', bridgeId);
  return groups;
}

async function syncGroups(bridgeId) {

  const bridge = Bridge.find(bridgeId);
  const url = `https://${bridge.ip}/clip/v2/resource/entertainment_configuration`;

  const groupsResponse = await axios.get(url, {
    headers: {
      'hue-application-key': bridge.apikey, // Use the username as the app key for the v2 API
    },
  });
  const groups = groupsResponse.data.data.map((group) => {
    group.idv1 = group.id_v1;
    group.apiId = group.id;
    group.bridgeId = bridge.id;
    group.lightApiIds = group.light_services.map(service => service.rid)
    return group;
  });

  return Group.updateOrCreate(groups, 'apiId');
}

async function groupLights(groupId) {
  const group = Group.find(groupId);
  let lights = null;
  if (!isTesting) {
    lights = await group.getLightStatuses();
  } else {
    lights = group.lightApiIds.map((light, index) => {
      return {
        name: "light: " + index,
        index,
        color: {
          xy: {
            x: 0.1,
            y: 0.1
          },
        },
        dimming: {
          brightness: 50.5
        }
      }
    });
  }
  return lights;
}