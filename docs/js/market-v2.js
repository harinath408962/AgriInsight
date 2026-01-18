const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://agri-insight-sgui.onrender.com/api";

const API = `${API_BASE}/market`;

let chart;

/* DOM REFERENCES */
const stateSelect = document.getElementById("state");
const cropSelect = document.getElementById("crop");
const sortSelect = document.getElementById("sort");
const insights = document.getElementById("insights");
const marketTableBody = document.querySelector("#marketTable tbody");
const marketChart = document.getElementById("marketChart");

/* HELPERS */
function shortLabel(name) {
  return name.length > 20 ? name.slice(0, 20) + "…" : name;
}

function sortPrices(prices, order) {
  return prices.sort((a, b) =>
    order === "desc"
      ? b.modal_price - a.modal_price
      : a.modal_price - b.modal_price
  );
}

/* LOAD MARKET DATA */
async function loadMarket() {
  const state = stateSelect.value;
  const crop = cropSelect.value;
  const sortOrder = sortSelect.value;

  if (!state || !crop) {
    insights.innerHTML = "Please select state and crop.";
    return;
  }

  insights.innerHTML = "Loading market data...";
  marketTableBody.innerHTML = "";

  let data;
  try {
    const res = await fetch(
      `${API}?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(
        crop
      )}`
    );
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    insights.innerHTML = "Unable to fetch market data.";
    return;
  }

  /* ---------- FALLBACK DATA ---------- */
  if (data.status !== "OK") {
    const fallbackRes = await fetch(
      `${API_BASE}/market/fallback?state=${encodeURIComponent(
        state
      )}&crop=${encodeURIComponent(crop)}`
    );
    const fallback = await fallbackRes.json();

    let prices = fallback.prices || [];

    insights.innerHTML = `
      ⚠️ No fresh ${crop} price data for ${state}.<br>
      Showing <b>last reported prices</b>.<br>
      <b>Last reported date:</b> ${fallback.latest_date || "Unknown"}
    `;

    if (prices.length === 0) {
      marketTableBody.innerHTML =
        "<tr><td colspan='3'>No historical data available</td></tr>";
      if (chart) chart.destroy();
      return;
    }

    prices = sortPrices(prices, sortOrder);
    renderTable(prices);
    renderChart(prices, "rgba(245, 158, 11, 0.7)");
    return;
  }

  /* ---------- LIVE DATA ---------- */
  const prices = sortPrices([...data.prices], sortOrder);

  insights.innerHTML = `
  <p><b>Data date:</b> ${data.latest_date}</p>
  ${generateMarketInsight(prices, crop, state)}
`;

setTimeout(() => {
  const btn = document.getElementById("speakMarket");
  if (btn) {
    btn.onclick = () => {
      const msg = new SpeechSynthesisUtterance(
        insights.innerText.replace("🔊 Speak Insight", "")
      );
      speechSynthesis.cancel();
      speechSynthesis.speak(msg);
    };
  }
}, 0);


  renderTable(prices);
  renderChart(prices, "rgba(54,162,235,0.7)");
}

function generateMarketInsight(prices, crop, state) {
  if (!prices || prices.length === 0) return "";

  const highest = prices[0];
  const lowest = prices[prices.length - 1];
  const avg = Math.round(
    prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length
  );

  return `
    <button id="speakMarket"
      style="float:right;padding:6px 10px;cursor:pointer;">
      🔊 Speak Insight
    </button>

    <p><b>Crop:</b> ${crop}</p>
    <p><b>State:</b> ${state}</p>
    <p><b>Highest price:</b> ₹${highest.modal_price} at ${highest.market}</p>
    <p><b>Lowest price:</b> ₹${lowest.modal_price} at ${lowest.market}</p>
    <p><b>Average price:</b> ₹${avg}</p>
    <p><b>Suggestion:</b> Prices are favorable in select markets. Consider selling.</p>
  `;
}


/* RENDER TABLE */
function renderTable(prices) {
  marketTableBody.innerHTML = "";
  prices.forEach((p) => {
    marketTableBody.innerHTML += `
      <tr>
        <td>${p.market}</td>
        <td>${p.district}</td>
        <td>₹${p.modal_price}</td>
      </tr>
    `;
  });
}

/* RENDER CHART */
function renderChart(prices, color) {
  if (chart) chart.destroy();

  chart = new Chart(marketChart, {
    type: "bar",
    data: {
      labels: prices.map((p) => shortLabel(p.market)),
      datasets: [
        {
          label: "Modal Price (₹)",
          data: prices.map((p) => p.modal_price),
          backgroundColor: color,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    },
  });
}
