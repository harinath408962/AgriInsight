const axios = require("axios");

const BASE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const PAGE_SIZE = 100;
const MAX_PAGES = 20; // safety cap

function parseAgmarknetDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day);
}

function calculateTrend(first, last) {
  if (!first || !last || first === 0) {
    return { direction: "STABLE", percent_change: 0 };
  }

  const diff = last - first;
  const percent = ((diff / first) * 100).toFixed(2);

  return {
    direction: diff > 0 ? "UP" : diff < 0 ? "DOWN" : "STABLE",
    percent_change: Number(percent),
  };
}

async function fetchMarketTrend({ state, commodity, market, days }) {
  let collected = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await axios.get(BASE_URL, {
      params: {
        "api-key": process.env.DATA_GOV_API_KEY,
        format: "json",
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        "filters[commodity]": commodity,
      },
    });

    const records = response.data.records || [];
    if (records.length === 0) break;

    const filtered = records
      .map((r) => {
        const date = parseAgmarknetDate(r.arrival_date);
        if (!date || isNaN(date)) return null;

        return {
          state: r.state,
          market: r.market,
          date,
          modal_price: Number(r.modal_price),
        };
      })
      .filter(
        (r) =>
          r &&
          r.state.toLowerCase() === state.toLowerCase() &&
          r.market.toLowerCase() === market.toLowerCase()
      );

    collected.push(...filtered);

    // Stop once we have enough dates
    const uniqueDates = new Set(
      collected.map((r) => r.date.toISOString().split("T")[0])
    );

    if (uniqueDates.size >= days) break;
  }

  if (collected.length === 0) {
    return {
      status: "NO_DATA",
      message: `No recent ${commodity} price data for ${market}, ${state}`,
      last_checked: new Date().toISOString(),
    };
  }

  // Group by date
  const grouped = {};
  collected.forEach((r) => {
    const key = r.date.toISOString().split("T")[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r.modal_price);
  });

  // Sort dates ASC and take last N
  const dates = Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-days);

  const prices = dates.map((d) =>
    Math.round(grouped[d].reduce((sum, v) => sum + v, 0) / grouped[d].length)
  );

  const trend = calculateTrend(prices[0], prices[prices.length - 1]);

  return {
    status: "OK",
    state,
    commodity,
    market,
    days: dates.length,
    dates,
    prices,
    trend,
    note: "Trend based on available market days (not calendar days)",
  };
}

module.exports = { fetchMarketTrend };
