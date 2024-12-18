import React, { createContext, useState, useContext } from 'react';

const BridgeContext = createContext();

export const BridgeProvider = ({ children }) => {
  const [selectedBridge, setSelectedBridge] = useState(null);

  return (
    <BridgeContext.Provider value={{ selectedBridge, setSelectedBridge }}>
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridge = () => useContext(BridgeContext);
