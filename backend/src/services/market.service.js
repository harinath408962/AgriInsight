// Market data service (structured & time-aware)

const getMarketPrices = async (state, crop) => {
  // NOTE:
  // For now, we simulate latest available market data.
  // This structure matches AGMARKNET-style pricing.

  const now = new Date();

  return {
    state,
    crop,

    // Time awareness
    date: now.toISOString().split("T")[0], // YYYY-MM-DD
    timestamp: now.toISOString(),

    // Mandi-wise prices
    prices: [
      {
        mandi: "Bengaluru",
        min: 1100,
        max: 1350,
        modal: 1200,
      },
      {
        mandi: "Mysuru",
        min: 1050,
        max: 1300,
        modal: 1150,
      },
      {
        mandi: "Tumakuru",
        min: 1080,
        max: 1320,
        modal: 1180,
      },
    ],
  };
};

module.exports = { getMarketPrices };
