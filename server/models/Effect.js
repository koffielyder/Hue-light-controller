const {
  convertFloatTo16Bit
} = require('../services/utilities');

// start: 0, end: 1000, colors: [[0.7006, 0.2993, 200]], formula: 't * t' // red
// start: 2000, end: 3000, colors: [[0.1724, 0.7468, 200]], formula: 't * t' // green
// start: 4000, end: 5000, colors: [[0.1355, 0.0399, 200]], formula: 't * t' // blue


class Effect {
  lightData = null;
  interval = null;
  duration = null;
  parsedEffect = null;
  startLightState = null;
  endLightState = null;
  repeat = false;

  constructor(effectData) {
    this.lightData = effectData.effect;
    this.interval = effectData.interval;
    this.duration = effectData.duration;
    if (effectData.repeat) this.repeat = effectData.repeat;
    if (effectData.startLightState) this.startLightState = effectData.startLightState
    else this.setStartLightState();
  }

  // default start state is off
  setStartLightState() {
    this.startLightState = this.lightData.map(light => [0, 0, 0]);
  }

  parseEffect() {
    this.endLightState = [];
    console.log(this.lightData);
    const lightsData = this.lightData.map((lightData, lightIndex) => {
      const parsed = this.parseLight(lightData, lightIndex);
      return parsed;
    });
    const steps = this.duration / this.interval;
    this.parsedEffect = [];
    for (let i = 0; i < steps; i++) {
      this.parsedEffect.push(lightsData.map(channel => this.parseRgb(channel[i])));
    }
  }

  parseRgb(rgbArray) {
    return [
      convertFloatTo16Bit(rgbArray[0]),
      convertFloatTo16Bit(rgbArray[0]),
      convertFloatTo16Bit(rgbArray[1]),
      convertFloatTo16Bit(rgbArray[1]),
      rgbArray[2],
      rgbArray[2],
    ]
  }

  parseLight(lightData, lightIndex) {
    let index = 0;
    let steps = this.duration / this.interval;
    let lastLightState = this.startLightState[lightIndex];
    const result = [];

    for (let i = 0; i < lightData.length; i++) {
      const stepData = lightData[i];
      const duration = stepData.end - stepData.start;
      const transitionSteps = Math.floor(duration / this.interval);
      if ((stepData.start / this.interval) > index) {
        const lenght = Math.floor(stepData.start / this.interval - index);
        result.push(...Array(lenght).fill(lastLightState))
        index = index + lenght;
      }
      stepData.colors = stepData.colors.map(color => this.parseColor(color, lightIndex, lastLightState))
      // parse transition
      if (!stepData.formula) {
        result.push(stepData.colors[0])
        index++;
      } else {
        result.push(...this.transition([lastLightState, ...stepData.colors], transitionSteps, stepData.formula));
        index = index + transitionSteps;
      }
      lastLightState = result[result.length - 1];
      if (i == lightData.length - 1) {
        if (index < steps - 1) {
          const endLenght = (steps - index);
          result.push(...Array(endLenght).fill(result[result.length - 1]))
          index = index + endLenght;
        }
      }
    }
    this.endLightState.push(result[result.length - 1])

    return result;
  }

  parseColor(color, lightIndex, lastLightState) {
    return color.map((value, index) => {
      if (typeof value === 'number') return value;

      switch (value) {
        case "start":
          return this.startLightState[lightIndex][index]
          break;
        case "last":
          return lastLightState[index]
          break;
      }
    })
  }

  transition(colors,
    steps,
    formula) {
    const fadeArray = [];

    if (colors.length > steps) {
      throw new Error('Number of colors cannot exceed total number of ticks.');
    }

    // Create a function from the formula string
    const fadeFunction = new Function('t', `return ${formula};`);
    // Calculate the steps per color transition
    const transitions = colors.length - 1;
    const stepsPerTransition = Math.floor(steps / transitions);

    for (let transition = 0; transition < transitions; transition++) {
      const color1 = colors[transition];
      const color2 = colors[transition + 1];

      for (let i = 0; i < stepsPerTransition; i++) {
        const t = (i + 1) / stepsPerTransition; // Normalized time (0 to 1)

        // Evaluate the formula to get the adjusted t value
        const adjustedT = fadeFunction(t);

        // Interpolate xyb values
        let x = color1[0] + adjustedT * (color2[0] - color1[0]);
        let y = color1[1] + adjustedT * (color2[1] - color1[1]);
        const b = Math.round(color1[2] + adjustedT * (color2[2] - color1[2]));

        // Create an array of the same color for all lights
        fadeArray.push([x, y, b]);
      }
    }
    return fadeArray;
  }
}

module.exports = Effect;