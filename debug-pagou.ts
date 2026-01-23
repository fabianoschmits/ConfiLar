import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";

const domains = [
  "https://api.pagou.ai", // Current hypothesis
  "https://api.pagou.com.br", // Original hypothesis
  "https://sandbox-api.pagou.ai", // Sandbox
];

const paths = [
  "/payments",
  "/v1/payments",
  "/api/payments",
  "/api/v1/payments",
  "/pix/cash-in",
  "/v1/pix/cash-in",
];

async function probe() {
  console.log("🔍 Deep Probing Pagou.ai...");

  for (const domain of domains) {
    console.log(`\n--- Checking Domain: ${domain} ---`);
    for (const path of paths) {
      const url = `${domain}${path}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "User-Agent": "ConfiLar/1.0",
          },
          body: JSON.stringify({
            amount: 1000,
            method: "PIX",
            external_id: "debug_probe_" + Date.now().toString(),
            description: "Debug Probe",
          }),
        });

        console.log(`[${response.status}] ${url}`);
        const text = await response.text();
        // Print detail if it's strictly interesting or small enough
        if (text.length < 500) console.log(`Response: ${text}`);

        if (response.status === 200 || response.status === 201) {
          console.log("🎉 SUCCESS FOUND!!!");
          process.exit(0);
        }
      } catch (e) {
        console.log(`[ERR] ${url}: ${e.message}`);
      }
    }
  }
}

probe();
