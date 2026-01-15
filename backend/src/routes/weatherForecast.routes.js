const express = require("express");
const router = express.Router();

const { getWeatherForecast } = require("../services/weatherForecast.service");

// GET /api/weather/forecast?city=Bengaluru
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const forecast = await getWeatherForecast(city);

    res.json({
      city,
      trend_label: "Upcoming 5 Days Weather Trend",
      forecast,
    });
  } catch (err) {
    console.error("Forecast route error:", err);
    res.status(500).json({ error: "Unable to fetch forecast data" });
  }
});

module.exports = router;
