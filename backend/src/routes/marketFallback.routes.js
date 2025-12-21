const express = require("express");
const router = express.Router();
const {
  fetchMarketWithFallback,
} = require("../services/ogdMarketFallback.service");

router.get("/", async (req, res) => {
  try {
    const { state, crop } = req.query;

    if (!state || !crop) {
      return res.status(400).json({
        error: "state and crop are required",
      });
    }

    const result = await fetchMarketWithFallback({
      state,
      commodity: crop,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
