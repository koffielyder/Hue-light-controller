import { useEffect, useRef, useState } from 'react';
import Row from './Row';
import { valueState } from '../../utils/valueState';
import ColorPicker from './ColorPicker';
import Transition from './Transition';


const Channel = ({ channel, interval, duration, minInterval = 50, zoom = 10, onUpdateChanel = (channel) => { } }) => {
    const [transitions, setTransitions] = useState([]);
    // const [isDrawing, setIsDrawing] = useState(false);
    const [drawingEl, setDrawingEl] = useState(false);
    // const [drawData, setDrawData] = useState({});
    const [drawData, drawDataSet] = useState({});
    const [selectedTransitions, selectedTransitionsSet] = useState([]);
    const isDrawing = valueState(useState(false));
    const channelRef = useRef(null);
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
                startDrawing({ start: Number(e.target.dataset.start), duration: Number(e.target.dataset.duration), change: 'end' })
            } else {
                addTransition();
                // Finalize drawing
                stopDrawing()
            }
        }
    }

    const startDrawing = (data) => {
        if (!data.change) data.change = ['end'];
        else if (!Array.isArray(data.change)) data.change = [data.change];
        drawDataSet({ start: data.start, duration: data.duration, index: data.index, change: data.change })
        createDrawElement();
        isDrawing.value = true;
    }

    const createDrawElement = () => {
        const drawElement = document.createElement("div");

        drawElement.style.position = "absolute";
        drawElement.style.left = "0px";
        drawElement.style.top = "0px";
        drawElement.style.height = "100%";
        drawElement.style.backgroundColor = "rgba(0, 123, 255, 0.2)";
        drawElement.style.transformOrigin = 'left'
        drawElement.style.pointerEvents = "none";
        setDrawingEl(drawElement);
        channelRef.current.appendChild(drawElement);
        updateDrawElement();

    }

    const updateDrawElement = () => {
        if (isDrawing.value && drawingEl) {
            drawingEl.style.width = drawData.duration * (zoom / 10) + 'px';
            drawingEl.style.left = drawData.start * (zoom / 10) + 'px';
        }
    }

    const stopDrawing = () => {
        isDrawing.value = false;
        drawingEl.remove();
        setDrawingEl(null);
    }

    const handleMouseOver = (e) => {
        if (isDrawing.value && drawingEl) {
            if (e.target.dataset.start !== undefined) {
                const noteStart = Number(e.target.dataset.start);
                const noteDuration = Number(e.target.dataset.duration);
                const noteEnd = noteStart + noteDuration;
                const drawEnd = drawData.start + drawData.duration;
                const newDraw = {
                    ...drawData,
                    start: drawData.start,
                    duration: drawData.duration,
                }
                // check if new start is lower than original (set start to new start)
                if (drawData.change.includes('start') && noteStart < drawEnd) {
                    newDraw.start = noteStart;
                    newDraw.duration += (drawData.start - noteStart);
                }
                if (drawData.change.includes('end') && noteEnd > drawData.start) newDraw.duration = noteEnd - drawData.start;
                drawDataSet(newDraw)
            }
        }
    };

    const addTransition = () => {
        const value = {
            start: drawData.start,
            duration: drawData.duration,
            color: '#000',
            bri: 100,
        };
        if (drawData.index !== undefined) {
            channel.transitions[drawData.index] = value
        } else {
            channel.transitions.push(value)
        }
        onUpdateChanel(channel)
    }

    const updateTransition = (value, index) => {
        const newVal = {
            ...channel.transitions[index],
            ...value
        };
        console.log({newVal})
        channel.transitions[index] = newVal;
        onUpdateChanel(channel)
    }

    const drawTransition = (type, transitionIndex) => {
        startDrawing({ ...channel.transitions[transitionIndex], index: transitionIndex, change: type == 'start' ? 'end' : 'start' })
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

    useEffect(() => {
        updateDrawElement();
    }, [drawData, zoom])

    return (
        <Row
            header={
                <p>Channel {channel.id}</p>}
        >
            <div className='flex relative' ref={channelRef}>
                {lineBars()}
                {channel.transitions.map((transition, index) => (
                    <Transition
                        selected={selectedTransitions.includes(index)}
                        key={index} transition={transition}
                        zoom={zoom}
                        isDrawing={isDrawing.value}
                        onEditTime={(type) => { drawTransition(type, index) }}
                        onChange={(transition) => updateTransition(transition, index)}
                        onClick={(e) => {
                            const i = selectedTransitions.indexOf(index)
                            if(i !== -1) {
                                selectedTransitionsSet(selectedTransitions.filter(value => value !== index))
                            }
                            else selectedTransitionsSet([index])
                        }}
                    />
                ))}
            </div>
        </Row>
    );
};

export default Channel;
