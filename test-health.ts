import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";

async function testHealth() {
  console.log("🏥 Testing Pagou.ai Health Check...");

  const urls = [
    "https://api.pagou.ai/v1/health-check",
    "https://api.pagou.ai/pix/v1/health-check",
    "https://api.pagou.ai/health-check",
  ];

  for (const url of urls) {
    console.log(`\n👉 URL: ${url}`);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          apiKey: API_KEY,
          Accept: "application/json",
          "User-Agent": "ConfiLar/1.0",
        },
      });
      console.log(`   Status: ${res.status}`);
      const text = await res.text();
      console.log(`   Response: ${text}`);
    } catch (e: any) {
      console.log(`   Error: ${e.message}`);
    }
  }
}

testHealth();
