const express = require("express");
const router = express.Router();
const {
  fetchMarketWithFallback,
} = require("../services/ogdMarketFallback.service");

router.get("/", async (req, res) => {
  try {
    const { state, crop } = req.query;

    if (!state || !crop) {
      return res.status(400).json({ error: "state and crop are required" });
    }

    const data = await fetchMarketWithFallback({
      state,
      commodity: crop,
    });

    if (!data.prices || data.prices.length === 0) {
      return res.json({
        status: "NO_DATA",
        latest_date: "Unknown",
        prices: [],
      });
    }

    res.json({
      status: "FALLBACK",
      latest_date: data.latest_date,
      prices: data.prices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
