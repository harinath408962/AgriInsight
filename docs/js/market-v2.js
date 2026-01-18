/* ============================
   STATIC CROP & STATE LIST
   ============================ */

const POPULAR_CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Green Chilli",
  "Onion",
  "Tomato",
  "Potato"
];

const POPULAR_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Uttar Pradesh",
  "Gujarat"
];


/* ============================
   API BASE
============================ */
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://agri-insight-sgui.onrender.com/api";

const API = `${API_BASE}/market`;

let chart;

/* ============================
   DOM REFERENCES
============================ */
const stateSelect = document.getElementById("state");
const cropSelect = document.getElementById("crop");
const sortSelect = document.getElementById("sort");
const insights = document.getElementById("insights");
const marketTableBody = document.querySelector("#marketTable tbody");
const marketChart = document.getElementById("marketChart");

/* ============================
   INIT (LIKE WEATHER PAGE)
============================ */
window.onload = () => {
  try {
    // Populate crops
  POPULAR_CROPS.forEach((crop) => {
    const opt = document.createElement("option");
    opt.value = crop;
    opt.textContent = crop;
    cropSelect.appendChild(opt);
  });

  // Populate states
  POPULAR_STATES.forEach((state) => {
    const opt = document.createElement("option");
    opt.value = state;
    opt.textContent = state;
    stateSelect.appendChild(opt);
  });

  } catch (err) {
    console.error("Meta load failed:", err);
    insights.innerHTML = "Unable to load crop/state list.";
  }
};

/* ============================
   HELPERS
============================ */
function shortLabel(name) {
  if (name.length <= 30) return name;
  return name.slice(0, 27) + "…";
  
}



function sortPrices(prices, order) {
  return prices.sort((a, b) =>
    order === "desc"
      ? b.modal_price - a.modal_price
      : a.modal_price - b.modal_price
  );
}

/* ============================
   LOAD MARKET DATA
============================ */
async function loadMarket() {
  const state = stateSelect.value;
  const crop = cropSelect.value;
  const sortOrder = sortSelect.value;

  if (!crop) {
    insights.innerHTML = "Please select a crop.";
    return;
  }

  insights.innerHTML = "Loading market data...";
  marketTableBody.innerHTML = "";

  let data;
  try {
    const res = await fetch(
      `${API}?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}`
    );
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    insights.innerHTML = "Unable to fetch market data.";
    return;
  }

  /* ---------- FALLBACK ---------- */
  if (data.status !== "OK") {
    insights.innerHTML = `
      ⚠️ No fresh ${crop} price data for ${state}. 
      Showing last reported prices.
    `;

    const prices =
  data.prices && data.prices.length > 0
    ? data.prices
    : data.fallback_prices || [];

if (prices.length === 0) {
  marketTableBody.innerHTML =
    "<tr><td colspan='4'>No historical data available</td></tr>";
  return;
}

const sorted = sortPrices(prices, sortOrder);
renderTable(sorted);
renderChart(sorted, "rgba(245,158,11,0.7)", state);
return;
  }

  /* ---------- LIVE DATA ---------- */
  const prices = sortPrices([...data.prices], sortOrder);

  insights.innerHTML = `
  <button
    id="speakMarket"
    style="float:right; padding:6px; cursor:pointer;"
  >
    🔊 Speak Insight
  </button>

  ${generateMarketInsight(prices, crop, state)}
`;

document.getElementById("speakMarket").onclick = () => {
  const msg = new SpeechSynthesisUtterance(
    generateMarketInsight(prices, crop, state)
      .replace(/<[^>]+>/g, "")
  );
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
};

renderTable(prices);
renderChart(prices, "rgba(54,162,235,0.7)", state);

}

/* ============================
   RENDER TABLE
============================ */
function renderTable(prices) {
  marketTableBody.innerHTML = "";

  prices.forEach((p) => {
    marketTableBody.innerHTML += `
      <tr>
        <td>${p.market}</td>
        <td>${p.district}</td>
        <td>${p.state || p.state_name || stateSelect.value}</td>
        <td>₹${p.modal_price}</td>
      </tr>
    `;
  });
}


/* ============================
   RENDER CHART
   (AP/UP FIX)
============================ */
function renderChart(prices, color, state) {
  if (chart) chart.destroy();

  chart = new Chart(marketChart, {
    type: "bar",
    data: {
      labels: prices.map((p) =>
        state === "ALL"
          ? shortLabel(`${p.market} (${p.state})`)
          : shortLabel(p.market)
      ),
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
      plugins: { legend: { display: false } },
    },
  });
}

function generateMarketInsight(prices, crop, state) {
  const max = prices[0];
  const min = prices[prices.length - 1];
  const avg =
    prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length;

  return `
    <p><b>Crop:</b> ${crop}</p>
    <p><b>State:</b> ${state}</p>
    <p><b>Highest price:</b> ₹${max.modal_price} at ${max.market}</p>
    <p><b>Lowest price:</b> ₹${min.modal_price} at ${min.market}</p>
    <p><b>Average price:</b> ₹${Math.round(avg)}</p>
    <p><b>Suggestion:</b> ${
      max.modal_price > avg
        ? "Prices are favorable in select markets. Consider selling."
        : "Prices are moderate. Monitor before selling."
    }</p>
  `;
}

document.getElementById("speakMarket")?.addEventListener("click", () => {
  const text = insights.innerText;
  const msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
});

