import React, { useState } from 'react';

function DropDown({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropDown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div style={{ border: '1px solid black', borderRadius: '5px', padding: '10px', width: '300px' }}>
      <div onClick={toggleDropDown} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
        {isOpen ? 'Collapse' : 'open'}
      </div>
      {isOpen && <div style={{ marginTop: '10px' }}>{children}</div>}
    </div>
  );
}

export default DropDown;