const axios = require("axios");

const AGMARKNET_API = "https://agmarknet.gov.in/api/MarketPriceReport";

async function fetchAgmarknetHistory({ crop, state, mandi, fromDate, toDate }) {
  try {
    const payload = {
      commodity: crop,
      state: state,
      district: "",
      market: mandi,
      fromDate: fromDate,
      toDate: toDate,
    };

    const response = await axios.post(AGMARKNET_API, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid AGMARKNET response");
    }

    const history = response.data.map((row) => ({
      date: row.arrival_date,
      modal: Number(row.modal_price),
    }));

    return {
      crop,
      state,
      mandi,
      history,
      source: "AGMARKNET (Govt of India)",
    };
  } catch (err) {
    console.error("DATA.GOV API ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { fetchAgmarknetHistory };
