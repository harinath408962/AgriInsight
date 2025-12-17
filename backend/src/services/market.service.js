// TEMPORARY sample data (replace later if needed)
const getMarketPrices = async (state, crop) => {
  return {
    state,
    crop,
    prices: [
      { mandi: "Bengaluru", modal: 1200, unit: "Rs/quintal" },
      { mandi: "Mysuru", modal: 1150, unit: "Rs/quintal" },
      { mandi: "Tumakuru", modal: 1180, unit: "Rs/quintal" },
    ],
  };
};

module.exports = { getMarketPrices };
