const hue = require('node-hue-api');
const Group = require('../models/Group');
const Bridge = require('../models/Bridge');
const axios = require('axios');

const utilities = require('../services/utilities');

exports.list = getGroups;
exports.sync = syncGroups;

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