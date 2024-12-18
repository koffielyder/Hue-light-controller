import React, { useState, useEffect, useRef } from "react";
import iro from "@jaames/iro";

const AddTransitionForm = ({ transitions, onUpdate }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [isTransition, setIsTransition] = useState(false);
  const [transitionData, setTransitionData] = useState({
    start: 0,
    end: "",
    color: "#ffffff",
    formula: "",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const colorPickerInstance = useRef(null);

  useEffect(() => {
    if (showColorPicker && colorPickerRef.current) {
      colorPickerInstance.current = iro.ColorPicker(colorPickerRef.current, {
        width: 200,
        color: transitionData.color,
      });

      colorPickerInstance.current.on("color:change", (color) => {
        setTransitionData((prev) => ({ ...prev, color: color.hexString }));
      });
    }

    return () => {
      if (colorPickerInstance.current) {
        colorPickerInstance.current.off("color:change");
        colorPickerInstance.current = null;
      }
    };
  }, [showColorPicker]);

  const addOrEditTransition = () => {
    const updatedTransitions = [...transitions];
    const dataToAdd = {
      ...transitionData,
      end: isTransition ? transitionData.end : null,
      formula: isTransition ? transitionData.formula : "",
    };

    if (editingIndex !== null) {
      updatedTransitions[editingIndex] = dataToAdd;
    } else {
      updatedTransitions.push(dataToAdd);
    }

    updatedTransitions.sort((a, b) => a.start - b.start);
    onUpdate(updatedTransitions);

    resetForm();
  };

  const editTransition = (index) => {
    setTransitionData(transitions[index]);
    setIsTransition(Boolean(transitions[index].end));
    setEditingIndex(index);
  };

  const resetForm = () => {
    setTransitionData({ start: 0, end: "", color: "#ffffff", formula: "" });
    setIsTransition(false);
    setEditingIndex(null);
    setShowColorPicker(false);
  };

  return (
    <div className="transition-form">
      <div className="form-row">
        <label>Start:</label>
        <input
          type="number"
          value={transitionData.start}
          onChange={(e) =>
            setTransitionData({ ...transitionData, start: Number(e.target.value) })
          }
        />

        <label>Color:</label>
        <div
          className="color-icon"
          style={{ backgroundColor: transitionData.color }}
          onClick={() => setShowColorPicker(true)}
        ></div>

        <label>
          <input
            type="checkbox"
            checked={isTransition}
            onChange={() => setIsTransition((prev) => !prev)}
          />
          Transition
        </label>
      </div>

      {isTransition && (
        <div className="form-row">
          <label>End:</label>
          <input
            type="number"
            value={transitionData.end}
            onChange={(e) =>
              setTransitionData({ ...transitionData, end: Number(e.target.value) })
            }
          />

          <label>Formula:</label>
          <input
            type="text"
            value={transitionData.formula}
            onChange={(e) =>
              setTransitionData({ ...transitionData, formula: e.target.value })
            }
          />
        </div>
      )}

      <div className="form-row">
        <button onClick={addOrEditTransition} className="add-transition-button">
          {editingIndex !== null ? "Edit" : "Add"} Transition
        </button>
      </div>

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

export default AddTransitionForm;
