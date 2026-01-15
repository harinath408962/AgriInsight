const express = require("express");
const router = express.Router();

const { getWeatherByCity } = require("../services/weather.service");
const { generateAgriAdvisory } = require("../utils/agriWeatherRules");

// GET /api/weather?city=Bengaluru
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    // 1️⃣ Fetch weather data
    const weatherData = await getWeatherByCity(city);

    // 2️⃣ Generate agricultural advisory
    const advisory = generateAgriAdvisory(weatherData);

    // 3️⃣ Simple legacy alerts (can be removed later if needed)
    const alerts = [];
    if (weatherData.wind_speed > 6) alerts.push("High wind – avoid spraying");
    if (weatherData.humidity > 80) alerts.push("High humidity – fungal risk");
    if (weatherData.temperature < 15)
      alerts.push("Low temperature – cold stress risk");

    // 4️⃣ Send response
    res.json({
      ...weatherData,

      advisory, // 👈 MAIN OUTPUT (decision-based)

      alerts, // 👈 legacy simple alerts

      insight:
        advisory && advisory.length > 0
          ? advisory[0].message
          : "Weather is suitable for field activities",

      graph_data: {
        labels: ["Temperature", "Humidity", "Wind", "Rain"],
        values: [
          weatherData.temperature,
          weatherData.humidity,
          weatherData.wind_speed,
          weatherData.rainfall,
        ],
      },
    });
  } catch (err) {
    console.error("Weather route error:", err);
    res.status(500).json({ error: "Unable to fetch weather data" });
  }
});

module.exports = router;
