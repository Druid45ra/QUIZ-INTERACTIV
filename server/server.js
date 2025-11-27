const express = require("express");
const path = require("path");
const cors = require("cors");
require("./db.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/scores", require("./routes/scores"));

app.use("/", express.static(path.join(__dirname, "..", "public")));

// SPA fallback – funcționează perfect în Express 5
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server pornit: http://localhost:${PORT}`);
});
