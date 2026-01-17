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

const citySelect = document.getElementById("city");

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
    const riskClass =
      d.risk_level === "HIGH"
        ? "high"
        : d.risk_level === "MEDIUM"
        ? "medium"
        : "low";

    decisionDiv.className = `decision-card ${riskClass}`;

    decisionDiv.innerHTML = `
  <button id="speakBtn" style="float:right;margin-top:10px;">
  🔊 Speak Advisory
</button>


  <p><b>${d.decision}</b></p>
  <p>${d.reason}</p>


  <h4>Recommended Action</h4>
  <ul class="actions">
    ${d.farmer_action.map((a) => `<li>${a}</li>`).join("")}
  </ul>
`;

    document.getElementById("speakBtn").onclick = () => {
      const msg = new SpeechSynthesisUtterance(`${d.decision}. ${d.reason}`);
      speechSynthesis.speak(msg);
      const actionMsg = new SpeechSynthesisUtterance(
        `Recommended actions are: ${d.farmer_action.join(", ")}`
      );
      speechSynthesis.speak(actionMsg);
    };

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

    // Table references
    const dateRow = document.getElementById("forecastDates");
    const tempRow = document.getElementById("row-temp");
    const humRow = document.getElementById("row-humidity");
    const windRow = document.getElementById("row-wind");
    const rainRow = document.getElementById("row-rain");

    // RESET rows (keep first label cell)
    dateRow.innerHTML = `<th>Metric ↓ / Date →</th>`;
    tempRow.innerHTML = `<td style="color:#ef4444">Temperature (°C)</td>`;
    humRow.innerHTML = `<td style="color:#3b82f6">Humidity (%)</td>`;
    windRow.innerHTML = `<td style="color:#22c55e">Wind (m/s)</td>`;
    rainRow.innerHTML = `<td style="color:#0ea5e9">Rainfall (mm)</td>`;

    data.forecast.forEach((day) => {
      const label = new Date(day.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      dateRow.innerHTML += `<th>${label}</th>`;
      tempRow.innerHTML += `<td style="color:#ef4444">${day.avg_temp}</td>`;
      humRow.innerHTML += `<td style="color:#3b82f6">${day.avg_humidity}</td>`;
      windRow.innerHTML += `<td style="color:#22c55e">${day.avg_wind}</td>`;
      rainRow.innerHTML += `<td style="color:#0ea5e9">${
        day.rainfall ?? 0
      }</td>`;
    });

    /* ===== GRAPH ===== */
    const ctx = document.getElementById("forecastChart").getContext("2d");
    if (forecastChart) forecastChart.destroy();

    forecastChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.forecast.map((d) =>
          new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
          })
        ),
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
          {
            label: "Rainfall (mm)",
            data: data.forecast.map((d) => d.rainfall ?? 0),
            borderColor: "#0ea5e9",
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
