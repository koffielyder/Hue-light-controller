const router = require('./router')
const streamController = require('../controllers/streamController');

// Define bridge routes
router.post('/connect', streamController.connect);
router.get('/:groupId/connect', streamController.connect);

router.post('/queue/add', streamController.addQueue);
router.get('/queue/add', streamController.addQueueTest);

router.post('/queue/next', streamController.playNext);
router.get('/queue/next', streamController.playNext);




module.exports = router.expressRouter;