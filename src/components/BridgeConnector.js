import React, {
  useState
} from 'react';

const BridgeConnector = () => {
  const [bridges,
    setBridges] = useState([]);
  const [selectedBridge,
    setSelectedBridge] = useState('');
  const [connectionStatus,
    setConnectionStatus] = useState('');

  // Fetch discovered bridges
  const discoverBridges = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bridges/discover');
      const data = await response.json();
      setBridges(data);
    } catch (error) {
      console.error('Error discovering bridges:', error);
      setConnectionStatus('Error discovering bridges.');
    }
  };

  // Connect to selected bridge
  const connectToBridge = async (bridgeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bridges/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bridgeId
        }),
      });

      if (response.ok) {
        setConnectionStatus(`Successfully connected to bridge ${bridgeId}`);
      } else {
        const errorData = await response.json();
        setConnectionStatus(`Failed to connect: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error connecting to bridge:', error);
      setConnectionStatus('Error connecting to bridge.');
    }
  };

  return (
    <div>
      <h1>Hue Bridge Connector</h1>

      <button onClick={discoverBridges}>Discover Bridges</button>

      {bridges.length > 0 && (
        <div>
          <h2>Select a Bridge to Connect</h2>
          <ul>
            {bridges.map((bridge) => (
              <li key={bridge.id}>
                {bridge.name} (ID: {bridge.id})
                <button onClick={() => connectToBridge(bridge.id)}>Connect</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {connectionStatus && <p>
        {connectionStatus}
      </p>
      }
    </div>
  );
};

export default BridgeConnector;