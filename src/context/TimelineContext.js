import React, { createContext, useState } from "react";

export const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
  const [defaultColors, setDefaultColors] = useState([]);
  const [channels, setChannels] = useState([]);

  return (
    <TimelineContext.Provider value={{ defaultColors, setDefaultColors, channels, setChannels }}>
      {children}
    </TimelineContext.Provider>
  );
};
