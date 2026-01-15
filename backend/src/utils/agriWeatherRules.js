function generateAgriAdvisory(weather) {
  const advice = [];

  // Temperature rules
  if (weather.temperature < 15) {
    advice.push({
      category: "Temperature",
      level: "Warning",
      message: "Low temperature may slow crop growth. Avoid night irrigation.",
    });
  } else if (weather.temperature > 35) {
    advice.push({
      category: "Temperature",
      level: "Warning",
      message:
        "High temperature can stress crops. Irrigate early morning or evening.",
    });
  }

  // Humidity rules
  if (weather.humidity > 80) {
    advice.push({
      category: "Humidity",
      level: "Risk",
      message:
        "High humidity increases fungal disease risk. Avoid overhead watering.",
    });
  }

  // Wind rules
  if (weather.wind_speed > 6) {
    advice.push({
      category: "Wind",
      level: "Alert",
      message: "Strong winds detected. Avoid pesticide spraying today.",
    });
  }

  // Rain rules
  if (weather.rainfall > 0) {
    advice.push({
      category: "Rain",
      level: "Info",
      message: "Rain expected. Avoid fertilizer application today.",
    });
  }

  // Default safe message
  if (advice.length === 0) {
    advice.push({
      category: "General",
      level: "Safe",
      message: "Weather is suitable for normal farming activities.",
    });
  }

  return advice;
}

module.exports = { generateAgriAdvisory };
