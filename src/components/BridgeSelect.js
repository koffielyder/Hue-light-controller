import React, { useState, useEffect } from 'react';
import { useBridge } from '../context/BridgeContext';

const BridgesSelect = () => {
  const [connectedBridges, setConnectedBridges] = useState([]);
  const { selectedBridge, setSelectedBridge } = useBridge();

  // Fetch connected bridges
  useEffect(() => {
    const fetchConnectedBridges = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bridges');
        const data = await response.json();
        console.log({data})
        setConnectedBridges(data);
      } catch (error) {
        console.error('Error fetching connected bridges:', error);
      }
    };

    fetchConnectedBridges();
  }, []);

  return (
    <div>
      <h2>Select a Connected Bridge</h2>
      <select
        value={selectedBridge || ''}
        onChange={(e) => setSelectedBridge(e.target.value)}
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
      {selectedBridge && <p>Selected Bridge ID: {selectedBridge}</p>}
    </div>
  );
};

export default BridgesSelect;