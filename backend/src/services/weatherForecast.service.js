const axios = require("axios");

const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

async function getWeatherForecast(city) {
  const res = await axios.get(FORECAST_URL, {
    params: {
      q: city,
      units: "metric",
      appid: process.env.OPENWEATHER_API_KEY,
    },
  });

  const list = res.data.list;

  const daily = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!daily[date]) {
      daily[date] = { temp: [], humidity: [], wind: [] };
    }

    daily[date].temp.push(item.main.temp);
    daily[date].humidity.push(item.main.humidity);
    daily[date].wind.push(item.wind.speed);
  });

  return Object.keys(daily)
    .slice(0, 5)
    .map((date) => ({
      date,
      avg_temp: avg(daily[date].temp),
      avg_humidity: avg(daily[date].humidity),
      avg_wind: avg(daily[date].wind),
    }));
}

function avg(arr) {
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
}

module.exports = { getWeatherForecast };
