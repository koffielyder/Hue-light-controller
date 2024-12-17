const hue = require('node-hue-api');
const Group = require('../models/Group');
const Bridge = require('../models/Bridge');
const axios = require('axios');

exports.syncGroups = async (req, res) => {

  try {
    const bridgeId = req.params.id;
    const bridge = Bridge.find(bridgeId);
    console.log({
      bridge
    })

    const url = `https://${bridge.ip}/clip/v2/resource/entertainment_configuration`;

    console.log({
      url
    });

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

    Group.updateOrCreate(groups, 'apiId');

    res.json({
      message: 'All groups synced',
      groups,
    });
  } catch (err) {
    console.error('Error fetching lights:', err);
  }
}

exports.getGroups = async (req, res) => {
  const bridgeId = req.params.id;

  res.json({
    message: 'All groups',
    groups: Group.where('bridgeId', bridgeId),
  });
}