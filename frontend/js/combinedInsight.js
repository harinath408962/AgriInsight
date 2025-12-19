async function loadCombinedInsight() {
  try {
    const response = await fetch(
      `${API_BASE}/insight?city=Bengaluru&state=Karnataka&crop=Tomato`
    );
    const data = await response.json();

    const insightEl = document.getElementById("combinedInsight");
    if (!insightEl) {
      console.error("combinedInsight element not found");
      return;
    }

    insightEl.innerText = data.combined_insight;
  } catch (error) {
    console.error("Combined insight error:", error);
  }
}
