const router = require('./router')
const express = require('express')
const eRouter = express.Router();
const bridgeController = require('../controllers/bridgeController');
const groupRoutes = require('./groupRoutes');

// Define bridge routes
router.get('/', bridgeController.list, eRouter);
router.get('/discover', bridgeController.discover, eRouter);
router.post('/connect', bridgeController.connect, eRouter);
router.get('/connect', bridgeController.connect, eRouter);
router.get('/:id', bridgeController.get, eRouter);
router.get('/:id/sync', bridgeController.sync, eRouter);

// Use routes
eRouter.use('/:bridgeId/groups', groupRoutes);
module.exports = eRouter;