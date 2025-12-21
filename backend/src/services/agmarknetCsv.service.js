const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const csv = require("csv-parser");

// Location to store parsed data
const DATA_DIR = path.join(__dirname, "../../data/agmarknet");
const DATA_FILE = path.join(DATA_DIR, "prices.json");

// AGMARKNET official CSV export endpoint (daily)
const AGMARKNET_CSV_URL =
  "https://agmarknet.gov.in/PriceAndArrivals/Datewise_CSV.aspx";

// Utility: get today date in DD-MMM-YYYY
// function getTodayDate() {
//   const date = new Date();
//   return date
//     .toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     })
//     .replace(/ /g, "-");
// }

function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
}

// Fetch & parse CSV
async function fetchAgmarknetDailyCSV() {
  await fs.ensureDir(DATA_DIR);

  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    console.log("Trying AGMARKNET CSV for:", formattedDate);

    try {
      const response = await axios.get(AGMARKNET_CSV_URL, {
        responseType: "stream",
        params: { date: formattedDate },
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/csv",
        },
      });

      const results = [];

      await new Promise((resolve, reject) => {
        response.data
          .pipe(csv())
          .on("data", (row) => {
            if (!row.Commodity || !row.State) return;

            results.push({
              state: row.State.trim(),
              district: row.District?.trim(),
              market: row.Market?.trim(),
              commodity: row.Commodity.trim(),
              variety: row.Variety?.trim(),
              arrival_date: row.Arrival_Date,
              min_price: Number(row.Min_Price) || null,
              max_price: Number(row.Max_Price) || null,
              modal_price: Number(row.Modal_Price) || null,
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });

      if (results.length > 0) {
        const output = {
          source: "AGMARKNET (Govt of India)",
          fetched_on: new Date().toISOString(),
          data_date: formattedDate,
          records: results,
        };

        await fs.writeJson(DATA_FILE, output, { spaces: 2 });

        console.log(
          "AGMARKNET data FOUND for",
          formattedDate,
          "-",
          results.length,
          "records"
        );

        return output;
      }

      console.log("No data for", formattedDate);
    } catch (err) {
      console.log("Failed for date:", formattedDate);
    }
  }

  throw new Error("No AGMARKNET data found in last 7 days");
}

module.exports = { fetchAgmarknetDailyCSV };
