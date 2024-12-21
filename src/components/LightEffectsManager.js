import React, { useState, useEffect, useContext } from "react";
import { DataSet, Timeline } from "vis-timeline/standalone";
import AddTransitionForm from "./AddTransitionForm";
import TransitionsList from "./TransitionsList";
import { BridgeContext } from "../context/BridgeContext";
import "./style/LightEffectsManager.css";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

const LightEffectsManager = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(null);
  const { globalGroup } = useContext(BridgeContext);
  const [timeline, setTimeline] = useState(null);
  const [items, setItems] = useState(new DataSet([]));
  const [groups, setGroups] = useState(new DataSet([]));
  const [effectDuration, setEffectDuration] = useState(10000); // Default duration in ms

  useEffect(() => {
    if (timeline) {
      timeline.destroy();
    }

    const container = document.getElementById("timeline");
    const options = {
      editable: true,
      stack: true,
      min: 0,
      max: effectDuration,
      zoomMin: 100,
      zoomMax: effectDuration,
      format: {
        minorLabels: {
          millisecond: "ms",
          second: "s",
        },
        majorLabels: {
          millisecond: "ms",
          second: "s",
        },
      },
      onAdd: (item, callback) => {
        const color = prompt("Enter a color (hex code):", "#ffffff");
        if (color) {
          item.content = `<div style=\"background-color:${color};height:100%;\"></div>`;
          item.color = color;
          callback(item);
          addItemToChannel(item);
        } else {
          callback(null);
        }
      },
      onMove: (item, callback) => {
        updateItemInChannel(item);
        callback(item);
      },
      onRemove: (item, callback) => {
        removeItemFromChannel(item);
        callback(item);
      },
    };

    const newTimeline = new Timeline(container, items, groups, options);
    setTimeline(newTimeline);
  }, [effectDuration]);

  const addItemToChannel = (item) => {
    setChannels((prevChannels) => {
      const updatedChannels = [...prevChannels];
      const channel = updatedChannels.find((ch) => ch.index === item.group);
      if (channel) {
        channel.transitions.push({
          start: item.start,
          end: item.end,
          color: item.color,
        });
      }
      return updatedChannels;
    });
  };

  const updateItemInChannel = (item) => {
    setChannels((prevChannels) => {
      const updatedChannels = [...prevChannels];
      const channel = updatedChannels.find((ch) => ch.index === item.group);
      if (channel) {
        const transition = channel.transitions.find((t) => t.id === item.id);
        if (transition) {
          transition.start = item.start;
          transition.end = item.end;
        }
      }
      return updatedChannels;
    });
  };

  const removeItemFromChannel = (item) => {
    setChannels((prevChannels) => {
      const updatedChannels = [...prevChannels];
      const channel = updatedChannels.find((ch) => ch.index === item.group);
      if (channel) {
        channel.transitions = channel.transitions.filter((t) => t.id !== item.id);
      }
      return updatedChannels;
    });
  };

  const addChannel = () => {
    const newChannelIndex = channels.length;
    setChannels((prev) => [
      ...prev,
      { index: newChannelIndex, transitions: [] },
    ]);
    groups.add({
      id: newChannelIndex,
      content: `Channel ${newChannelIndex}`,
    });
  };

  const parseEffect = () => {
    return channels.map((channel) => ({
      group: channel.index,
      transitions: channel.transitions,
    }));
  };

  const sendLightData = async () => {
    try {
      const effectData = parseEffect();
      await fetch("http://localhost:5000/api/stream/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightData: effectData,
        }),
      });
    } catch (error) {
      console.error("Error sending light data:", error);
    }
  };

  return (
    <div className="effects-manager">
      <h2>Light Effects Manager</h2>
      <label>
        Effect Duration (ms):
        <input
          type="number"
          value={effectDuration}
          onChange={(e) => setEffectDuration(Number(e.target.value))}
        />
      </label>
      <button onClick={addChannel}>Add Channel</button>
      <div id="timeline" style={{ height: "400px" }}></div>
      <button onClick={sendLightData}>Play Effects</button>
    </div>
  );
};

export default LightEffectsManager;
