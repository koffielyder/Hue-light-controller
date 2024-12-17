const utilities = require('../services/utilities');

module.exports = {
  get: (url, callback, eRouter) => {
    return eRouter.get(url, utilities.serverResponse(callback))
  },
  post: (url, callback, eRouter) => {
    return eRouter.post(url, utilities.serverResponse(callback))
  },
};