import React, { createContext, useState } from "react";
import { hexToXyb } from "../utils/colorUtils";

export const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
  const [defaultColors, setDefaultColors] = useState(['#000', '#fff']);
  const [channels, setChannels] = useState([]);
  const [duration, setDuration] = useState(5000);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  const getMinInterval = () => {
    let minInterval = 60000 / bpm;
    while (minInterval / 2 > 50) {
      minInterval /= 2;
    }
    return minInterval;
  }
  const parseChannels = () => {
    return {
      duration: duration,
      interval: getMinInterval(),
      effect: channels.map((channel, index) => {
        return channel.transitions.map(transition => {
          console.log(transition.color)
          const xybColor = hexToXyb(transition.color);
          return {
            start: transition.start,
            end: transition.start + transition.duration,
            formula: 't',
            colors: [[xybColor.x, xybColor.y, transition.bri]]
          }
        })
      })
    }
    // const lightData = {
    //     duration: 2000,
    //     interval: 50,
    //     effect: hueStream.lights.map(light => [{
    //       start: 0, end: 900, colors: [["start", "start", 255]], formula: 't'
    //     },
    //       {
    //         start: 900, colors: [["start", "start", 50]]
    //       },
    //       {
    //         start: 1600, end: 2000, colors: [["start", "start", "start"]], formula: 't'
    //       },
    //     ]),
    //   }
  }

  return (
    <TimelineContext.Provider value={{
      defaultColors, setDefaultColors,
      channels, setChannels,
      duration, setDuration,
      bpm, setBpm,
      isPlaying, setIsPlaying,
      parseChannels
    }}>
      {children}
    </TimelineContext.Provider>
  );
};
