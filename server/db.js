const fs = require('fs');
const path = require('path');

// Define the path to the database file
const dbFilePath = path.resolve(__dirname, 'data/db.json');

// Check if the file exists
function fileExists() {
  return fs.existsSync(dbFilePath);
}

// Read the JSON file and parse it
function readData() {
  if (!fileExists()) {
    return {};  // Return an empty object if the file doesn't exist
  }
  
  const rawData = fs.readFileSync(dbFilePath, 'utf8');
  return JSON.parse(rawData);
}

// Write data to the JSON file
function writeData(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Data written to file');
}

function initializeDatabase() {
  const data = readData();
  
  // If the database is empty, initialize with default values
  if (!data.bridges) {
    data.bridges = [];
  }
  if (!data.lights) {
    data.lights = [];
  }
  if (!data.areas) {
    data.areas = [];
  }

  // Write the initialized data back to the file
  writeData(data);
}

function addBridge(newBridge) {
  const data = readData();
  data.bridges.push(newBridge);  // Add the new bridge to the bridges array
  writeData(data);  // Save updated data to the file
  console.log('Bridge added:', newBridge);
}

function getBridges() {
  const data = readData();
  return data.bridges;
}

function updateBridge(id, updatedBridge) {
  const data = readData();
  const index = data.bridges.findIndex(bridge => bridge.id === id);
  if (index !== -1) {
    data.bridges[index] = { ...data.bridges[index], ...updatedBridge };  // Merge old and new values
    writeData(data);  // Save updated data to the file
    console.log('Bridge updated:', updatedBridge);
  } else {
    console.log('Bridge not found');
  }
}

function deleteBridge(id) {
  const data = readData();
  const index = data.bridges.findIndex(bridge => bridge.id === id);
  if (index !== -1) {
    const deletedBridge = data.bridges.splice(index, 1);  // Remove the bridge from the array
    writeData(data);  // Save updated data to the file
    console.log('Bridge deleted:', deletedBridge);
  } else {
    console.log('Bridge not found');
  }
}

// Initialize the database (this will create the db.json file if it doesn't exist)
initializeDatabase();

// Add some bridges
addBridge({ id: 1, name: 'Bridge 1', ip: '192.168.1.1' });
addBridge({ id: 2, name: 'Bridge 2', ip: '192.168.1.2' });

// Get all bridges
console.log('All Bridges:', getBridges());

// Update a bridge
updateBridge(1, { name: 'Updated Bridge 1', ip: '192.168.1.10' });

// Get all bridges again to see the update
console.log('Updated Bridges:', getBridges());

// Delete a bridge
deleteBridge(2);

// Get all bridges again to see the deletion
console.log('Remaining Bridges:', getBridges());