const Model = require('./Model');
const Bridge = require('./Bridge');
const Light = require('./Light');
const axios = require('axios');

class Group extends Model {
  static fields = {
    name: {
      required: true,
    },
    lightApiIds: {
      defaultValue: [],
    },
    apiId: {
      required: true,
    },
    idv1: {
      required: true,
    },
    type: {
      required: true,
      defaultValue: 'entertainment',
    },
    bridgeId: {
      required: true,
    },
  }

  static relations = {
    bridge: {
      localKey: "bridgeId",
      type: "belongsTo",
      model: Bridge,
    },
    lights: {
      localKey: "id",
      foreignKey: "groupId",
      type: "hasMany",
      model: Light,
    }
  }

  static async syncGroups(bridge) {
    // Use the discovery method directly from the default export
    axios.get(`https://${bridge.ip}/clip/v2/resource/entertainment_configuration`, {
      headers: {
        'hue-application-key': bridge.apikey
      }
    }).then(response => {
      const groups = response.data.data.map(apiGroup => {
        return {
          name: apiGroup.name,
          type: 'entertainment',
          bridgeId: bridge.id,
          apiId: apiGroup.id,
          idv1: apiGroup.id_v1,
          lightApiIds: apiGroup.light_services.map(service => service.rid)
        }
      })

      return Group.updateOrCreate(groups, 'apiId');
    })
  }

  async getActiveStreamer(bridge) {
    // Use the discovery method directly from the default export
    return await axios.get(`https://${this.bridge.ip}/clip/v2/resource/entertainment_configuration/${this.apiId}`, {
      headers: {
        'hue-application-key': this.bridge.apikey
      }
    });
  }

  async getLightStatuses() {
    try {
      const lights = await Light.getLightStatuses(this.bridge.ip, this.bridge.apikey)
      const self = this;
      return lights.filter(item => self.lightApiIds.includes(item.id)).sort((a, b) => {
        return self.lightApiIds.indexOf(a.id) - self.lightApiIds.indexOf(b.id);
      });
    } catch (error) {
      console.error('Failed to get light statuses:', error.message);
      throw error;
    }
  }

}

module.exports = Group;