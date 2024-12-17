import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import FindBridges from './components/FindBridges';
import ConnectedBridges from './components/ConnectedBridges';

import Dropdown from './components/Dropdown';

function App() {


// Usage


  return (
    <div>
      <Dropdown>
        <ConnectedBridges />
        <FindBridges />
      </Dropdown>
    </div>
  );
}

export default App;
