const router = require('./router')
const express = require('express')
const eRouter = express.Router({
  mergeParams: true
});
const streamController = require('../controllers/streamController');

// Define bridge routes
router.post('/connect', streamController.connect, eRouter);
router.get('/:groupId/connect', streamController.connect, eRouter);
router.get('/disconnect', streamController.disconnect, eRouter);
router.post('/disconnect', streamController.disconnect, eRouter);

router.get('/status', streamController.status, eRouter);

router.post('/queue/add', streamController.addQueue, eRouter);
router.get('/queue/add', streamController.addQueueTest, eRouter);

router.post('/queue/next', streamController.playNext, eRouter);
router.get('/queue/next', streamController.playNext, eRouter);


module.exports = eRouter;