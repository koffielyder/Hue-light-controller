import React from 'react';
import { BridgeProvider } from './context/BridgeContext';
import ConnectedBridgesSelect from './components/ConnectedBridgesSelect';
import LightEffectsManager from './components/LightEffectsManager';
function App() {
  return (
    <BridgeProvider>
      <ConnectedBridgesSelect />
      <LightEffectsManager />
    </BridgeProvider>
  );
}

export default App;
