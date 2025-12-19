const express = require("express");
const router = express.Router();

const { getWeatherByCity } = require("../services/weather.service");
const { getMarketPrices } = require("../services/market.service");

const {
  getWeatherAlerts,
  getWeatherInsight,
  getMarketAnalysis,
  getMarketInsight,
  getCombinedInsight,
} = require("../utils/alertRules");

router.get("/", async (req, res) => {
  try {
    const { city, state, crop } = req.query;

    if (!city || !state || !crop) {
      return res.status(400).json({
        error: "city, state and crop are required",
      });
    }

    // 1. Fetch weather data
    const weatherData = await getWeatherByCity(city);

    // Attach weather alerts & insight
    weatherData.alerts = getWeatherAlerts(weatherData);
    weatherData.insight = getWeatherInsight(weatherData);

    // 2. Fetch market data
    const marketData = await getMarketPrices(state, crop);

    // Analyze market prices
    const marketAnalysis = getMarketAnalysis(marketData.prices);
    const marketInsight = getMarketInsight(marketAnalysis);

    // 3. Generate combined insight
    const combinedInsight = getCombinedInsight(weatherData, marketAnalysis);

    // 4. Prepare SUMMARY DATA (for cards / indicators)
    const summary = {
      weather_risk: weatherData.alerts.length > 0 ? "HIGH" : "LOW",
      market_stability: marketAnalysis.price_gap > 100 ? "VOLATILE" : "STABLE",
      best_mandi: marketAnalysis.highest_mandi,
      price_gap: marketAnalysis.price_gap,
    };

    // 5. Final response
    res.json({
      location: {
        city,
        state,
      },
      crop,

      weather: weatherData,

      market: {
        ...marketData,
        analysis: marketAnalysis,
        insight: marketInsight,
      },

      combined_insight: combinedInsight,

      summary,
    });
  } catch (error) {
    res.status(500).json({
      error: "Unable to generate combined insight",
    });
  }
});

module.exports = router;
