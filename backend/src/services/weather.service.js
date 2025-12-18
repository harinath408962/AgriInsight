const axios = require("axios");

const getWeatherByCity = async (city) => {
  try {
    console.log("API KEY:", process.env.OPENWEATHER_API_KEY);

    const apiKey = process.env.OPENWEATHER_API_KEY;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    const data = response.data;

    return {
      city: data.name,

      // Temperature
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,

      // Atmosphere
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility,

      // Wind
      wind_speed: data.wind.speed,

      // Rain
      rainfall: data.rain ? data.rain["1h"] || 0 : 0,

      // Condition
      condition: data.weather[0].description,
      condition_main: data.weather[0].main,
    };
  } catch (error) {
    console.error("Weather API ERROR:");

    if (error.response) {
      // API responded with error status
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("No response received");
    } else {
      // Other error
      console.error("Error message:", error.message);
    }

    throw new Error("Unable to fetch weather data");
  }
};

module.exports = { getWeatherByCity };
