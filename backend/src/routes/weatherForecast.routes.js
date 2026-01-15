const express = require("express");
const router = express.Router();

const { get5DayForecast } = require("../services/weatherForecast.service");

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const forecast = await get5DayForecast(city);

    res.json({
      city,
      trend_label: "Upcoming 5 Days Weather Trend",
      forecast,
    });
  } catch (err) {
    console.error("FORECAST ERROR:", err.message);
    res.status(500).json({ error: "Unable to load forecast data" });
  }
});

module.exports = router;
