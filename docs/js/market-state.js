const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://agri-insight-sgui.onrender.com/api";

const STATE_API = `${API_BASE}/market/state-overview`;

const STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Uttar Pradesh",
  "Gujarat"
];

const stateSelect = document.getElementById("state");
const summaryDiv = document.getElementById("summary");
const top10Div = document.getElementById("top10");
const tableBody = document.getElementById("overviewTable");

window.onload = () => {
  STATES.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSelect.appendChild(opt);
  });
};

async function loadStateOverview() {
  const state = stateSelect.value;

  summaryDiv.innerHTML = "Loading data...";
  top10Div.innerHTML = "";
  tableBody.innerHTML = "";

  try {
    const res = await fetch(
      `${STATE_API}?state=${encodeURIComponent(state)}`
    );
    const data = await res.json();

    if (data.status !== "OK") {
      summaryDiv.innerHTML = "No market data available today.";
      return;
    }

    renderSummary(data);
    renderTop10(data.overview);
    renderTable(data.overview);
  } catch (err) {
    summaryDiv.innerHTML = "Unable to load data.";
    console.error(err);
  }
}

function renderSummary(data) {
  summaryDiv.innerHTML = `
    <b>State:</b> ${data.state}<br>
    <b>Date:</b> ${data.latest_date}<br>
    <b>Total crops available:</b> ${data.total_crops}<br>
    <b>Total markets reporting:</b> ${data.total_markets}
  `;
}

function renderTop10(overview) {
  const top10 = [...overview]
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 10);

  top10.forEach((c) => {
    top10Div.innerHTML += `
      <div class="crop-card">
        <b>${c.crop}</b><br>
        Avg: ₹${c.avg_price}<br>
        High: ₹${c.max_price}<br>
        Low: ₹${c.min_price}<br>
        Markets: ${c.markets_count}
      </div>
    `;
  });
}

function renderTop10(overview) {
  const top10 = [...overview]
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 10);

  top10.forEach((c) => {
    top10Div.innerHTML += `
      <div class="crop-card">
        <b>${c.crop}</b><br>
        Avg: ₹${c.avg_price}<br>
        High: ₹${c.max_price}<br>
        Low: ₹${c.min_price}<br>
        Markets: ${c.markets_count}
      </div>
    `;
  });
}

function renderTable(overview) {
  overview
    .sort((a, b) => b.avg_price - a.avg_price)
    .forEach((c) => {
      tableBody.innerHTML += `
        <tr>
          <td>${c.crop}</td>
          <td>₹${c.avg_price}</td>
          <td>${c.max_market}</td>
          <td>${c.min_market}</td>
          <td>${c.markets_count}</td>
        </tr>
      `;
    });
}
