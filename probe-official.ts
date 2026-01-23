import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";
const HOST = "https://api.pagou.ai";
const ENDPOINT = "/pix/v1/payment";

const headers = [
  { name: "apiKey", val: API_KEY },
  { name: "ApiKey", val: API_KEY },
  { name: "X-API-KEY", val: API_KEY },
  { name: "x-api-key", val: API_KEY },
  { name: "Authorization", val: API_KEY },
  { name: "Authorization", val: `Bearer ${API_KEY}` },
];

async function probe() {
  console.log(`🕵️ Targeted Probe on ${HOST}${ENDPOINT}...`);

  for (const h of headers) {
    try {
      const res = await fetch(`${HOST}${ENDPOINT}`, {
        method: "POST",
        headers: {
          [h.name]: h.val,
          "Content-Type": "application/json",
          "User-Agent": "ConfiLar/1.0",
        },
        body: JSON.stringify({
          type: "PIX",
          transaction: {
            value: 10.0,
            description: "Probe",
            externalId: "probe-" + Date.now(),
            expirationTime: 3600,
          },
          payer: {
            fullName: "Fabiano Test",
            document: "02494171032",
            contact: {
              phone: "11999999999",
              mail: "test@example.com",
            },
          },
        }),
      });

      console.log(`[${h.name}: ${h.val.substring(0, 10)}...] -> ${res.status}`);
      const text = await res.text();
      if (res.status === 200 || res.status === 201) {
        console.log("🎉 SUCCESS!");
        console.log(text);
        return;
      } else {
        console.log(`   Response: ${text}`);
      }
    } catch (e: any) {
      console.log(`[${h.name}] -> ERROR: ${e.message}`);
    }
  }
}

probe();
