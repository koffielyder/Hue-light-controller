import React, { useState } from "react";

const LightsLabel = ({ lights }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div
      className="lights-label"
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      Lights: {lights.length}
      {showPopup && (
        <div className="lights-popup">
          <ul>
            {lights.map((light) => (
              <li key={light.index}>{light.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LightsLabel;