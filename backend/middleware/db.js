const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Read a JSON file and parse it
const readDB = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return [];
  }
};

// Write data to a JSON file
const writeDB = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
};

module.exports = { readDB, writeDB };
