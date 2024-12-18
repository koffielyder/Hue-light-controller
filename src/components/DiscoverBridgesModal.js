import React from 'react';
import './style/ConnectedBridgesSelect.css';

const DiscoverBridgesModal = ({ bridges, onConnect, onClose }) => (
  <div className="popup-overlay">
    <div className="popup-content">
      <h2>Discovered Bridges</h2>
      {bridges.length > 0 ? (
        <ul>
          {bridges.map((bridge) => (
            <li key={bridge.id}>
              {bridge.name} (ID: {bridge.id})
              <button onClick={() => onConnect(bridge.id)} className="connect-button">
                Connect
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No bridges found.</p>
      )}
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  </div>
);

export default DiscoverBridgesModal;
