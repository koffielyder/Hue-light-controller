import React, { createContext, useState } from "react";

export const BridgeContext = createContext();

export const BridgeProvider = ({ children }) => {
  const [globalGroup, setGlobalGroup] = useState(null);
  const [globalBridge, setGlobalBridge] = useState(null);

  return (
    <BridgeContext.Provider value={{ globalGroup, setGlobalGroup, globalBridge, setGlobalBridge }}>
      {children}
    </BridgeContext.Provider>
  );
};
