const express = require("express");
const router = express.Router();

const { fetchMarketTrend } = require("../services/marketTrend.service");

router.get("/", async (req, res) => {
  try {
    const { state, crop, market, days } = req.query;

    if (!state || !crop || !market) {
      return res.status(400).json({
        error: "state, crop and market are required",
      });
    }

    const result = await fetchMarketTrend({
      state,
      commodity: crop,
      market,
      days: Number(days) || 7,
    });

    res.json(result);
  } catch (err) {
    console.error("MARKET TREND ERROR:", err.message);
    res.status(500).json({
      error: "Unable to fetch market trend",
    });
  }
});

module.exports = router;
