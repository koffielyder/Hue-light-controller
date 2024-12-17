const router = require('./router')
const express = require('express')
const eRouter = express.Router({
  mergeParams: true
});
const groupController = require('../controllers/groupController');

// Define bridge routes
router.get('/', groupController.list, eRouter);
router.get('/sync', groupController.sync, eRouter);

module.exports = eRouter;