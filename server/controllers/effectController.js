const hue = require('node-hue-api');
const Group = require('../models/Group');
const Bridge = require('../models/Bridge');
const {
  entertainmentApi,
  LightState
} = hue;
const dgram = require('dgram');
const crypto = require('crypto');
const axios = require('axios');
const {
  dtls
} = require("node-dtls-client");

// Entertainment area configuration
const entertainmentPort = 2100;

exports.testLights = async (req, res) => {

  try {
    main(req.params.groupId);
    res.json({
      message: 'Streaming',
    });
  } catch (err) {
    console.error('Error: ', err);
  }
}




function main(groupId) {
  console.log("func: main");
  try {

    const group = Group.find(groupId);
    const bridge = Bridge.find(group.bridgeId);
    const lights = group.lights.map(light => [1, 0, 0]);

    if (!group.entertainmentId) {
      console.log("main if");

      const url = `https://${bridge.ip}/clip/v2/resource/entertainment_configuration`;

      axios.get(url, {
        headers: {
          'hue-application-key': bridge.apikey
        }
      })
      .then(response => {
        group.entertainmentId = response.data.data[0].id;
        group.save();
        // activateStreaming(bridge.ip, bridge.apikey, group.apiId).then(isActive => {
        // createStream(bridge, group);
        // })
      })
      .catch(error => {
        console.error('Error fetching entertainment id:', error);
      });
    } else {
      console.log("main else");

      activateStreaming(bridge.ip, bridge.apikey, 200).then(isActive => {
        createStream(bridge, group);
      })
    }

    return;


    // Start streaming
    console.log('Streaming session started!');
    res.json({
      message: 'Streaming',
    });
  } catch (err) {
    console.error('Error: ', err);
  }
}




async function activateStreaming(bridgeIp, username, groupId) {
  try {
    const url = `http://${bridgeIp}/api/${username}/groups/${groupId}`;
    const response = await axios.put(url, {
      stream: {
        active: true
      }
    });
    console.log('Streaming activated:', response.data);
    return response;
  } catch (err) {
    console.error('Error activating streaming:', err);
  }
}



async function createStream(bridge, group) {
  console.log({
    bridge
  });
  const bridgeIp = bridge.ip;
  const bridgeClientkey = bridge.clientkey;
  const pskBinary = Buffer.from(bridgeClientkey, 'hex');
  const options = {
    type: "udp4",
    address: bridgeIp,
    port: 2100,
    psk: {
      "hue-application-id": pskBinary // Key should be binary (not a hex string)
    },
    timeout: 3000,
    ciphers: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
  };
  const socket = dtls.createSocket(options /* DtlsOptions */)
  // subscribe events
  .on("connected", () => {
    console.log("connected to stream");
    const entertainmentConfigId = group.entertainmentId;

    const blue = [0x00, 0x00, 0x00, 0x00, 0xff, 0xff,];
    const red = [255, 255, 0, 0, 0, 0,];


    let channels = [{
      id: 0
    }, {
      id: 1
    }];
    const sequenceId = 7;
    let i = 1;
    setInterval(() => {
      if (i % 2 === 0) {
        channels[0].rgb = blue;
        channels[1].rgb = red;
      } else {
        channels[1].rgb = blue;
        channels[0].rgb = red;
      }
      sendStreamMessage(socket, sequenceId, channels, entertainmentConfigId)
      i++;
    },
      500)
  })
  .on("error", (e /* Error */) => {
    console.error(e)
  })
  .on("message", (msg /* Buffer */) => {
    console.log(msg)
  })
  .on("close", () => {
    console.log("Stream closed")
  });

  // Handle Ctrl + C (SIGINT)
  process.on('SIGINT', () => {
    console.log("\nCaught interrupt signal (Ctrl + C). Closing stream...");
    try {
      socket.close(); // Gracefully close the DTLS stream
      setTimeout(() => process.exit(0),
        1000); // Give it time to close before forcing exit
    } catch (error) {
      console.warn(error.message);
      process.exit(0);
    }

  });

  // Handle process termination (like kill command)
  process.on('SIGTERM', () => {
    console.log("\nCaught SIGTERM. Closing stream...");
    socket.close();
    setTimeout(() => process.exit(0),
      1000);
  });
}




/**
* 2️⃣ Build Stream Message
*/
function buildStreamMessage(sequenceId, channels, entertainmentId) {

  // Static protocol name used by the API
  const protocolName = Buffer.from("HueStream", "ascii")

  const restOfHeader = Buffer.from([
    0x02, 0x00, /* Streaming API version 2.0 */
    0x01, /* sequence number 1 (This is currently not used by the Hue Hub) */
    0x00, 0x00, /* Reserved - just fill with 0's */
    0x00, /* specifies RGB color (set 0x01 for xy + brightness) */
    0x00, /* Reserved - just fill with 0's */
  ])

  // Id of the entertainment area to control
  const entertainmentConfigurationId = Buffer.from(entertainmentId, "ascii")
  channelData = channels.map(channel => Buffer.from([channel.id,
    ...channel.rgb]));

  // Concat everything together to build the command
  const buffer = Buffer.concat([
    protocolName,
    restOfHeader,
    entertainmentConfigurationId,
    ...channelData,])

  return buffer;
}

/**
* 3️⃣ Send UDP Stream
*/
function sendStreamMessage(socket, sequenceId, channels, entertainmentConfigId) {
  const message = buildStreamMessage(sequenceId, channels, entertainmentConfigId);
  socket.send(message, (error) => {
    if (error) console.error('❌ Failed to send UDP stream:', error);
    else console.log(`📡 Stream message sent (sequenceId: ${sequenceId})`);
  });
}

// main(1);