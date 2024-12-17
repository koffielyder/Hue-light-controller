import React from 'react';
import { BridgeProvider } from './context/BridgeContext';
import BridgeConnector from './components/BridgeConnector';
import BridgeSelect from './components/BridgeSelect';

function App() {
  return (
    <BridgeProvider>
      <div>
        <h1>Hue Bridge Manager</h1>
        {/* Component to connect to a bridge */}
        <BridgeConnector />
        
        {/* Component to select an already connected bridge */}
        <BridgeSelect />
      </div>
    </BridgeProvider>
  );
}

export default App;