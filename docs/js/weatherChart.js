async function loadWeatherChart() {
  try {
    const response = await fetch(`${API_BASE}/weather?city=Bengaluru`);
    const data = await response.json();

    const labels = data.graph_data.factors.labels;
    const values = data.graph_data.factors.values;

    const canvas = document.getElementById("weatherChart");
    if (!canvas) {
      console.error("weatherChart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Weather Factors",
            data: values,
            backgroundColor: "rgba(255, 159, 64, 0.6)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  } catch (error) {
    console.error("Weather chart error:", error);
  }
}
