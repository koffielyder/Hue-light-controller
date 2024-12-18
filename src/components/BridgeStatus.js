import React, { useEffect, useState } from 'react';

const BridgeStatus = ({ bridgeId }) => {
  const [status, setStatus] = useState({ online: false, streaming: false });

  useEffect(() => {
    const fetchStatus = async () => {
      if (!bridgeId) return;

      try {
        const response = await fetch(`https://localhost:5000/api/bridge/${bridgeId}/status`);
        const data = await response.json();
        setStatus({ online: data.online, streaming: data.streaming });
      } catch (error) {
        console.error('Error fetching bridge status:', error);
      }
    };

    fetchStatus();
  }, [bridgeId]);

  return (
    <div className="status-fields">
      <div className="status-field">
        <label>Online Status:</label>
        <span className={status.online ? '' : 'error'}>{status.online ? 'Online' : 'Offline'}</span>
      </div>
      <div className="status-field">
        <label>Streaming:</label>
        <span className={status.online ? '' : 'error'}>{status.streaming ? 'Yes' : 'No'}</span>
      </div>
    </div>
  );
};

export default BridgeStatus;
