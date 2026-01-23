import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";

async function testBasicAuth() {
  console.log("🏥 Testing Basic Auth on Health Check...");

  const url = "https://api.pagou.ai/v1/health-check";
  const auth = Buffer.from(API_KEY + ":").toString("base64");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "User-Agent": "ConfiLar/1.0",
      },
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

testBasicAuth();
