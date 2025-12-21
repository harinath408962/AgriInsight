require("dotenv").config(); // MUST be first

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ AgriInsight Backend running on port ${PORT}`);
});
