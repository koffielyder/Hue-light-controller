import { useEffect, useState } from 'react';
import Row from './Row';
import { valueState } from '../../utils/valueState';
import ColorPicker from './ColorPicker';
import Transition from './Transition';


const Channel = ({ channel, interval, duration, minInterval = 50, zoom = 10, onUpdateChanel = (channel) => { } }) => {
    const [transitions, setTransitions] = useState([]);
    // const [isDrawing, setIsDrawing] = useState(false);
    const [drawingEl, setDrawingEl] = useState(false);
    // const [drawData, setDrawData] = useState({});
    const drawData = valueState(useState({}));
    const isDrawing = valueState(useState(false));
    const lineBars = () => {
        const bars = [];
        const barDuration = (interval * 4);
        let barStep = duration / barDuration;
        let width = barDuration * (zoom / 10);
        for (let i = 0; i < barStep; i++) {
            let label = i + 1;
            bars.push(barEl(label, allNoteLines(barDuration, interval, width, barDuration * i, i), `${width}px`, i))
        }
        return bars;
    }

    const barEl = (label = null, children = null, width = null, index = null) => {
        return (
            <div style={{ width }} className='flex relative' key={index}>
                {children}
                <span className='absolute right-2'>{label}</span>
                <span className='absolute right-0 h-full w-[1px] bg-slate-600' />
            </div>
        );
    }

    const allNoteLines = (dur, intrv, width, start, barIndex, frac = 1) => {
        let level = 0;
        if (intrv < minInterval) return null;
        if (width < 250) level = 1;
        if (width < 150) level = 2;
        const lines = [];
        let newStart = start;
        let noteStep = dur / intrv;
        for (let i = 0; i < noteStep; i++) {
            newStart = start + (intrv * i);
            let label = i > (noteStep - 2) ? null : `1/${frac}`;
            lines.push(lineEl(label, allNoteLines(intrv, intrv / 2, width / 2, newStart, barIndex, frac * 2), newStart, intrv, i, level))
        }
        return lines;
    }

    const lineEl = (label = null, children = null, start = null, dur = null, index = null, level = 0) => {
        const labelClass = `absolute right-1 text-slate-400 text-xs ${level ? 'opacity-0' : 'opacity-100'}`;
        let opacity = "opacity-100";
        if (level === 1) opacity = "opacity-20";
        if (level === 2) opacity = "opacity-0";
        const lineClass = `absolute right-0 h-full w-[1px] bg-slate-600 ${opacity}`;
        return (
            <div style={{ width: '50%' }} className={`flex relative ${level ? 'pointer-events-none' : ''}`} key={index} data-start={start} data-duration={dur} onMouseDown={addTransitionClick} onMouseOver={handleMouseOver}>
                {children}
                <span className={labelClass}>
                    {label}
                </span>
                <span className={lineClass} />
            </div>
        );
    }


    const addTransitionClick = (e) => {
        if (e.button !== 2) {
            e.stopPropagation();
            e.preventDefault();
            if (!isDrawing.value) {
                startDrawing({start: Number(e.target.dataset.start), duration: Number(e.target.dataset.duration)}, e.target)
            } else {
                addTransition();
                // Finalize drawing
                stopDrawing()
            }
        }
    }

    const startDrawing = (data, parent = null) => {
        const newElement = document.createElement("div");
        newElement.style.position = "absolute";
        newElement.style.left = "0px";
        newElement.style.top = "0px";
        newElement.style.width = data.duration * (zoom / 10) + 'px';
        newElement.style.height = "100%";
        newElement.style.backgroundColor = "rgba(0, 123, 255, 0.2)";
        newElement.style.transformOrigin = 'left'
        console.log(data.index);
        drawData.value = ({ start: data.start, orgDuration: data.duration, duration: data.duration, index: data.index })
        if(!parent) parent = document.querySelectorAll(`[data-start='${data.start}']`)[0];
        parent.appendChild(newElement)
        setDrawingEl(newElement);
        isDrawing.value = true;
    }

    const stopDrawing = () => {
        isDrawing.value = false;
        drawingEl.remove();
        setDrawingEl(null);
    }

    const handleMouseOver = (e) => {
        if (isDrawing.value && drawingEl) {
            let widthMult = 1;
            if (e.target.dataset.start !== undefined) {
                const orgDuration = drawingEl.parentNode.dataset.duration;
                const orgStart = Number(drawingEl.parentNode.dataset.start);
                const start = Number(e.target.dataset.start);
                const hoverDuration = Number(e.target.dataset.duration)
                const diff = (start + hoverDuration) - (drawData.value.start + drawData.value.orgDuration);
                widthMult = (diff / drawData.value.orgDuration) + 1;
            }
            drawData.value = ({ start: drawData.value.start, orgDuration: drawData.value.orgDuration, duration: drawData.value.orgDuration * widthMult, index: drawData.value.index })
            drawingEl.style.transform = `scaleX(${widthMult})`;
        }
    };

    const addTransition = () => {
        const value = {
            start: drawData.value.start,
            duration: drawData.value.duration,
        };
        if(drawData.value.index !== undefined) {
            console.log("update");
            channel.items[drawData.value.index] = value
        } else {
            console.log("create");
            channel.items.push(value)
        }
        onUpdateChanel(channel)
    }

    const drawTransition = (type, transitionIndex) => {
        startDrawing({...channel.items[transitionIndex], index: transitionIndex})
    }

    useEffect(() => {
        const handleContextMenu = (e) => {
            if (isDrawing.value) {
                e.preventDefault(); // Prevent default context menu
                isDrawing.value = false;
                drawingEl.remove();
                setDrawingEl(null);
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);

        // Cleanup event listener when the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [isDrawing, drawingEl]);

    return (
        <Row
            header={
                <p>Channel {channel.id}</p>}
        >
            <div className='flex relative'>
                {lineBars()}
                {channel.items.map((transition, index) => (
                    <Transition key={index} transition={transition} zoom={zoom} isDrawing={isDrawing.value} onEditTime={(type) => { drawTransition(type, index) }} />
                ))}
            </div>
        </Row>
    );
};

export default Channel;
