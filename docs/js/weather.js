/* ============================
   API BASE (LOCAL vs DEPLOYED)
   ============================ */
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://agri-insight-sgui.onrender.com/api";

const WEATHER_API = `${API_BASE}/weather`;
const FORECAST_API = `${API_BASE}/weather/forecast`;

let forecastChart;

/* ============================
   INIT
   ============================ */
window.onload = () => {
  const citySelect = document.getElementById("city");

  // SAFETY: if cities file fails, still work
  if (typeof INDIAN_CITIES !== "undefined" && INDIAN_CITIES.length > 0) {
    INDIAN_CITIES.sort((a, b) => a.city.localeCompare(b.city)).forEach(
      ({ city, state }) => {
        const option = document.createElement("option");
        option.value = city.trim();
        option.textContent = `${city}, ${state}`;
        citySelect.appendChild(option);
      }
    );
  } else {
    // FALLBACK city
    const option = document.createElement("option");
    option.value = "Bengaluru";
    option.textContent = "Bengaluru";
    citySelect.appendChild(option);
  }

  loadWeather();
};

/* ============================
   LOAD WEATHER + ADVISORY
   ============================ */
async function loadWeather() {
  const city = document.getElementById("city").value;

  const decisionDiv = document.getElementById("finalDecision");
  const dashboard = document.getElementById("dashboard");

  decisionDiv.innerHTML = "Loading advisory...";
  dashboard.innerHTML = "Loading weather data...";

  try {
    const res = await fetch(`${WEATHER_API}?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Weather API error");

    const data = await res.json();

    // FINAL DECISION (SAFE)
    const d = data.final_decision || data.advisory?.[0];

    if (!d) {
      decisionDiv.innerHTML = "No advisory available.";
      dashboard.innerHTML = "";
      return;
    }

    /* ===== HERO DECISION ===== */
    decisionDiv.innerHTML = `
      <h2>${d.risk_level} RISK</h2>
      <p><b>${d.decision}</b></p>
      <p>${d.reason}</p>
      <h4>What should you do?</h4>
      <ul class="actions">
        ${d.farmer_action.map((a) => `<li>${a}</li>`).join("")}
      </ul>
    `;

    /* ===== SUPPORTING DATA ===== */
    dashboard.innerHTML = `
      <div class="card"><h3>City</h3><p>${data.city}</p></div>
      <div class="card"><h3>Temperature</h3><p>${data.temperature} °C</p></div>
      <div class="card"><h3>Humidity</h3><p>${data.humidity}%</p></div>
      <div class="card"><h3>Wind</h3><p>${data.wind_speed} m/s</p></div>
      <div class="card"><h3>Condition</h3><p>${data.condition}</p></div>
      <div class="card"><h3>Rainfall</h3><p>${data.rainfall} mm</p></div>
    `;

    loadForecast(city);
  } catch (err) {
    console.error(err);
    decisionDiv.innerHTML = "Unable to load advisory.";
    dashboard.innerHTML = "";
  }
}

/* ============================
   LOAD FORECAST
   ============================ */
async function loadForecast(city) {
  try {
    const res = await fetch(`${FORECAST_API}?city=${encodeURIComponent(city)}`);
    if (!res.ok) return;

    const data = await res.json();

    const labels = data.forecast.map((d) =>
      new Date(d.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    );

    const ctx = document.getElementById("forecastChart").getContext("2d");

    if (forecastChart) forecastChart.destroy();

    forecastChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temp (°C)",
            data: data.forecast.map((d) => d.avg_temp),
            borderColor: "#ef4444",
          },
          {
            label: "Humidity (%)",
            data: data.forecast.map((d) => d.avg_humidity),
            borderColor: "#3b82f6",
          },
          {
            label: "Wind (m/s)",
            data: data.forecast.map((d) => d.avg_wind),
            borderColor: "#22c55e",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  } catch (err) {
    console.error("Forecast error:", err);
  }
}
