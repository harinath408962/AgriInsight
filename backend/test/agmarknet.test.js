const { fetchAgmarknetHistory } = require("../src/services/agmarknet.service");

(async () => {
  try {
    const result = await fetchAgmarknetHistory({
      crop: "Tomato",
      state: "Karnataka",
      mandi: "Bengaluru",
      fromDate: "01-Jan-2025",
      toDate: "21-Dec-2025",
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("TEST FAILED:", error.message);
  }
})();
