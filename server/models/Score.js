// server/models/Score.js
const db = require("../db");

module.exports = {
  add(scoreEntry, callback) {
    const stmt = db.prepare(`
      INSERT INTO scores(score, correct, total, totalTime, createdAt, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      scoreEntry.score,
      scoreEntry.correct,
      scoreEntry.total,
      scoreEntry.totalTime,
      new Date().toISOString(),
      JSON.stringify(scoreEntry.answers),
      callback
    );
  },

  getTop(limit = 50, callback) {
    db.all(
      `SELECT * FROM scores ORDER BY score DESC, totalTime ASC LIMIT ?`,
      [limit],
      callback
    );
  },
};
