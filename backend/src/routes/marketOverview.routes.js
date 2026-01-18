const express = require("express");
const router = express.Router();

const {
  getStateMarketOverview,
} = require("../services/marketOverview.service");

router.get("/", async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({ error: "state is required" });
    }

    const data = await getStateMarketOverview(state);

    if (!data || data.overview.length === 0) {
      return res.json({
        status: "NO_DATA",
        state,
        message: "No market data available for this state today",
      });
    }

    res.json({
      status: "OK",
      ...data,
    });
  } catch (err) {
    console.error("STATE OVERVIEW ERROR:", err.message);
    res.status(500).json({ error: "Unable to fetch state market overview" });
  }
});

module.exports = router;
