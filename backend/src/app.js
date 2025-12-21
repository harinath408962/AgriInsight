const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/market/latest", require("./routes/marketFallback.routes"));

// Health check
app.get("/", (req, res) => {
  res.send("AgriInsight backend running");
});

module.exports = app;
