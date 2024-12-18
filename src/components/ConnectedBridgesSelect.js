import React, { useState, useEffect } from 'react';
import { useBridge } from '../context/BridgeContext';
import DiscoverBridgesModal from './DiscoverBridgesModal';
import BridgeStatus from './BridgeStatus';
import './style/ConnectedBridgesSelect.css';

const ConnectedBridgesSelect = () => {
  const [connectedBridges, setConnectedBridges] = useState([]);
  const [discoveredBridges, setDiscoveredBridges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { selectedBridge, setSelectedBridge } = useBridge();

  useEffect(() => {
    const fetchConnectedBridges = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bridges');
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

  return (
    <>
      <div className="top-menu">
        <button onClick={discoverBridges} className="discover-button">
          + Bridge
        </button>
        <select
          value={selectedBridge || ''}
          onChange={(e) => setSelectedBridge(e.target.value)}
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
        {selectedBridge && <BridgeStatus bridgeId={selectedBridge} />}
      </div>

      {showPopup && (
        <DiscoverBridgesModal
          bridges={discoveredBridges}
          onConnect={(id) => setSelectedBridge(id)}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default ConnectedBridgesSelect;
