import React from "react";

const TransitionsList = ({ transitions, onUpdate }) => {
  const deleteTransition = (index) => {
    const updatedTransitions = transitions.filter((_, i) => i !== index);
    onUpdate(updatedTransitions);
  };

  return (
    <div className="transitions-list">
      {transitions.map((t, index) => (
        <div key={index} className="transition-item">
          <div>
            <strong>Start:</strong> {t.start},{" "}
            <strong>Color:</strong>{" "}
            <span
              className="color-preview"
              style={{ backgroundColor: t.color }}
            ></span>
            {t.end && (
              <>
                , <strong>End:</strong> {t.end}, <strong>Formula:</strong>{" "}
                {t.formula}
              </>
            )}
          </div>
          <button onClick={() => deleteTransition(index)} className="delete-button">
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default TransitionsList;
