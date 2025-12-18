// Weather Alerts (rule-based)
const getWeatherAlerts = (weather) => {
  const alerts = [];

  // Heat stress
  if (weather.feels_like > 35) {
    alerts.push("High heat stress risk for crops");
  }

  // Fungal disease risk
  if (weather.humidity > 80 && weather.condition_main === "Mist") {
    alerts.push("High fungal disease risk due to humidity and mist");
  }

  // Spraying risk
  if (weather.wind_speed > 6) {
    alerts.push("High wind speed – avoid pesticide spraying");
  }

  // Heavy rainfall
  if (weather.rainfall > 20) {
    alerts.push("Heavy rainfall – risk of waterlogging");
  }

  return alerts;
};

// Weather Insight (human-readable meaning)
const getWeatherInsight = (weather) => {
  if (weather.humidity > 80 && weather.condition_main === "Mist") {
    return "Weather conditions favor fungal diseases, especially in leafy crops.";
  }

  if (weather.feels_like > 35) {
    return "High heat stress may affect crop growth and increase irrigation needs.";
  }

  if (weather.wind_speed > 6) {
    return "Strong winds may reduce spraying effectiveness.";
  }

  return "Weather conditions are generally stable for field activities.";
};

// -----------------------------
// Market Intelligence (rule-based)
// -----------------------------

const getMarketAnalysis = (prices) => {
  let highest = prices[0];
  let lowest = prices[0];

  prices.forEach((p) => {
    if (p.modal > highest.modal) highest = p;
    if (p.modal < lowest.modal) lowest = p;
  });

  const priceGap = highest.modal - lowest.modal;

  return {
    highest_mandi: highest.mandi,
    lowest_mandi: lowest.mandi,
    highest_price: highest.modal,
    lowest_price: lowest.modal,
    price_gap: priceGap,
  };
};

const getMarketInsight = (analysis) => {
  if (analysis.price_gap > 200) {
    return `Large price variation detected. Selling in ${analysis.highest_mandi} mandi may give better returns today.`;
  }

  if (analysis.price_gap > 100) {
    return `Moderate price variation across mandis. ${analysis.highest_mandi} mandi is slightly better for selling.`;
  }

  return "Market prices are relatively stable across nearby mandis today.";
};

module.exports = {
  getWeatherAlerts,
  getWeatherInsight,
  getMarketAnalysis,
  getMarketInsight,
};
