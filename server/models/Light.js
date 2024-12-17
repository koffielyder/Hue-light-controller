const Model = require('./Model');
const Bridge = require('./Bridge');
const axios = require('axios');

class Light extends Model {
  static fields() {
    return {
      name: {
        required: true,
      },
      apiId: {
        required: true,
      },
      bridgeId: {
        required: true,
      }
    }
  }

  static relations = {
    bridge: {
      localKey: "bridgeId",
      type: "belongsTo",
      model: Bridge,
    }
  }



  static async getLightStatuses(bridgeIp, apiKey) {
    try {
      const response = await axios.get(`https://${bridgeIp}/clip/v2/resource/light`, {
        headers: {
          'hue-application-key': apiKey
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to get light statuses:', error.message);
    }
  }
}

module.exports = Light;