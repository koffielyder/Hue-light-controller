import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fasdt } from '@awesome.me/kit-aea0077342/icons'
import { useEffect, useState } from "react";

const Transition = ({ transition, zoom, isDrawing = false, onEditTime = (e) => {} }) => {
    const [width, setWidth] = useState(null);

    useEffect(() => {
        setWidth(transition.duration * (zoom / 10))
    }, [transition, zoom])
    return (
        <div className={`absolute h-full bg-blue-800 group border-x ${isDrawing ? 'pointer-events-none opacity-50' : ''}`} style={{ left: transition.start * (zoom / 10) + `px`, width: width + 'px' }}>
            <div className="controls opacity-0 group-hover:opacity-100 h-full w-full transition-all">
                <header className="absolute flex text-white top-0 translate-y-0 group-hover:-translate-y-full transition-transform w-full min-w-6 text-xs bg-black rounded-t">
                    <button className="ml-auto pr-2">
                        <FontAwesomeIcon icon={fasdt.faTimes} />
                    </button>
                </header>

                {width > 60 && <button onClick={(e) => onEditTime('duration')} className="absolute opacity-50 left-0 h-full w-4 bg-black hover:opacity-100 text-white">
                    <FontAwesomeIcon icon={fasdt.faGripLinesVertical} />
                </button>}

                {width > 60 && <button onClick={(e) => onEditTime('start')} className="absolute opacity-50 right-0 h-full w-4 bg-black hover:opacity-100 text-white">
                    <FontAwesomeIcon icon={fasdt.faGripLinesVertical} />
                </button>}
            </div>
        </div>
    );
};

export default Transition;
