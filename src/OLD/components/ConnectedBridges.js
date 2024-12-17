import React, { useState, useEffect } from 'react';

function ConnectedBridges() {
  const [bridges, setBridges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBridges = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/bridges');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (data.bridges) {
        setBridges(data.bridges);
      } else {
        setBridges([]);
        setError(data.message || 'No bridges found.');
      }
    } catch (err) {
      setError(err.stack);
      setBridges([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBridges();
  }, [])
  
    return (
    <div>
         {error && <p style={{ color: 'red' }}>{error}</p>}

          {bridges.length > 0 && (
            <div>
              <span>Found Bridges:</span>
              <ul>
                {bridges.map((bridge) => (
                  <li key={bridge.ip}>
                    <strong>{bridge.name}</strong> | <strong>IP:</strong> {bridge.ip} | 
                  </li>
                ))}
              </ul>
            </div>
          )}
    
          {bridges.length === 0 && !error && !loading && <p>No bridges found yet.</p>}
    </div>
  );
}
export default ConnectedBridges;
