const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Weather routes
app.use("/api/weather", require("./routes/weather.routes"));
app.use("/api/weather/forecast", require("./routes/weatherForecast.routes"));

// ✅ Market routes
app.use("/api/market", require("./routes/market.routes"));
app.use("/api/market/fallback", require("./routes/marketFallback.routes"));
app.use("/api/market/trend", require("./routes/marketTrend.routes"));

app.get("/", (req, res) => {
  res.send("AgriInsight backend running");
});

module.exports = app;
