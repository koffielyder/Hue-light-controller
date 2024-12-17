import React, { createContext, useState, useContext } from 'react';

// Create the context
const BridgeContext = createContext();

// Context Provider Component
export const BridgeProvider = ({ children }) => {
  const [selectedBridge, setSelectedBridge] = useState(null);

  return (
    <BridgeContext.Provider value={{ selectedBridge, setSelectedBridge }}>
      {children}
    </BridgeContext.Provider>
  );
};

// Custom hook to use the Bridge Context
export const useBridge = () => {
  return useContext(BridgeContext);
};