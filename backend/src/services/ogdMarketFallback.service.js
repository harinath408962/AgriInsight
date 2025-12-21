const axios = require("axios");

const BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

/**
 * Parse AGMARKNET date format safely
 * Input: "21/12/2025"
 * Output: JS Date object
 */
function parseAgmarknetDate(dateStr) {
  if (!dateStr) return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day); // JS month is 0-based
}

async function fetchMarketWithFallback({ state, commodity }) {
  try {
    console.log("Using API KEY:", process.env.DATA_GOV_API_KEY);

    const response = await axios.get(BASE_URL, {
      params: {
        "api-key": process.env.DATA_GOV_API_KEY,
        format: "json",
        limit: 100,
        "filters[commodity]": commodity,
      },
    });

    const records = response.data.records || [];

    if (records.length === 0) {
      return {
        status: "NO_DATA",
        message: "No market data available for this commodity",
      };
    }

    // Normalize records + safe date parsing
    const normalized = records
      .map((r) => {
        const parsedDate = parseAgmarknetDate(r.arrival_date);

        if (!parsedDate || isNaN(parsedDate)) return null;

        return {
          state: r.state,
          district: r.district,
          market: r.market,
          arrival_date: parsedDate,
          modal_price: Number(r.modal_price),
        };
      })
      .filter(Boolean); // remove invalid rows

    // Filter by requested state
    const stateRecords = normalized.filter(
      (r) => r.state.toLowerCase() === state.toLowerCase()
    );

    if (stateRecords.length === 0) {
      return {
        status: "NO_DATA",
        message: `No recent ${commodity} price data reported for ${state}`,
        last_checked: new Date().toISOString(),
      };
    }

    // Sort by date DESC
    stateRecords.sort((a, b) => b.arrival_date - a.arrival_date);

    // Get latest available date
    const latestDateObj = stateRecords[0].arrival_date;
    const latestDate = latestDateObj.toISOString().split("T")[0];

    // Records only from latest date
    const latestDayRecords = stateRecords.filter(
      (r) => r.arrival_date.getTime() === latestDateObj.getTime()
    );

    // Graph-ready data
    const graphData = {
      labels: latestDayRecords.map((r) => r.market),
      values: latestDayRecords.map((r) => r.modal_price),
    };

    return {
      status: "OK",
      state,
      commodity,
      latest_date: latestDate,
      prices: latestDayRecords,
      graph_data: graphData,
      note: "Latest available data shown (data may not be from today)",
    };
  } catch (err) {
    console.error("OGD MARKET ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { fetchMarketWithFallback };
