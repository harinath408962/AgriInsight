const axios = require("axios");

const DATA_GOV_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

async function getMarketPrices(state, crop) {
  try {
    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 500,
      "filters[commodity]": crop,
    };

    if (state !== "ALL") {
      params["filters[state]"] = state;
    }

    const response = await axios.get(DATA_GOV_URL, { params, timeout: 10000 });


    const records = response.data.records;

    if (!records || records.length === 0) {
      return null;
    }

    return {
      state,
      crop,
      latest_date: records[0].arrival_date,
      prices: records.map((r) => ({
        market: r.market,
        district: r.district,
        state: r.state,  
        modal_price: Number(r.modal_price),
        min_price: Number(r.min_price),
        max_price: Number(r.max_price),
      })),
    };
  } catch (err) {
    console.error("DATA.GOV MARKET ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getMarketPrices };
