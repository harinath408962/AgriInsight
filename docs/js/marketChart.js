async function loadMarketChart() {
  try {
    const response = await fetch(
      `${API_BASE}/market?state=Karnataka&crop=Tomato`
    );
    const data = await response.json();

    const labels = data.graph_data.price_comparison.labels;
    const values = data.graph_data.price_comparison.values;

    const canvas = document.getElementById("marketChart");
    if (!canvas) {
      console.error("marketChart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Modal Price (Rs/quintal)",
            data: values,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  } catch (error) {
    console.error("Market chart error:", error);
  }
}
