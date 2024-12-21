import React from 'react';
import { BridgeProvider } from './context/BridgeContext';
import ConnectedBridgesSelect from './components/ConnectedBridgesSelect';
import LightEffectsManager from './components/LightEffectsManager';
import Timeline from './components/timeline/Timeline';
import { TimelineProvider } from './context/TimelineContext';
function App() {
  return (
    <BridgeProvider>
      <ConnectedBridgesSelect />
      {/* <LightEffectsManager /> */}
      <TimelineProvider>
        <Timeline duration={10000} interval={60000 / 120} />
      </TimelineProvider>
    </BridgeProvider>
  );
}

export default App;
