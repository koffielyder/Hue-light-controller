import React, {
  useState
} from "react";
import AddTransitionForm from "./AddTransitionForm";
import TransitionsList from "./TransitionsList";
import "./style/LightEffectsManager.css";

const LightEffectsManager = () => {
  const [channels,
    setChannels] = useState([]);
  const [currentChannelIndex,
    setCurrentChannelIndex] = useState(null);

  const addChannel = () => {
    const newChannel = {
      index: channels.length,
      transitions: []
    };
    setChannels([...channels, newChannel]);
  };

  const updateTransitions = (channelIndex, updatedTransitions) => {
    setChannels((prevChannels) =>
      prevChannels.map((channel) =>
        channel.index === channelIndex
        ? {
          ...channel, transitions: updatedTransitions
        }: channel
      )
    );
  };

  const hexToXyb = (hex) => {
    // Step 1: Convert HEX to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    // Step 2: Normalize RGB to range 0-1
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;

    // Step 3: Apply gamma correction
    const gammaCorrect = (value) =>
    value > 0.04045
    ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4): value / 12.92;

    const rLinear = gammaCorrect(normalizedR);
    const gLinear = gammaCorrect(normalizedG);
    const bLinear = gammaCorrect(normalizedB);

    // Step 4: Convert RGB to XYZ
    const X =
    rLinear * 0.664511 + gLinear * 0.154324 + bLinear * 0.162028;
    const Y =
    rLinear * 0.283881 + gLinear * 0.668433 + bLinear * 0.047685;
    const Z =
    rLinear * 0.000088 + gLinear * 0.072310 + bLinear * 0.986039;

    // Step 5: Convert XYZ to xy
    const sum = X + Y + Z;
    const x = sum === 0 ? 0: X / sum;
    const y = sum === 0 ? 0: Y / sum;

    // Step 6: Set brightness (bri) based on Y, scaled to 0-254
    const bri = Math.round(Y * 254);

    return {
      x: parseFloat(x.toFixed(4)),
      y: parseFloat(y.toFixed(4)),
      bri: bri,
    };
  }



  const sendLightData = async () => {
    channels.push(channels[0]);
    channels.push(channels[0]);
    channels.push(channels[0]);
    console.log(channels);
    try {
      const body = {
        duration: 2000,
        interval: 50,
        repeat: true,
        effect: channels.map(channel => channel.transitions.map(trans => {
          return {
            start: trans.start,
            end: trans.end,
            formula: trans.formula,
            color: hexToXyb(trans.color),
          }
        }))
      };

      const res = await fetch('http://localhost:5000/api/stream/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Sending JSON data
        },
        body: JSON.stringify({lightData: body})
      });

      const data = await res.json();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="effects-manager">
      <h2>Light Effects Manager</h2>
      <button onClick={addChannel} className="add-channel-button">
        Add Channel
      </button>

      <div className="channels-list">
        {channels.map((channel) => (
          <div
            key={channel.index}
            className={`channel-card ${currentChannelIndex === channel.index ? "active": ""
            }`}
            onClick={() => setCurrentChannelIndex(channel.index)}
            >
            <h3>Channel {channel.index}</h3>
            <p>
              Transitions: {channel.transitions.length}
            </p>
          </div>
        ))}
      </div>

      {currentChannelIndex !== null && (
        <>
          <AddTransitionForm
            transitions={channels[currentChannelIndex].transitions}
            onUpdate={(updated) => updateTransitions(currentChannelIndex, updated)}
            />
          <TransitionsList
            transitions={channels[currentChannelIndex].transitions}
            onUpdate={(updated) => updateTransitions(currentChannelIndex, updated)}
            />
        </>
      )}

      <button onClick={sendLightData} className="add-channel-button">
        Send
      </button>
    </div>
  );
};

export default LightEffectsManager;