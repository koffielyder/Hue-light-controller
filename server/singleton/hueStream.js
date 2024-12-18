const Group = require('../models/Group');
const Effect = require('../models/Effect');
const utilities = require('../services/utilities');


class HueStream {
  socket = null;
  group = null;
  lights = null;
  isStreaming = false;
  isIdle = true;
  activeEffect = null;
  effectQueue = [];
  lastLightState = null;
  idleEffect = null;
  isTesting = false;

  constructor() {
    if (HueStream.instance) return HueStream.instance
    HueStream.instance = this;
  }

  setGroup(group) {
    if (group instanceof Group) this.group = group;
    else this.group = Group.find(group);
  }

  setIdleEffect() {
    if (!this.idleEffect) {
      try {
        this.idleEffect = new Effect({
          duration: 6000,
          interval: 25,
          repeat: true,
          startLightState: this.lastLightState,
          effect: this.lights.map(light => [{
            start: 0, end: 100, colors: [["start", "start", "start"]], formula: 't' // green
          },
            {
              start: 100, end: 300, colors: [["start", "start", 100]], formula: 't' // red
            },
            {
              start: 300, end: 500, colors: [["start", "start", "start"]], formula: 't' // green
            },
            {
              start: 500, end: 700, colors: [["start", "start", 100]], formula: 't' // red
            },
            {
              start: 700, end: 900, colors: [["start", "start", "start"]], formula: 't' // green
            },]),
        });
        this.idleEffect.parseEffect();
      } catch (err) {
        console.log(err)
        throw err;
      }

    }

  }


  async syncLights() {
    let lights = null;
    if (!this.isTesting) {
      lights = await this.group.getLightStatuses();
    } else {
      lights = this.group.lightApiIds.map(light => {
        return {
          color: {
            xy: {
              x: 0.1,
              y: 0.1
            },
          },
          dimming: {
            brightness: 50.5
          }
        }
      });
    }
    this.lights = lights.map(
      lightData => [lightData.color.xy.x, lightData.color.xy.y, Math.round(lightData.dimming.brightness * 2.55)]
    );
    this.lastLightState = this.lights;
    this.setIdleEffect();
    return this.lights;
  }

  setSocket(socket, playIdle = true) {
    this.socket = socket;
    this.isStreaming = true;
    if (playIdle) this.playIdle();
  }

  async playIdle(ignoreSocket = false) {
    if (!this.idleEffect) throw new Error('Idle effect not created')
    if (!this.idleEffect.parsedEffect) throw new Error('Idle effect not parsed')
    if (!ignoreSocket) this.setActiveEffect(this.idleEffect);
    this.lastLightState = this.idleEffect.endLightState;
    this.isIdle = true;
  }

  setActiveEffect(effect) {
    this.isIdle = false;
    this.removeActiveEffect();
    let i = 0;
    const max = (effect.duration / effect.interval) - 1;
    this.activeEffect = setInterval(() => {
      if (i >= max) {
        if (effect.repeat) i = 0;
        else this.playNext()
      }
      try {
        const message = utilities.buildStreamMessage(this.group.apiId, effect.parsedEffect[i]);
        if (!this.isTesting) this.socket.send(message,
          (error) => {
            if (error) console.error('❌ Failed to send UDP stream:', error);
            // else console.log(`📡 Stream message sent`);
          });
      } catch (err) {
        console.error('Failed to build message')
        console.log(err)
      }

      i++;

    },
      effect.interval)
    return true;
  }

  playNext() {
    if (this.effectQueue.length) {
      this.setActiveEffect(this.effectQueue[0]);
      this.isIdle = false;
      this.effectQueue.shift();
      return true;
    } else {
      if (this.isIdle) return false;
      this.playIdle()
      return true;
    }
  }

  async playEffect(effect) {
    if (!(effect instanceof Effect)) effect = new Effect( {
      ...effect, startLightState: this.lastLightState,
    });
    if (!effect.parsedEffect) await effect.parseEffect();
    return this.setActiveEffect(effect);
  }

  removeActiveEffect() {
    if (this.activeEffect !== null) clearInterval(this.activeEffect);
  }

  async addToQueue(effect) {
    if (!(effect instanceof Effect)) effect = new Effect( {
      ...effect, startLightState: this.lastLightState,
    });
    if (!effect.parsedEffect) await effect.parseEffect();
    this.effectQueue.push(effect);
    this.lastLightState = effect.endLightState;
    return effect;
  }


  async closeSocket() {
    this.isStreaming = false;
    if (this.isTesting) return true;
    if (this.socket) {
      try {
        await this.socket.close();
      } catch (err) {
        if (err.code !== "ERR_SOCKET_DGRAM_NOT_RUNNING") throw err;
      }
    }
    this.socket = null;
    await this.group.deactivateStreaming();
    return true;
  }
}

module.exports = new HueStream();