window.onload = () => {
  const citySelect = document.getElementById("city");

  INDIAN_CITIES.sort((a, b) => a.city.localeCompare(b.city)).forEach(
    ({ city, state }) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = `${city}, ${state}`;
      citySelect.appendChild(option);
    }
  );

  // Load default city
  loadWeather();
};

const WEATHER_API = "http://localhost:5000/api/weather";
const FORECAST_API = "http://localhost:5000/api/weather/forecast";

let forecastChart;

async function loadWeather() {
  const city = document.getElementById("city").value;

  const dashboard = document.getElementById("dashboard");
  const alertsDiv = document.getElementById("alerts");
  const recentDiv = document.getElementById("recent");

  dashboard.innerHTML = "Loading...";
  alertsDiv.innerHTML = "";
  recentDiv.innerHTML = "";

  try {
    const res = await fetch(`${WEATHER_API}?city=${city}`);
    const data = await res.json();

    // Dashboard cards
    dashboard.innerHTML = `
      <div class="card"><h3>City</h3><p>${data.city}</p></div>
      <div class="card"><h3>Temperature</h3><p>${data.temperature} °C</p></div>
      <div class="card"><h3>Humidity</h3><p>${data.humidity}%</p></div>
      <div class="card"><h3>Wind</h3><p>${data.wind_speed} m/s</p></div>
      <div class="card"><h3>Condition</h3><p>${data.condition}</p></div>
      <div class="card"><h3>Insight</h3><p>${data.insight}</p></div>
    `;

    // Alerts
    if (data.alerts && data.alerts.length > 0) {
      alertsDiv.innerHTML = `
        <h3>Alerts</h3>
        <ul>${data.alerts.map((a) => `<li>${a}</li>`).join("")}</ul>
      `;
    }

    // Recent Weather (mocked with real dates)
    const today = new Date();

    const recentMock = [1, 2, 3].map((daysAgo) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);

      return {
        date: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        temp: data.temperature - daysAgo,
        condition: data.condition,
      };
    });

    recentDiv.innerHTML = recentMock
      .map(
        (d) =>
          `<div class="recent-item">
            <b>${d.date}</b> — ${d.temp.toFixed(1)} °C, ${d.condition}
          </div>`
      )
      .join("");

    // Load forecast chart
    loadForecast(city);
  } catch (err) {
    dashboard.innerHTML = "Unable to load weather data.";
    console.error(err);
  }
}

async function loadForecast(city) {
  try {
    const res = await fetch(`${FORECAST_API}?city=${city}`);
    const data = await res.json();

    const labels = data.forecast.map((d) =>
      new Date(d.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    );

    const temp = data.forecast.map((d) => d.avg_temp);
    const humidity = data.forecast.map((d) => d.avg_humidity);
    const wind = data.forecast.map((d) => d.avg_wind);

    const ctx = document.getElementById("forecastChart").getContext("2d");

    if (forecastChart) forecastChart.destroy();

    forecastChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temp,
            borderColor: "#ff4d4d",
            tension: 0.3,
          },
          {
            label: "Humidity (%)",
            data: humidity,
            borderColor: "#4d79ff",
            tension: 0.3,
          },
          {
            label: "Wind (m/s)",
            data: wind,
            borderColor: "#2ecc71",
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  } catch (err) {
    console.error("Forecast load error:", err);
  }
}
