import React, { useState, useEffect, useRef } from "react";
import "./style/Timeline.css";

const Timeline = ({ duration, interval, onDurationChange = () => {} }) => {
  const [channels, setChannels] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fractureLevel, setFractureLevel] = useState(0); // Tracks current fracture level
  const timelineRef = useRef(null);

  useEffect(() => {
    const handleScroll = (event) => {
      if (event.altKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -1 : 1;
        const newZoomLevel = Math.max(1, zoomLevel + delta);

        if (delta > 0 && zoomLevel > 1) {
          setFractureLevel((prev) => prev + 1);
        } else if (delta < 0 && fractureLevel > 0) {
          setFractureLevel((prev) => prev - 1);
        }

        setZoomLevel(newZoomLevel);
      }
    };

    const timelineElement = timelineRef.current;
    timelineElement.addEventListener("wheel", handleScroll);

    return () => {
      timelineElement.removeEventListener("wheel", handleScroll);
    };
  }, [zoomLevel, fractureLevel]);

  const addChannel = () => {
    setChannels((prev) => [...prev, { id: prev.length, items: [] }]);
  };

  const removeChannel = (id) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };

  const addItem = (channelId, position) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId
          ? {
              ...channel,
              items: [...channel.items, { id: channel.items.length, position }],
            }
          : channel
      )
    );
  };

  const renderNoteLines = (channelId) => {
    const lines = [];
    const baseInterval = interval / (1 << fractureLevel);

    for (let i = 0; i <= duration; i += baseInterval) {
      let label = "1/1";
      if (fractureLevel > 0) {
        const divisor = 1 << fractureLevel;
        label = `1/${divisor}`;
      }

      lines.push(
        <div
          key={`${channelId}-line-${i}`}
          className="note-line"
          style={{ left: `${(i / duration) * 100}%` }}
        >
          <div className="note-label">{`${i.toFixed(0)}ms (${label})`}</div>
        </div>
      );
    }

    return lines;
  };

  const handleChannelClick = (e, channelId) => {
    const rect = e.target.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * duration;
    addItem(channelId, position);
  };

  const handleChannelScroll = (event) => {
    if (!event.altKey) {
      event.preventDefault();
      const channelElement = event.currentTarget;
      channelElement.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className="timeline" ref={timelineRef} style={{ overflow: "hidden" }}>
      <div className="controls">
        <button onClick={addChannel}>Add Channel</button>
        <input
          type="number"
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
        />
      </div>
      <div className="timeline-content" style={{ width: `${zoomLevel * 100}%` }}>
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="channel"
            onClick={(e) => handleChannelClick(e, channel.id)}
            onWheel={handleChannelScroll}
          >
            {renderNoteLines(channel.id)}
            {channel.items.map((item) => (
              <div
                key={item.id}
                className="channel-item"
                style={{ left: `${(item.position / duration) * 100}%` }}
              ></div>
            ))}
            <button className="remove-channel" onClick={() => removeChannel(channel.id)}>
              Remove Channel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
