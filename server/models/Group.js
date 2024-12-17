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

    lights: {
      localKey: "id",
      foreignKey: "groupId",
      type: "hasMany",
      model: Light,
    },
    bridge: {
      localKey: "bridgeId",
      type: "belongsTo",
      model: Bridge,
    },
  }

  apiv1Url() {
    return `http://${this.bridge.ip}/api/${this.bridge.apikey}${this.idv1}`;
  }

  async activateStreaming() {
    try {
      let response = await axios.put(this.apiv1Url(), {
        stream: {
          active: true
        }
      })
      if (Array.isArray(response.data)) response = response.data[0]
      if (response.error) throw new Error(response.error.description);
      console.log('Streaming activated:', response.data);
      return response;
    } catch (err) {
      console.error('Error activating streaming:', err.message);
      throw err;
    }
  }


  async deactivateStreaming() {
    try {
      const response = await axios.put(this.apiv1Url(), {
        stream: {
          active: false
        }
      });
      if (response.error) throw new Error(error);
      console.log('Streaming deactivated:', response.data);
      return response;
    } catch (err) {
      console.error('Error deactivating streaming:', err.message);
      throw err;
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