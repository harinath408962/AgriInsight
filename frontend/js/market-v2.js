const API = "http://localhost:5000/api/market";

let chart;

// DOM references
const stateSelect = document.getElementById("state");
const cropSelect = document.getElementById("crop");
const sortSelect = document.getElementById("sort");
const insights = document.getElementById("insights");
const marketTableBody = document.querySelector("#marketTable tbody");
const marketChart = document.getElementById("marketChart");

// Utility: shorten long mandi names
function shortLabel(name) {
  return name.length > 20 ? name.slice(0, 20) + "…" : name;
}

// ✅ SORT HELPER (single source of truth)
function sortPrices(prices, sortOrder) {
  return prices.sort((a, b) =>
    sortOrder === "desc"
      ? b.modal_price - a.modal_price
      : a.modal_price - b.modal_price
  );
}

async function loadMarket() {
  const state = stateSelect.value;
  const crop = cropSelect.value;
  const sortOrder = sortSelect.value;

  insights.innerHTML = "<p>Loading market data…</p>";
  marketTableBody.innerHTML = "";

  let res, data;

  try {
    res = await fetch(`${API}?state=${state}&crop=${crop}`);
    if (!res.ok) throw new Error("Server error");
    data = await res.json();
  } catch (err) {
    insights.innerHTML = "<p>Server error while fetching market data</p>";
    return;
  }

  /* ===============================
     🔁 FALLBACK DATA PATH
     =============================== */
  if (data.status !== "OK") {
    const fallbackRes = await fetch(
      `http://localhost:5000/api/market/fallback?state=${state}&crop=${crop}`
    );
    const fallback = await fallbackRes.json();

    let prices = fallback.prices || [];

    insights.innerHTML = `
      <p style="color:#b45309;">
        ⚠️ No fresh ${crop} price data for ${state} today.
        Showing <b>last reported prices</b>.
      </p>
      <p><b>Last reported date:</b> ${fallback.latest_date || "Unknown"}</p>
    `;

    if (prices.length === 0) {
      marketTableBody.innerHTML =
        "<tr><td colspan='3'>No historical data available</td></tr>";
      if (chart) chart.destroy();
      return;
    }

    // ✅ APPLY SORT (THIS WAS MISSING)
    prices = sortPrices(prices, sortOrder);

    // TABLE
    prices.forEach((p) => {
      marketTableBody.innerHTML += `
        <tr>
          <td>${p.market}</td>
          <td>${p.district}</td>
          <td>₹${p.modal_price}</td>
        </tr>
      `;
    });

    // CHART
    if (chart) chart.destroy();
    chart = new Chart(marketChart, {
      type: "bar",
      data: {
        labels: prices.map((p) => shortLabel(p.market)),
        datasets: [
          {
            label: "Modal Price (₹)",
            data: prices.map((p) => p.modal_price),
            backgroundColor: "rgba(245, 158, 11, 0.7)", // fallback color
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

    return;
  }

  /* ===============================
     ✅ FRESH DATA PATH
     =============================== */
  let prices = [...data.prices];

  // ✅ SORT (already correct)
  prices = sortPrices(prices, sortOrder);

  // INSIGHTS
  const topMandis = prices.slice(0, 3);
  const bottomMandis = prices.slice(-3);

  insights.innerHTML = `
    <p><b>Data date:</b> ${data.latest_date}</p>
    <p><b>Trend:</b> ${data.trend.direction} (${data.trend.percent_change}%)</p>
    <p><b>Top mandis:</b> ${topMandis
      .map((p) => `${p.market} (₹${p.modal_price})`)
      .join(", ")}</p>
    <p><b>Lowest mandis:</b> ${bottomMandis
      .map((p) => `${p.market} (₹${p.modal_price})`)
      .join(", ")}</p>
  `;

  // TABLE
  prices.forEach((p) => {
    marketTableBody.innerHTML += `
      <tr>
        <td>${p.market}</td>
        <td>${p.district}</td>
        <td>₹${p.modal_price}</td>
      </tr>
    `;
  });

  // CHART
  if (chart) chart.destroy();
  chart = new Chart(marketChart, {
    type: "bar",
    data: {
      labels: prices.map((p) => shortLabel(p.market)),
      datasets: [
        {
          label: "Modal Price (₹)",
          data: prices.map((p) => p.modal_price),
          backgroundColor: "rgba(54,162,235,0.7)",
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
