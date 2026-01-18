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



function renderTop10(overview) {
  top10Div.innerHTML = "";

  const top10 = [...overview]
    .sort((a, b) => b.avg_price - a.avg_price)
    .slice(0, 10);

  top10.forEach((c) => {
    top10Div.innerHTML += `
      <div class="crop-card">
        <b style="font-size:14px;">${c.crop}</b><br>
        <span style="font-size:15px; font-weight:bold;">₹${c.avg_price}</span>
        <span style="font-size:12px; color:#555;"> avg</span><br>
        <span style="font-size:12px; color:#555;">
          High: ₹${c.max_price} · Low: ₹${c.min_price}
        </span><br>
        <span style="font-size:12px; color:#555;">
          Markets: ${c.markets_count}
        </span>
      </div>
    `;
  });
}



function renderTable(overview) {
  tableBody.innerHTML = "";

  overview
    .sort((a, b) => b.avg_price - a.avg_price)
    .forEach((c) => {
      tableBody.innerHTML += `
        <tr>
          <td><b>${c.crop}</b></td>
          <td><b>₹${c.avg_price}</b></td>
          <td style="color:#555;">${c.max_market}</td>
          <td style="color:#555;">${c.min_market}</td>
          <td>${c.markets_count}</td>
        </tr>
      `;
    });
}

function renderSummary(data) {
  summaryDiv.innerHTML = `
    <button id="speakState"
      style="float:right; padding:6px; cursor:pointer;">
      🔊 Speak Overview
    </button>

    <div style="font-size:14px; line-height:1.6;">
      <b style="font-size:16px;">${data.state} – Market Snapshot</b><br>
      Date: ${data.latest_date}<br>
      Crops available today: <b>${data.total_crops}</b><br>
      Markets reporting: <b>${data.total_markets}</b>
    </div>
  `;

  document.getElementById("speakState").onclick = () => {
    const msg = new SpeechSynthesisUtterance(
      `${data.total_crops} crops are available today in ${data.state}.
       ${data.total_markets} markets are reporting prices.`
    );
    speechSynthesis.cancel();
    speechSynthesis.speak(msg);
  };
}

