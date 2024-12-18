import React from "react";

const GroupSelector = ({ groups, selectedGroup, onGroupChange, loading }) => {
  const handleChange = (event) => {
    const groupId = event.target.value;
    const selected = groups.find(group => group.id === groupId);
    onGroupChange(selected);
  };

  return (
    <div className="group-select-container">
      <label htmlFor="group-select">Group:</label>
      <select
        id="group-select"
        value={selectedGroup?.id || ""}
        onChange={handleChange}
        disabled={loading}
      >
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GroupSelector;