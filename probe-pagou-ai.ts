import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";
const HOST = "https://api.pagou.ai";

const endpoints = ["/v1/pix", "/api/v1/pix", "/pix", "/v1/payments"];

const headers = [
  { name: "apiKey", val: API_KEY },
  { name: "ApiKey", val: API_KEY },
  { name: "x-api-key", val: API_KEY },
  { name: "Authorization", val: `Bearer ${API_KEY}` },
];

async function probe() {
  console.log(`🕵️ Probing ${HOST}...`);

  for (const ep of endpoints) {
    for (const h of headers) {
      const url = `${HOST}${ep}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            [h.name]: h.val,
            "Content-Type": "application/json",
            "User-Agent": "ConfiLar/1.0",
          },
          body: JSON.stringify({
            amount: 50.0,
            description: "Probe",
            payer: {
              name: "Test",
              document: "02494171032",
            },
          }),
        });

        console.log(`POST ${ep} [${h.name}] -> ${res.status}`);
        if (res.status === 200 || res.status === 201) {
          console.log("🎉 SUCCESS!");
          console.log(await res.text());
          return;
        }
        // If 401, we found the host but auth is wrong.
        // If 404, endpoint is wrong.
        // If 500/502/ENOTFOUND, host is wrong.
        if (res.status === 401) {
          console.log(
            `   (401 confirms Host & Endpoint, fails Auth: ${await res.text()})`,
          );
        }
      } catch (e: any) {
        console.log(`POST ${ep} [${h.name}] -> ERROR: ${e.message}`);
      }
    }
  }
}

probe();
