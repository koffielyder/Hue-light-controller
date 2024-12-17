const router = require('./router')

const groupController = require('../controllers/groupController');

// Define bridge routes
router.get('/', groupController.list);
router.get('/sync', groupController.sync);

module.exports = router.expressRouter;