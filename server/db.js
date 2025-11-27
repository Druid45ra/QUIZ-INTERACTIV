// server/db.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./quiz.db");

db.run(`
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  totalTime INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  data TEXT
)
`);

module.exports = db;
