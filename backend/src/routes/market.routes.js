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

    if (!marketData) {
      return res.json({
        status: "NO_DATA",
        message: `No ${crop} price data available for ${state}`,
      });
    }

    res.json({
      status: "OK",
      ...marketData,
    });
  } catch (err) {
    res.status(500).json({
      error: "Unable to fetch market data",
    });
  }
});

module.exports = router;
