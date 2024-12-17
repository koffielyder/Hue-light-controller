module.exports = {
  pascalCaseToSnakeCase: (str) => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscores between lowercase and uppercase letters
    .toLowerCase() // Convert everything to lowercase
    .replace(/^_/, ''); // Remove leading underscore, if any
  },
  convertFloatTo16Bit: (value) => {
    return Math.max(0, Math.min(65535, Math.round(value * 65535)));
  },
  buildStreamMessage: (entertainmentId, channels) => {
    // Static protocol name used by the API
    const protocolName = Buffer.from("HueStream", "ascii")
    const restOfHeader = Buffer.from([
      0x02, 0x00, /* Streaming API version 2.0 */
      0x01, /* sequence number 1 (This is currently not used by the Hue Hub) */
      0x00, 0x00, /* Reserved - just fill with 0's */
      0x01, /* specifies RGB color (set 0x01 for xy + brightness) */
      0x00, /* Reserved - just fill with 0's */
    ])

    // Id of the entertainment area to control
    const entertainmentConfigurationId = Buffer.from(entertainmentId, "ascii")
    const channelData = channels.map((channel, index) => {
      return Buffer.from([
        index,
        (channel[0] >> 8) & 0xff, channel[0] & 0xff, // X in Big Endian
        (channel[2] >> 8) & 0xff, channel[2] & 0xff, // Y in Big Endian
        channel[4],
        channel[5],
      ]);
    });
    // Create the buffer



    // Concat everything together to build the command
    const buffer = Buffer.concat([
      protocolName,
      restOfHeader,
      entertainmentConfigurationId,
      ...channelData,])

    return buffer;
  },
  serverResponse: (action, errorMessage = "Request failed", throwErr = false) => {
    return async (req, res) => {

      try {
        funcArguments = (action + '')
        .replace(/[/][/].*$/mg, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        //.replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
        const args = [];
        const provided = {
          ...req.params,
          ...req.body,
        };
        for (let i = 0; i < funcArguments.length; i++) {
          let arg = funcArguments[i];
          if (arg.includes('=')) {
            // has default value
            arg = arg.split('=');
            if (provided[arg[0]]) args.push(provided[arg[0]])
            else args.push(arg[1].substring(1, arg[1].length-1));
          } else {
            // is required
            if (provided[arg]) args.push(provided[arg])
            else throw new Error(`Required param ${arg} not set`)
          }
        }
        const response = await action(...args);
        res.json(response)
      } catch(err) {
        console.error(errorMessage,
          err);
        res.status(500).json({
          error: errorMessage,
          details: err.message
        });
        if (throwErr) throw err;
      }
    }
  }

}