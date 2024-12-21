import React, { useState, useEffect, useContext } from 'react';
import { BridgeContext } from '../context/BridgeContext';
import DiscoverBridgesModal from './DiscoverBridgesModal';
import BridgeStatus from './BridgeStatus';
import HueBridgeStream from './HueBridgeStream';
import './style/ConnectedBridgesSelect.css';

const ConnectedBridgesSelect = () => {
  const [connectedBridges, setConnectedBridges] = useState([]);
  const [discoveredBridges, setDiscoveredBridges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { globalBridge, setGlobalBridge } = useContext(BridgeContext);

  useEffect(() => {
    const fetchConnectedBridges = async () => {
      try {
        const response = await fetch('/api/bridges');
        const data = await response.json();
        setConnectedBridges(data);
      } catch (error) {
        console.error('Error fetching connected bridges:', error);
      }
    };
    fetchConnectedBridges();
  }, []);

  const discoverBridges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bridges/discover');
      const data = await response.json();
      setDiscoveredBridges(data);
      setShowPopup(true);
    } catch (error) {
      console.error('Error discovering bridges:', error);
    }
  };

  const getBridgeById = (id) => {
    return connectedBridges.filter(bridge => bridge.id == id)[0];
  }

  return (
    <>
      <div className="top-menu">
        <button onClick={discoverBridges} className="discover-button">
          + Bridge
        </button>
        <select
          value={globalBridge || ''}
          onChange={(e) => setGlobalBridge(getBridgeById(e.target.value))}
          className="select-bridge"
        >
          <option value="" disabled>
            Select a bridge
          </option>
          {connectedBridges.map((bridge) => (
            <option key={bridge.id} value={bridge.id}>
              {bridge.name} (ID: {bridge.id})
            </option>
          ))}
        </select>
        {globalBridge && <BridgeStatus bridgeId={globalBridge} />}
        {globalBridge && <HueBridgeStream />}
      </div>

      {showPopup && (
        <DiscoverBridgesModal
          bridges={discoveredBridges}
          onConnect={(id) => setGlobalBridge(id)}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default ConnectedBridgesSelect;
