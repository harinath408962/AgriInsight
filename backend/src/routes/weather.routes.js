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

    // 2️⃣ Generate advisory list
    const advisory = generateAgriAdvisory(weatherData);

    // 3️⃣ Pick final decision (highest priority = lowest number)
    let finalDecision = null;
    if (Array.isArray(advisory) && advisory.length > 0) {
      finalDecision = advisory.sort((a, b) => a.priority - b.priority)[0];
    }

    // 4️⃣ Send response
    res.json({
      ...weatherData,
      advisory,
      final_decision: finalDecision,
      graph_data: {
        labels: ["Temperature", "Humidity", "Wind", "Rainfall"],
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
