const express = require("express");
const router = express.Router();
const { getWeatherByCity } = require("../services/weather.service");

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const weatherData = await getWeatherByCity(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
