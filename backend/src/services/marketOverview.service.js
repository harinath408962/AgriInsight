const axios = require("axios");

const DATA_GOV_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

function normalizeDate(d) {
  const [day, month, year] = d.split("/").map(Number);
  return new Date(year, month - 1, day);
}

async function getStateMarketOverview(state) {
  const res = await axios.get(DATA_GOV_URL, {
    params: {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: 500,
      "filters[state]": state,
    },
    timeout: 10000,
  });

  const records = res.data.records || [];
  if (records.length === 0) return null;

  // 🔹 Find latest available date
  const dated = records
    .map((r) => ({
      ...r,
      parsed_date: normalizeDate(r.arrival_date),
    }))
    .filter((r) => !isNaN(r.parsed_date));

  dated.sort((a, b) => b.parsed_date - a.parsed_date);
  const latestDate = dated[0].parsed_date.toISOString().split("T")[0];

  // 🔹 Keep only latest-date records
  const latestRecords = dated.filter(
    (r) => r.parsed_date.toISOString().split("T")[0] === latestDate
  );

  // 🔹 Group by crop
  const cropMap = {};

  latestRecords.forEach((r) => {
    const crop = r.commodity;
    const price = Number(r.modal_price);
    if (!price) return;

    if (!cropMap[crop]) {
      cropMap[crop] = {
        crop,
        total: 0,
        count: 0,
        max_price: price,
        max_market: r.market,
        min_price: price,
        min_market: r.market,
        markets: new Set(),
      };
    }

    const c = cropMap[crop];
    c.total += price;
    c.count += 1;
    c.markets.add(r.market);

    if (price > c.max_price) {
      c.max_price = price;
      c.max_market = r.market;
    }

    if (price < c.min_price) {
      c.min_price = price;
      c.min_market = r.market;
    }
  });

  const overview = Object.values(cropMap).map((c) => ({
    crop: c.crop,
    avg_price: Math.round(c.total / c.count),
    max_price: c.max_price,
    max_market: c.max_market,
    min_price: c.min_price,
    min_market: c.min_market,
    markets_count: c.markets.size,
  }));

  return {
    state,
    latest_date: latestDate,
    total_crops: overview.length,
    total_markets: latestRecords.length,
    overview,
  };
}

module.exports = { getStateMarketOverview };
