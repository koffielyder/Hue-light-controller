import React, { useState, useContext } from "react";
import AddTransitionForm from "./AddTransitionForm";
import TransitionsList from "./TransitionsList";
import { BridgeContext } from "../context/BridgeContext";
import "./style/LightEffectsManager.css";
import { hexToXyb } from "../utils/colorUtils";

const LightEffectsManager = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(null);
  const { globalGroup } = useContext(BridgeContext);

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
        ? { ...channel, transitions: updatedTransitions }
        : channel
      )
    );
  };

  const sendLightData = async () => {
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
          };
        }))
      };

      const res = await fetch('http://localhost:5000/api/stream/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lightData: body })
      });

      const data = await res.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createChannelsForGroup = () => {
    console.log(globalGroup)
    if (globalGroup && globalGroup.lights) {
      globalGroup.lights.forEach((light, index) => {
        const newChannel = {
          index: channels.length + index,
          transitions: [],
          lightName: light.name
        };
        setChannels(prevChannels => [...prevChannels, newChannel]);
      });
    }
  };

  return (
    <div className="effects-manager">
      <h2>Light Effects Manager</h2>
      <button onClick={addChannel} className="add-channel-button">
        Add Channel
      </button>

      <button onClick={createChannelsForGroup} className="add-channel-button">
        Create Channels for Selected Group
      </button>

      <div className="channels-list">
        {channels.map((channel) => (
          <div
            key={channel.index}
            className={`channel-card ${currentChannelIndex === channel.index ? "active" : ""}`}
            onClick={() => setCurrentChannelIndex(channel.index)}
          >
            <h3>Channel {channel.index}</h3>
            <p>Transitions: {channel.transitions.length}</p>
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
