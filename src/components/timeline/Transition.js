import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fasdt } from '@awesome.me/kit-aea0077342/icons'
import { useContext, useEffect, useState } from "react";
import ColorPicker from "./ColorPicker";
import ColorButton from "./ColorButton";
import { TimelineContext } from "../../context/TimelineContext";

const Transition = ({ transition, zoom, isDrawing = false, onChange = (transition) => { }, onEditTime = (e) => { }, onClick = (e) => { }, selected = false }) => {
    const [width, setWidth] = useState(null);
    const { defaultColors, setDefaultColors } = useContext(TimelineContext);

    const handleColorChange = (color) => {
        onChange({ ...transition, ...color })
    }

    useEffect(() => {
        setWidth(transition.duration * (zoom / 10))
    }, [transition, zoom])
    return (
        <div onClick={onClick} className={`absolute h-full group border-x ${selected ? 'selected' : ''} ${isDrawing ? 'pointer-events-none opacity-50' : ''}`} style={{ backgroundColor: transition.color, left: transition.start * (zoom / 10) + `px`, width: width + 'px' }}>
            <div className="controls opacity-0 group-hover:opacity-100 group-[.selected]:opacity-100 h-full w-full transition-all">
                <ColorPicker color={transition.color} onChange={handleColorChange} />
                <header className="absolute flex text-white top-0 translate-y-0 group-hover:-translate-y-full group-[.selected]:-translate-y-full transition-transform w-full min-w-6 text-xs bg-black rounded-t">
                    <div>
                        {defaultColors && defaultColors.map((dColor, index) => (
                            <ColorButton color={dColor} onClick={handleColorChange} key={index} />
                        ))}
                    </div>
                    <button className="ml-auto pr-2">
                        <FontAwesomeIcon icon={fasdt.faTimes} />
                    </button>
                </header>

                {width > 60 && <button onClick={(e) => onEditTime('duration')} className="absolute opacity-50 left-0 top-0 h-full w-4 bg-black hover:opacity-100 text-white">
                    <FontAwesomeIcon icon={fasdt.faGripLinesVertical} />
                </button>}

                {width > 60 && <button onClick={(e) => onEditTime('start')} className="absolute opacity-50 right-0 top-0 h-full w-4 bg-black hover:opacity-100 text-white">
                    <FontAwesomeIcon icon={fasdt.faGripLinesVertical} />
                </button>}
            </div>
        </div>
    );
};

export default Transition;
