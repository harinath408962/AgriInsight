const getWeatherAlerts = (weather) => {
  const alerts = [];

  if (weather.temperature > 35) {
    alerts.push("High temperature alert: Risk of crop stress");
  }

  if (weather.rainfall > 20) {
    alerts.push("Heavy rainfall alert: Field waterlogging risk");
  }

  if (weather.humidity > 80) {
    alerts.push("High humidity alert: Possible fungal disease risk");
  }

  return alerts;
};

const getMarketAlerts = (prices) => {
  const alerts = [];

  const modalPrices = prices.map((p) => p.modal);
  const max = Math.max(...modalPrices);
  const min = Math.min(...modalPrices);

  if (max - min > 200) {
    alerts.push("High price variation across mandis");
  }

  return alerts;
};

module.exports = { getWeatherAlerts, getMarketAlerts };
