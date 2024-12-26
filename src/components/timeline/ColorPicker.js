import { useContext, useEffect, useRef, useState } from "react";
import "../style/ColorPicker.css";
import iro from "@jaames/iro";
import { TimelineContext } from '../../context/TimelineContext';
import ColorButton from "./ColorButton";
import { hsvToHex } from "../../utils/colorUtils";

const ColorPicker = ({ color = "#fff", onChange = (color) => { } }) => {
    const colorPickerRef = useRef(null);
    const colorPickerInstance = useRef(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorPickerPos, setColorPickerPos] = useState([0, 0]);

    const toggleColorPicker = (color, e) => {
        setColorPickerPos([e.clientX, e.clientY]);
        setShowColorPicker(!showColorPicker);
    }

    const handleColorClick = (color) => {
        onChange({color})
    }

    useEffect(() => {
        if (showColorPicker && colorPickerRef.current) {
            colorPickerInstance.current = iro.ColorPicker(colorPickerRef.current, {
                width: 200,
                color: color,
                wheelLightness: false,
            });

            colorPickerInstance.current.on("color:change", (colorData) => {
                const value = {
                    color: hsvToHex(colorData.hsv.h, colorData.hsv.s),
                    bri: colorData.value
                }
                onChange(value)
            });

            console.log({colorPickerPos})
            console.log(colorPickerInstance.current)
            colorPickerInstance.current.el.style.position = 'absolute';
            colorPickerInstance.current.el.style.left = colorPickerPos[0] + 'px';
            colorPickerInstance.current.el.style.top = colorPickerPos[1] + 'px';

        }

        return () => {
            if (colorPickerInstance.current) {
                colorPickerInstance.current.off("color:change");
                colorPickerInstance.current = null;
            }
        };
    }, [showColorPicker]);


    return (
        <>
            <ColorButton color={color} onClick={toggleColorPicker} />
            {showColorPicker && (
                <div onClick={() => setShowColorPicker(false)} className="z-30 fixed left-0 top-0 w-full h-full bg-black bg-opacity-40 flex justify-center align-middle">
                    <div className="" ref={colorPickerRef}></div>
                    <button
                        onClick={() => setShowColorPicker(false)}
                        className="close-picker-button"
                    >
                        Close
                    </button>
                </div>
            )}
        </>
    );
};

export default ColorPicker;
