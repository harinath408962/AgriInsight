const express = require("express");
const router = express.Router();

const { getMarketPrices } = require("../services/agmarknet.service");

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
    let marketData;

    try {
      marketData = await getMarketPrices(state, crop);
    } catch (err) {
      return res.json({
        status: "NO_DATA",
        message: `No ${crop} price data reported for ${state}`,
      });
    }

    // Extra safety: empty data case
    if (!marketData || !marketData.prices || marketData.prices.length === 0) {
      return res.json({
        status: "NO_DATA",
        message: `No ${crop} price data reported for ${state}`,
      });
    }

    // 2. Analyze mandi-wise prices
    const analysis = getMarketAnalysis(marketData.prices);

    // 3. Generate actionable insight
    const insight = getMarketInsight(analysis);

    // 4. Prepare graph-ready data
    const mandiLabels = marketData.prices.map((p) => p.mandi);
    const modalPrices = marketData.prices.map((p) => p.modal);
    const minPrices = marketData.prices.map((p) => p.min);
    const maxPrices = marketData.prices.map((p) => p.max);

    // 5. Final response (logic + graph data)
    res.json({
      status: "OK",
      ...marketData,
      analysis,
      insight,
      graph_data: {
        price_comparison: {
          labels: mandiLabels,
          values: modalPrices,
        },
        price_range: {
          labels: mandiLabels,
          min: minPrices,
          max: maxPrices,
          modal: modalPrices,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch market data" });
  }
});

module.exports = router;

// Step 1: try live API
try {
  const liveData = await getMarketPrices(state, crop);
  if (liveData && liveData.prices.length > 0) {
    return res.json({
      source: "LIVE_API",
      ...liveData,
    });
  }
} catch (e) {
  // ignore and fallback
}

// Step 2: fallback to snapshot
const snapshot = loadSnapshotFromFile(state, crop);
if (snapshot) {
  return res.json({
    source: "SNAPSHOT",
    ...snapshot,
  });
}

// Step 3: truly no data
return res.json({
  status: "NO_DATA",
  message: "No market data available",
});
