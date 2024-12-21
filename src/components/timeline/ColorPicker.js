import { useContext, useEffect, useRef, useState } from "react";
import "../style/ColorPicker.css";
import iro from "@jaames/iro";
import { TimelineContext } from '../../context/TimelineContext';

const ColorPicker = ({ currentValue = "#fff", onChange = (color) => { } }) => {
    const colorPickerRef = useRef(null);
    const colorPickerInstance = useRef(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
      const { defaultColors, setDefaultColors } = useContext(TimelineContext);
    

    useEffect(() => {
        if (showColorPicker && colorPickerRef.current) {
            colorPickerInstance.current = iro.ColorPicker(colorPickerRef.current, {
                width: 200,
                color: currentValue,
            });

            colorPickerInstance.current.on("color:change", onChange);
        }

        return () => {
            if (colorPickerInstance.current) {
                colorPickerInstance.current.off("color:change");
                colorPickerInstance.current = null;
            }
        };
    }, [showColorPicker]);


    return (
        <div>
            <div>
                {defaultColors && defaultColors.map(color => (
                    <button style={{ backgroundColor: color }} className="h-4 w-12 border" />
                ))}
            </div>
            <button onClick={() => setShowColorPicker(true)}>Open picker</button>
            {showColorPicker && (
                <div className="color-picker-popup">
                    <div ref={colorPickerRef}></div>
                    <button
                        onClick={() => setShowColorPicker(false)}
                        className="close-picker-button"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
