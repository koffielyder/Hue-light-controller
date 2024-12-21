import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fasr, fasdt } from '@awesome.me/kit-aea0077342/icons'
import Row from './Row';
import Channel from './Channel';
import { TimelineContext } from '../../context/TimelineContext';

const Timeline = ({ duration, interval, onDurationChange = () => { } }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const timelineRef = useRef(null);

  const { channels, setChannels } = useContext(TimelineContext);

  const addChannel = () => {
    setChannels((prev) => [...prev, { id: prev.length, items: [] }]);
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
          </div>}
        />
        {channels.map((channel, channelIndex) => (
          <Channel
            key={channel.id}
            channel={channel}
            interval={500}
            duration={duration}
            step={50}
            zoom={zoomLevel}
            onUpdateChanel={updateChannel}
          />
        ))}
        <Row header={
          <button className="flex bg-blue-400 flex-grow h-full w-full text-3xl justify-center items-center" onClick={addChannel}>
            <FontAwesomeIcon icon={fasdt.faPlusLarge} />
          </button>}
        />
      </div>
    </div>
  );
};

export default Timeline;
