const router = require('./router')
const bridgeController = require('../controllers/bridgeController');
const groupRoutes = require('./groupRoutes');

// Define bridge routes
router.get('/', bridgeController.list);
router.get('/discover', bridgeController.discover);
router.post('/connect', bridgeController.connect);
router.get('/connect', bridgeController.connect);
router.get('/:id', bridgeController.get);
router.get('/:id/sync', bridgeController.sync);

// Use routes
router.expressRouter.use('/:bridgeId/groups', groupRoutes);
module.exports = router.expressRouter;