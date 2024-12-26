import { fasdt } from "@awesome.me/kit-aea0077342/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Row from "./Row";
import { TimelineContext } from "../../context/TimelineContext";
import { useContext, useState } from "react";
import Button from "../utilities/Button";

const ControlsBottom = ({ zoom, onAddChannelClick = (e) => { } }) => {
    const { duration, isPlaying, setIsPlaying, parseChannels } = useContext(TimelineContext);
    const [isLoading, setIsLoading] = useState(false);

    const onPlay = async () => {
        console.log('onPlay');
        setIsLoading(true);
        const parsedData = parseChannels();
        fetch("/api/stream/play", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                lightData: parsedData,
            }),
        }).then(() => {
            setIsPlaying(true);
            setIsLoading(false);
        }).catch((error) => {
            console.error("Error sending light data:", error);
        })
    }

    const getDurtionArray = () => {
        return Array(Math.round(duration / 1000)).fill(0);
    }

    const formatMilliseconds = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
    const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;


    return (
        <Row className="w-full" header={
            <button className="flex bg-blue-400 flex-grow h-full w-full text-3xl justify-center items-center" onClick={onAddChannelClick}>
                <FontAwesomeIcon icon={fasdt.faPlusLarge} />
            </button>}
        >
            <div className="flex w-full flex-col gap-2">
                <div className="w-full bg-gray-100 h-max flex border-b" style={{ width: duration * zoom }}>
                    {getDurtionArray().map((value, i) =>
                        <span key={i} className="border-r h-6 mb-2 flex flex-grow border-black text-right justify-end pr-1 text-xs">
                            {formatSeconds(i + 1)}
                        </span>
                    )}
                </div>

                <div className="pl-4">
                    <Button loading={isLoading} icon={!isPlaying ? fasdt.faPlay : fasdt.faStop} onClick={onPlay}>
                        {!isPlaying ? 'Play' : 'Stop'}
                    </Button>
                </div>
            </div>

        </Row>
    );
};

export default ControlsBottom;
