import React from "react";

const StreamControls = ({
  isStreaming,
  startStream,
  stopStream,
  playNextEffect,
  loading,
  selectedGroup
}) => {
  return (
    <div className="stream-controls">
      <button
        className="stream-button"
        onClick={startStream}
        disabled={loading || isStreaming || !selectedGroup}
      >
        {loading ? "Starting..." : isStreaming ? "Active" : "Start"}
      </button>

      {isStreaming && (
        <>
          <button className="stream-button" onClick={stopStream} disabled={loading}>
            Stop
          </button>
          <button className="stream-button" onClick={playNextEffect} disabled={loading}>
            Next Effect
          </button>
        </>
      )}
    </div>
  );
};

export default StreamControls;
