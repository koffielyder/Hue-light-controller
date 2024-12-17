const express = require('express');
const cors = require('cors');
const bridgeController = require('./controllers/bridgeController');
const groupController = require('./controllers/groupController');
const lightsController = require('./controllers/lightsController');
const effectController = require('./controllers/effectController');
const streamController = require('./controllers/streamController');
const utilities = require('./services/utilities');
const Group = require('./models/Group');
const hueStream = require('./singleton/hueStream');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/test', bridgeController.test);


app.get('/api/bridges', bridgeController.getBridges);
app.get('/api/bridges/discover', bridgeController.discoverBridges);

app.get('/api/bridges/connect/:bridgeIp', (req, res) => {
  req.body = {
    ip: req.params.bridgeIp,
    appName: 'hue light mixer',
    bridgeName: 'bridge pax'
  };
  bridgeController.connectToBridge(req, res);
});

app.post('/api/bridges/connect', bridgeController.connectToBridge);


app.get('/api/bridges/:id/groups', groupController.getGroups);
app.get('/api/bridges/:id/groups/sync', groupController.syncGroups);

app.get('/api/bridges/:id/lights', lightsController.getLights);
app.get('/api/bridges/:id/lights/sync', lightsController.syncLights);

app.get('/api/effects/:groupId/test', effectController.testLights);

app.get('/api/stream/:groupId/start', (req, res) => {
  const group = Group.find(req.params.groupId);
  streamController.createStream(group).then(response => {
    res.json({
      success: true
    })
  }).catch((e) => {
    console.error(e.message);
    res.json({
      success: false
    })
  })

})

app.get('/api/stream/add', streamController.addToQueue);

//app.get('/api/stream/:groupId/effects', effectController.test())



app.get('/api/stream/stop', (req, res) => {
  socket.instance.close();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});