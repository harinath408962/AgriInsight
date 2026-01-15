const axios = require("axios");

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// In-memory cache
const cache = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getWeatherByCity(city) {
  const key = city.toLowerCase();

  // ✅ Cache hit
  if (cache[key] && Date.now() - cache[key].time < CACHE_TTL) {
    return cache[key].data;
  }

  try {
    // ✅ Correct env variable check
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error("OPENWEATHER_API_KEY is missing in .env");
    }

    const response = await axios.get(WEATHER_URL, {
      params: {
        q: city,
        units: "metric",
        appid: process.env.OPENWEATHER_API_KEY,
      },
      timeout: 5000,
    });

    const w = response.data;

    const result = {
      city: w.name,
      temperature: w.main.temp,
      feels_like: w.main.feels_like,
      temp_min: w.main.temp_min,
      temp_max: w.main.temp_max,
      humidity: w.main.humidity,
      pressure: w.main.pressure,
      wind_speed: w.wind.speed,
      rainfall: w.rain && w.rain["1h"] ? w.rain["1h"] : 0,
      condition: w.weather[0].description,
      condition_main: w.weather[0].main,
    };

    // Save to cache
    cache[key] = {
      time: Date.now(),
      data: result,
    };

    return result;
  } catch (err) {
    console.error("🌧 WEATHER SERVICE ERROR");
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);

    throw new Error("Unable to fetch weather data");
  }
}

module.exports = { getWeatherByCity };
