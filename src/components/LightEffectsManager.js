import React, { useState, useEffect, useContext } from "react";
import AddTransitionForm from "./AddTransitionForm";
import TransitionsList from "./TransitionsList";
import { BridgeContext } from "../context/BridgeContext";
import "./style/LightEffectsManager.css";
import { hexToXyb } from "../utils/colorUtils";

const LightEffectsManager = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(null);
  const { globalGroup } = useContext(BridgeContext);
  const [audio, setAudio] = useState(null);
  const [bpm, setBpm] = useState(120); // Default BPM
  const [duration, setDuration] = useState(2000); // Default duration in ms
  const [interval, setInterval] = useState(500); // Default interval in ms

  // Calculate interval whenever BPM changes
  useEffect(() => {
    const calculatedInterval = calculateSmallestInterval(bpm);
    setInterval(calculatedInterval);
  }, [bpm]);

  // Preload the audio when the component mounts
  useEffect(() => {
    const audioInstance = new Audio("/sounds/song.mp3");
    audioInstance.preload = "auto";
    setAudio(audioInstance);
  }, []);

  const calculateSmallestInterval = (bpm) => {
    const beatDuration = 60000 / bpm; // Duration of one beat in milliseconds
    const minInterval = 50; // Minimum allowed interval in milliseconds
    let interval = beatDuration;
  
    while (interval > minInterval) {
      interval /= 2; // Halve the interval to create smaller subdivisions
    }
    interval *= 2;
  
    return Math.max(interval, minInterval); // Ensure it does not go below the minimum
  };

  const addChannel = () => {
    const newChannel = {
      index: channels.length,
      transitions: [],
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

  const parseEffect = () => {
    return {
      duration,
      interval,
      repeat: true,
      effect: channels.map((channel) =>
        channel.transitions.map((trans) => {
          return {
            start: trans.start,
            end: trans.end,
            formula: trans.formula,
            color: hexToXyb(trans.color),
          };
        })
      ),
    };
  };

  const addToQueue = async () => {
    console.log(parseEffect());
    return
    try {
      const res = await fetch("http://localhost:5000/api/stream/queue/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightData: parseEffect(),
        }),
      });

      const data = await res.json();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendLightData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stream/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightData: parseEffect(),
        }),
      });

      const data = await res.json();

      // Play preloaded audio after successful response
      if (res.ok && audio) {
        audio.currentTime = 0; // Ensure the audio starts from the beginning
        audio.play();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stopMusic = async () => {
    audio.pause();
    audio.currentTime = 0; // Ensure the audio starts from the beginning
  };

  const createChannelsForGroup = () => {
    console.log(globalGroup);
    if (globalGroup && globalGroup.lights) {
      globalGroup.lights.forEach((light, index) => {
        const newChannel = {
          index: channels.length + index,
          transitions: [],
          lightName: light.name,
        };
        setChannels((prevChannels) => [...prevChannels, newChannel]);
      });
    }
  };

  return (
    <div className="effects-manager">
      <h2>Light Effects Manager</h2>
      <div className="controls">
        <label>
          BPM:
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
        </label>
        <label>
          Duration (ms):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <p>Interval: {interval.toFixed(2)} ms</p>
      </div>
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
            className={`channel-card ${
              currentChannelIndex === channel.index ? "active" : ""
            }`}
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

      <button onClick={addToQueue} className="add-channel-button">
        Add to queue
      </button>
      <button onClick={sendLightData} className="add-channel-button">
        Play now
      </button>
      <button onClick={stopMusic} className="add-channel-button">
        Stop music
      </button>
    </div>
  );
};

export default LightEffectsManager;
