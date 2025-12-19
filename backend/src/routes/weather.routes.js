const express = require("express");
const router = express.Router();

const { getWeatherByCity } = require("../services/weather.service");
const { getWeatherAlerts, getWeatherInsight } = require("../utils/alertRules");

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    // 1. Fetch enriched weather data
    const weatherData = await getWeatherByCity(city);

    // 2. Generate rule-based alerts
    const alerts = getWeatherAlerts(weatherData);

    // 3. Generate human-readable insight
    const insight = getWeatherInsight(weatherData);

    // 4. Prepare graph-ready weather data
    const graphData = {
      factors: {
        labels: ["Temperature", "Humidity", "Wind Speed", "Rainfall"],
        values: [
          weatherData.temperature,
          weatherData.humidity,
          weatherData.wind_speed,
          weatherData.rainfall,
        ],
      },
    };

    // 5. Final response
    res.json({
      ...weatherData,
      alerts,
      insight,
      graph_data: graphData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
