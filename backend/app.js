require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "AgriInsight backend is running",
  });
});

const weatherRoutes = require("./src/routes/weather.routes");

app.use("/api/weather", weatherRoutes);

const marketRoutes = require("./src/routes/market.routes");

app.use("/api/market", marketRoutes);

const insightRoutes = require("./src/routes/insight.routes");
app.use("/api/insight", insightRoutes);

module.exports = app;
