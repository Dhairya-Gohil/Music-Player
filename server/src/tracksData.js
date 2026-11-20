const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

// No random or fake tracks - only real local audio files are loaded
const INITIAL_TRACKS = [];

const INITIAL_PLAYLISTS = [];

const INITIAL_TODOS = [
  { id: "todo-1", text: "Organize my local songs and playlists", completed: false },
  { id: "todo-2", text: "Add custom album cover art", completed: false }
];

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      if (!data.todos) data.todos = INITIAL_TODOS;
      if (!data.playlists) data.playlists = INITIAL_PLAYLISTS;
      if (!data.trackOverrides) data.trackOverrides = {};
      return data;
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  const initial = { 
    tracks: [], 
    trackOverrides: {},
    playlists: INITIAL_PLAYLISTS, 
    todos: INITIAL_TODOS 
  };
  saveData(initial);
  return initial;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving data file:", err);
  }
}

module.exports = {
  loadData,
  saveData
};
