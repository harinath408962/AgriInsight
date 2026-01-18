const axios = require("axios");

const BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const PAGE_SIZE = 100;
const MAX_PAGES = 10;

function parseAgmarknetDate(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

async function fetchMarketWithFallback({ state, commodity }) {
  let allRecords = [];

for (let page = 0; page < MAX_PAGES; page++) {
  const params = {
    "api-key": process.env.DATA_GOV_API_KEY,
    format: "json",
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    "filters[commodity]": commodity,
  };

  if (state !== "ALL") {
    params["filters[state]"] = state;
  }

  const res = await axios.get(BASE_URL, { params });

    const records = res.data.records || [];
    if (records.length === 0) break;

    records.forEach((r) => {
      const date = parseAgmarknetDate(r.arrival_date);
      if (!date || isNaN(date)) return;

      allRecords.push({
        market: r.market,
        district: r.district,
        state: r.state,
        modal_price: Number(r.modal_price),
        arrival_date: date,
      });
    });
  }

  if (allRecords.length === 0) {
    return {
      status: "NO_DATA",
      latest_date: "Unknown",
      prices: [],
    };
  }

  // Sort by date DESC
  allRecords.sort((a, b) => b.arrival_date - a.arrival_date);

  const latestDate = allRecords[0].arrival_date.toISOString().split("T")[0];

  // Only latest date prices
  const latestPrices = allRecords.filter(
    (r) => r.arrival_date.toISOString().split("T")[0] === latestDate
  );

  return {
    status: "FALLBACK",
    latest_date: latestDate,
    prices: latestPrices,
  };
}

module.exports = { fetchMarketWithFallback };
