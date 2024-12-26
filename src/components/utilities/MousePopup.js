import React, { useState, useRef, useEffect } from 'react';

const MousePopup = ({ children }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const popupRef = useRef(null);

    // Handle click to open the popup
    const handleClick = (e) => {
        setPopupPosition({ x: e.clientX, y: e.clientY });
        setPopupVisible(true);
    };

    // Close popup when clicking outside
    const handleClickOutside = (e) => {
        return;
        console.log('handleClickOutside')
        if (popupRef.current && !popupRef.current.contains(e.target)) {
        console.log('handleClickOutsidetrue')
        setPopupVisible(false);
        }
    };

    useEffect(() => {
        if (popupVisible) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [popupVisible]);

    return (
        <div className='w-full h-full position-relative bg-blue-400' onClick={handleClick}>
            {popupVisible && (
                <div className='fixed w-full h-full top-0 left-0 bg-green-400 z-30'>
                    <div
                        ref={popupRef}
                        style={{
                            position: 'absolute',
                            top: popupPosition.y + 10, // Offset below cursor
                            left: popupPosition.x,
                            background: '#fff',
                            border: '1px solid #ccc',
                            padding: '10px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            zIndex: 1000,
                        }}
                    >
                        {children ? (
                            children
                        ) : (
                            <p>This is a default popup body! Add custom content via children.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MousePopup;
