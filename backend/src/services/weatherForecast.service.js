const axios = require("axios");

const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

async function get5DayForecast(city) {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error("OPENWEATHER_API_KEY missing");
  }

  const response = await axios.get(FORECAST_URL, {
    params: {
      q: city,
      units: "metric",
      appid: process.env.OPENWEATHER_API_KEY,
    },
    timeout: 5000,
  });

  const list = response.data.list;

  // Group data by date
  const dailyData = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!dailyData[date]) {
      dailyData[date] = {
        temp: [],
        humidity: [],
        wind: [],
      };
    }

    dailyData[date].temp.push(item.main.temp);
    dailyData[date].humidity.push(item.main.humidity);
    dailyData[date].wind.push(item.wind.speed);
  });

  // Prepare final 5-day result
  const forecast = Object.keys(dailyData)
    .slice(0, 5)
    .map((date) => {
      const avg = (arr) =>
        (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

      return {
        date,
        avg_temp: avg(dailyData[date].temp),
        avg_humidity: avg(dailyData[date].humidity),
        avg_wind: avg(dailyData[date].wind),
      };
    });

  return forecast;
}

module.exports = { get5DayForecast };
