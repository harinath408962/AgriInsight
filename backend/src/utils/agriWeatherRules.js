function generateAgriAdvisory(weather) {
  const advice = [];

  if (weather.temperature > 35) {
    advice.push({
      type: "HEAT",
      risk_level: "HIGH",
      decision: "Avoid midday field work",
      reason: "High temperatures can cause heat stress to crops and workers",
      farmer_action: [
        "Work during early morning or evening",
        "Ensure irrigation is adequate",
      ],
      priority: 1,
    });
  }

  if (weather.humidity > 80) {
    advice.push({
      type: "HUMIDITY",
      risk_level: "MEDIUM",
      decision: "Watch for fungal disease",
      reason: "High humidity favors fungal growth",
      farmer_action: ["Inspect crops regularly", "Avoid excess irrigation"],
      priority: 2,
    });
  }

  if (weather.wind_speed > 6) {
    advice.push({
      type: "WIND",
      risk_level: "HIGH",
      decision: "Avoid pesticide spraying",
      reason: "Strong winds cause chemical drift and uneven spraying",
      farmer_action: [
        "Postpone spraying",
        "Resume when wind speed drops below 5 m/s",
      ],
      priority: 3,
    });
  }

  if (advice.length === 0) {
    advice.push({
      type: "NORMAL",
      risk_level: "LOW",
      decision: "Proceed with normal farm activities",
      reason: "Weather conditions are favorable",
      farmer_action: ["Continue planned activities"],
      priority: 10,
    });
  }

  return advice;
}

module.exports = { generateAgriAdvisory };
