async function loadSummary() {
  try {
    const response = await fetch(
      `${API_BASE}/insight?city=Bengaluru&state=Karnataka&crop=Tomato`
    );
    const data = await response.json();

    const summaryDiv = document.getElementById("summary");
    if (!summaryDiv) {
      console.error("summary div not found");
      return;
    }

    summaryDiv.innerHTML = `
      <div>Weather Risk: <b>${data.summary.weather_risk}</b></div>
      <div>Market Stability: <b>${data.summary.market_stability}</b></div>
      <div>Best Mandi: <b>${data.summary.best_mandi}</b></div>
      <div>Price Gap: <b>₹${data.summary.price_gap}</b></div>
    `;
  } catch (error) {
    console.error("Summary error:", error);
  }
}
