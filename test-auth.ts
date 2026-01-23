import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";
const BASE_URL = "https://api.pagou.com.br";

const authPatterns = [
  { name: "Bearer", header: { Authorization: `Bearer ${API_KEY}` } },
  {
    name: "Basic",
    header: {
      Authorization: `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`,
    },
  },
  { name: "Raw Auth", header: { Authorization: API_KEY } },
  { name: "X-API-KEY", header: { "X-API-KEY": API_KEY } },
  { name: "apikey", header: { apikey: API_KEY } },
];

async function test() {
  console.log("🕵️ Testing Auth Patterns...");

  for (const pattern of authPatterns) {
    console.log(`\n--- Testing: ${pattern.name} ---`);
    try {
      // Test 1: POST /v1/pix
      const res = await fetch(`${BASE_URL}/v1/pix`, {
        method: "POST",
        headers: {
          ...pattern.header,
          "Content-Type": "application/json",
          "User-Agent": "ConfiLar/1.0",
        },
        body: JSON.stringify({
          amount: 1000,
          description: "Auth Test",
          external_id: "auth_probe_" + Date.now(),
        }),
      });
      console.log(`POST /v1/pix -> ${res.status}`);
      if (res.status !== 401) {
        console.log(
          `✅ SUCCESS! Pattern '${pattern.name}' worked on POST! (Status: ${res.status})`,
        );
        const text = await res.text();
        console.log("Response:", text);
        return;
      }

      // Test 2: GET /customers (Known endpoint from Swagger)
      // Some keys might only work for specific scopes, but Auth failure is usually global.
      /*
            const res2 = await fetch(`${BASE_URL}/customers`, {
                method: "GET",
                headers: {
                     ...pattern.header,
                    "User-Agent": "ConfiLar/1.0"
                }
            });
            console.log(`GET /customers -> ${res2.status}`);
            if (res2.status === 200) {
                 console.log(`✅ SUCCESS! Pattern '${pattern.name}' worked on GET!`);
                 return;
            }
            */
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
  console.log("\n❌ All patterns failed with 401.");
}

test();
