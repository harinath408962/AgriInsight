const express = require("express");
const router = express.Router();

const { getMarketPrices } = require("../services/market.service");
const { getMarketAnalysis, getMarketInsight } = require("../utils/alertRules");

router.get("/", async (req, res) => {
  try {
    const { state, crop } = req.query;

    if (!state || !crop) {
      return res.status(400).json({
        error: "State and crop are required",
      });
    }

    // 1. Fetch structured market data
    const marketData = await getMarketPrices(state, crop);

    // 2. Analyze mandi-wise prices
    const analysis = getMarketAnalysis(marketData.prices);

    // 3. Generate actionable insight
    const insight = getMarketInsight(analysis);

    // 4. Final response
    res.json({
      ...marketData,
      analysis,
      insight,
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch market data" });
  }
});

module.exports = router;
