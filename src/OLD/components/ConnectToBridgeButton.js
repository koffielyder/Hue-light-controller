import React, { useState } from 'react';
import { openDB } from 'idb';


function ConnectToBridgeButton({ ipAddress, bridgeName }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const connectToBridge = async () => {
  
    setLoading(true);
    setError('');
    setApiKey('');

    try {
      const response = await fetch('http://localhost:5000/api/bridges/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: ipAddress,
          appName: "hue-lights-mixer",
          bridgeName: 'bridgeName',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to the bridge');
      }

      const data = await response.json();


    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={connectToBridge} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect to Bridge'}
      </button>
      {apiKey && <p>API Key: {apiKey}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}

export default ConnectToBridgeButton;