// server/routes/scores.js
const express = require("express");
const router = express.Router();
const Score = require("../models/Score");

// POST — salvează scor
router.post("/", (req, res) => {
  const body = req.body;
  if (!body || typeof body.score !== "number") {
    return res.status(400).json({ error: "Payload invalid" });
  }

  Score.add(body, (err) => {
    if (err) return res.status(500).json({ error: "Eroare DB" });
    return res.json({ ok: true });
  });
});

// GET — leaderboard
router.get("/", (req, res) => {
  Score.getTop(50, (err, rows) => {
    if (err) return res.status(500).json({ error: "Eroare DB" });
    return res.json({ ok: true, items: rows });
  });
});

module.exports = router;
