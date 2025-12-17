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
      temperature: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.rain ? data.rain["1h"] || 0 : 0,
      condition: data.weather[0].description,
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
