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
const bridgeRoutes = require('./routes/bridgeRoutes');
const streamRoutes = require('./routes/streamRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Use routes
app.use('/api/bridges', bridgeRoutes);

app.use('/api/stream', streamRoutes);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});