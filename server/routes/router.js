const express = require('express');
const expressRouter = express.Router({
  mergeParams: true
});
const utilities = require('../services/utilities');

module.exports = {
  expressRouter,
  get: (url, callback) => {
    return expressRouter.get(url, utilities.serverResponse(callback))
  },
  post: (url, callback) => {
    return expressRouter.post(url, utilities.serverResponse(callback))
  },
};