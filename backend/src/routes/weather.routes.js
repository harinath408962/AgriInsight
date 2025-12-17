const express = require("express");
const router = express.Router();

const { getWeatherByCity } = require("../services/weather.service");
const { getWeatherAlerts } = require("../utils/alertRules");

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    // Fetch weather data
    const weatherData = await getWeatherByCity(city);

    // Generate rule-based alerts
    const alerts = getWeatherAlerts(weatherData);

    // Send combined response
    res.json({
      ...weatherData,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
