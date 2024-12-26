import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fasr, fasdt } from '@awesome.me/kit-aea0077342/icons'
import Row from './Row';
import Channel from './Channel';
import { TimelineContext } from '../../context/TimelineContext';
import ControlsBottom from "./ControlsBottom";

const Timeline = ({ interval, onDurationChange = () => { } }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const timelineRef = useRef(null);
  const { channels, setChannels, duration, setDuration, bpm, setBpm } = useContext(TimelineContext);

  const addChannel = () => {
    setChannels((prev) => [...prev, { id: prev.length, transitions: [] }]);
  };

  const updateChannel = (data, id = null) => {
    if (id == null) id = data.id;
    const index = channels.findIndex((channel) => channel.id == id);
    updateChannelIndex(data, index);
  }

  const updateChannelIndex = (data, index) => {
    channels[index] = data;
    setChannels(channels);
  }


  const removeChannel = (id) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };


  useEffect(() => {
    const handleScroll = (event) => {
      if (event.altKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        const newZoomLevel = Math.min(Math.max(0.1, zoomLevel + delta), 10);

        setZoomLevel(newZoomLevel);
      }
    };

    const timelineElement = timelineRef.current;
    timelineElement.addEventListener("wheel", handleScroll);

  }, [zoomLevel]);

  return (
    <div className="p-8 bg-slate-400 overflow-hidden" ref={timelineRef}>
      <div className="flex flex-col overflow-x-scroll gap-4 py-4">
        <Row header={
          <div className="controls">
            <label>
              Duration (ms):
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>

            <label>
              Bpm:
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
            </label>
          </div>}
        />
        {channels.map((channel, channelIndex) => (
          <Channel
            key={channel.id}
            channel={channel}
            interval={60000/bpm}
            duration={duration}
            zoom={zoomLevel}
            onUpdateChanel={updateChannel}
          />
        ))}
        <ControlsBottom onAddChannelClick={addChannel} zoom={zoomLevel/10} />
      </div>
    </div>
  );
};

export default Timeline;
