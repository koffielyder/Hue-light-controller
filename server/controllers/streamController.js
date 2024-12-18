const Group = require('../models/Group');
const Light = require('../models/Light');
const hueStream = require('../singleton/hueStream');
const utilities = require('../services/utilities');

const axios = require('axios');
const {
  dtls
} = require("node-dtls-client");

// connect
exports.connect = connectSocket;
exports.disconnect = disconnectSocket;

// addQueue
exports.addQueue = addToQueue;

exports.addQueueTest = addToQueueTest;

// playNext
exports.playNext = playNextEffect;

exports.play = playEffect;


exports.status = getStatus;


async function connectSocket(groupId, testing = false) {
  console.log(testing == false)
  console.log(testing)
  const group = Group.find(groupId, true);
  if (!testing) await group.activateStreaming();
  hueStream.isTesting = testing;
  hueStream.setGroup(group);
  await hueStream.syncLights();
  hueStream.setSocket(await openSocket(socketOptions(group)));
  return true;
}

async function disconnectSocket() {
  return await hueStream.closeSocket();
}

async function addToQueue(lightData) {
  lightData.effect = parseLightData(lightData.effect)
  return await hueStream.addToQueue(lightData)
}

async function addToQueueTest() {
  const lightData = {
    duration: 2000,
    interval: 50,
    effect: hueStream.lights.map(light => [{
      start: 0, end: 900, colors: [["start", "start", 255]], formula: 't'
    },
      {
        start: 900, colors: [["start", "start", 50]]
      },
      {
        start: 1600, end: 2000, colors: [["start", "start", "start"]], formula: 't'
      },
    ]),
  }
  return await addToQueue(lightData)
}

async function playNextEffect() {
  if (!await hueStream.playNext()) throw new Error('queue empty')
  return true;
}

async function playEffect(lightData) {
  lightData.effect = parseLightData(lightData.effect)
  return await hueStream.playEffect(lightData)
}

async function getStatus() {
  return hueStream.isStreaming;
}

function parseLightData(data) {
  return data.map(
    effects => effects.map(effect => {
      return {
        ...effect, colors: [[effect.color.x, effect.color.y, effect.color.bri]]
      }
    })
  )
}

function socketOptions(group) {
  return {
    type: "udp4",
    address: group.bridge.ip,
    port: 2100,
    psk: {
      "hue-application-id": Buffer.from(group.bridge.clientkey, 'hex') // Key should be binary (not a hex string)
    },
    timeout: 2000,
    ciphers: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
  };
}




// start streaming


async function openSocket(options, retryIndex = 0, maxRetry = 3) {
  if (hueStream.isTesting) return true;
  if (hueStream.isStreaming) return true;
  if (retryIndex >= maxRetry) throw new Error(`Failed opening socket after ${retryIndex++} tries`, 569)
  const socket = dtls.createSocket(options);

  return new Promise((resolve, reject) => {
    // Listen for the 'connected' event
    socket.on("connected", () => {
      console.log('connected to hue stream');
      closeStreamOnExit();
      resolve(socket); // Resolve the Promise with the socket
    })
    .on("error", (e /* Error */) => {
      console.log(e);
      if (e.message == 'The DTLS handshake timed out') {
        retryIndex++
        console.log(`DTLS handshake error after ${retryIndex} of ${maxRetry} tries`)

        return resolve(openSocket(options, retryIndex));
      } else {
        hueStream.closeSocket();
        throw e;
      }
    })
    .on("message",
      (msg /* Buffer */) => {
        console.log({
          msg
        })
      })
    .on("close",
      () => {
        console.log("Stream closed")
      })
  });
}

function closeStreamOnExit(socket) {
  process.on('SIGINT', () => {
    console.log("\nCaught interrupt signal (Ctrl + C). Closing stream...");
    try {
      hueStream.removeActiveEffect();
      hueStream.closeSocket().then(response => {
        process.exit(0);
      }); // Gracefully close the DTLS stream
    } catch (error) {
      console.warn(error.message);
      setTimeout(() => process.exit(0),
        1000); // Give it time to close before forcing exit
    }

  });

  // Handle process termination (like kill command)
  process.on('SIGTERM', () => {
    console.log("\nCaught SIGTERM. Closing stream...");
    try {
      hueStream.closeSocket().then(response => {
        process.exit(0);
      }); // Gracefully close the DTLS stream
    } catch (error) {
      console.warn(error.message);
      setTimeout(() => process.exit(0),
        1000); // Give it time to close before forcing exit
    }
  });
}