const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db/db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({
  grades: [],
  auth: {
    token: null,
    asi: null,
  },
}).write();

db.read();

module.exports = db;
