const express = require("express");
const router = express.Router();
const { getMarketPrices } = require("../services/market.service");

router.get("/", async (req, res) => {
  try {
    const { state, crop } = req.query;

    if (!state || !crop) {
      return res.status(400).json({
        error: "State and crop are required",
      });
    }

    const marketData = await getMarketPrices(state, crop);
    res.json(marketData);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch market data" });
  }
});

module.exports = router;
