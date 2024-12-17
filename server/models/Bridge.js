const Model = require('./Model');
const Light = require('./Light');

class Bridge extends Model {
  static fields = {
    name: {
      required: true,
      defaultValue: null,
        type: 'string',
      },
      ip: {
        required: true,
        type: 'string',
      },
      apikey: {
        required: false,
      },
      clientkey: {
        required: false,
      },
      app: {
        required: true
      }
    }


    async getLightStatuses() {
      return await Light.getLightStatuses(this.ip, this.apikey);
    }

    async syncGroups() {
      return await Group.getAllGroups(this.ip, this.apikey);
    }


  }

  module.exports = Bridge;