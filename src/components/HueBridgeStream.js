import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { BridgeContext } from "../context/BridgeContext";
import LightsLabel from "./LightsLabel";
import GroupSelector from "./GroupSelector";
import StreamControls from "./StreamControls";
import "./style/HueBridgeStream.css";

const HueBridgeStream = ({ pollInterval = 5000 }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [lights, setLights] = useState([]);

  const { globalBridge, setGlobalGroup } = useContext(BridgeContext);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!globalBridge) return;

      try {
        const response = await axios.get(`/api/bridges/${globalBridge.id}/groups`);
        setGroups(response.data);
        setSelectedGroup(response.data[0] || null);
      } catch (err) {
        setError("Failed to fetch groups.");
      }
    };

    fetchGroups();
  }, [globalBridge]);

  useEffect(() => {
    const fetchLights = async () => {
      if (!selectedGroup) return;

      try {
        const response = await axios.get(`/api/bridges/${globalBridge.id}/groups/${selectedGroup.id}/lights`);
        const lightsData = response.data.map(light => ({ name: light.name, index: light.index }));
        setLights(lightsData);
        setGlobalGroup({ ...selectedGroup, lights: lightsData }); // Add lights to global group
      } catch (err) {
        setError("Failed to fetch lights.");
      }
    };

    fetchLights();
  }, [selectedGroup]);

  const handleGroupChange = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
    setGlobalGroup(selectedGroup); // Save the entire group object globally without lights initially
  };

  const startStream = async () => {
    if (!selectedGroup) {
      setError("Please select a group before starting the stream.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/stream/connect`, {
        groupId: selectedGroup.id
      });
      if (response.status === 200) {
        setIsStreaming(true);
      } else {
        throw new Error("Failed to start the stream.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/stream/disconnect`);
      if (response.status === 200) {
        setIsStreaming(false);
      } else {
        throw new Error("Failed to stop the stream.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const playNextEffect = async () => {
    setError(null);

    try {
      const response = await axios.post(`/api/stream/queue/next`);
      if (response.status !== 200) {
        throw new Error("Failed to play the next effect.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="hue-bridge-stream-horizontal">
      {error && <p className="error">Error: {error}</p>}

      <GroupSelector
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupChange}
        loading={loading}
      />

      <LightsLabel lights={lights} />

      <StreamControls
        isStreaming={isStreaming}
        startStream={startStream}
        stopStream={stopStream}
        playNextEffect={playNextEffect}
        loading={loading}
        selectedGroup={selectedGroup}
      />
    </div>
  );
};

export default HueBridgeStream;
