const Group = require('../models/Group');
const Light = require('../models/Light');
const hueStream = require('../singleton/hueStream');
const utilities = require('../services/utilities');

const axios = require('axios');
const {
  dtls
} = require("node-dtls-client");

exports.createStream = async (group) => {
  await oldActivateStreaming(group);
  hueStream.setGroup(group)
  await hueStream.syncLights();

  const bridgeIp = group.bridge.ip;
  const bridgeClientkey = group.bridge.clientkey;

  const pskBinary = Buffer.from(bridgeClientkey, 'hex');
  const options = {
    type: "udp4",
    address: bridgeIp,
    port: 2100,
    psk: {
      "hue-application-id": pskBinary // Key should be binary (not a hex string)
    },
    timeout: 2000,
    ciphers: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
  };
  hueStream.setSocket(await openSocket(options));
  return hueStream;
}

exports.addToQueue = (req, res) => {
  if (!hueStream.isStreaming) return res.json({
    success: false,
    message: "Hue stream is not active"
  })
  try {
    const effectData = {
      effect,
      interval,
      duration
    } = req.body;
    await hueStream.addToQueue(effectData);
    res.json({
      success: true,
      queue: hueStream.effectQueue.length
    })
  } catch (err) {
    res.json({
      success: false,
      message: err.message
    })
    console.log(err);
  }
}


// activate stream on group
async function activateStreaming(group) {
  try {

    if (!group.type == 'entertainment' || !group.apiId) throw new Error(`Group with id ${group.id} does not have a apiId`)
    const url = `https://${group.bridge.ip}/clip/v2/resource/entertainment_configuration/${group.apiId}`;
    const response = await axios.put(url, {
      action: "start"
    }, {
      headers: {
        'hue-application-key': group.bridge.apikey
      }
    });
    console.log('Streaming activated:', response.data);
    return {
      active: true,
    };
  } catch (err) {
    console.error('Error activating streaming:', err.message);
    throw err;
  }
}

async function oldActivateStreaming(group) {
  try {
    const url = `http://${group.bridge.ip}/api/${group.bridge.apikey}${group.idv1}`;
    const response = await axios.put(url, {
      stream: {
        active: true
      }
    })

    if (response.error) throw new Error(error);
    console.log('Streaming activated:', response.data);
    return response;
  } catch (err) {
    console.error('Error activating streaming:', err.message);
    throw err;
  }
}

async function deactivateStreaming(group) {
  try {
    const url = `http://${group.bridge.ip}/api/${group.bridge.apikey}${group.idv1}`;
    const response = await axios.put(url, {
      stream: {
        active: false
      }
    });
    if (response.error) throw new Error(error);
    console.log('Streaming deactivated:', response.data);
    return response;
  } catch (err) {
    console.error('Error deactivating streaming:', err.message);
    throw err;
  }
}


// start streaming


async function openSocket(options, retryIndex = 0, maxRetry = 3) {
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
        closeSocket(socket);
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
      closeSocket(socket).then(response => {
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
      closeSocket(socket).then(response => {
        process.exit(0);
      }); // Gracefully close the DTLS stream
    } catch (error) {
      console.warn(error.message);
      setTimeout(() => process.exit(0),
        1000); // Give it time to close before forcing exit
    }
  });
}

async function closeSocket(socket) {
  if (socket) {
    try {
      await socket.close();
    } catch(err) {
      if (err.code !== "ERR_SOCKET_DGRAM_NOT_RUNNING") throw err;
    }
  }

  await deactivateStreaming(hueStream.group);
  return true;
}