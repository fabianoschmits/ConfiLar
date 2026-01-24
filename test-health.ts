import fetch from "node-fetch";
require("dotenv").config();

const API_KEY =
  process.env.PAGOUAI_SECRET_KEY ||
  "sk_live_v2m5BU09YLJT0qpI1Wlk3ZY0ffNcebOZkgNXXmH6MP";
const URL_V1 = "https://api.pagou.ai/v1/health-check";
const URL_V2 = "https://api.pagou.ai/v2/health-check";

async function checkHealth(url: string, label: string) {
  console.log(`\n🧪 Testing Health Check (${label}): ${url}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apiKey: API_KEY,
        Accept: "application/json",
      },
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (res.ok && data.status === "RUNNING") {
      console.log(`✅ ${label} is UP and keys are working!`);
    } else {
      console.log(`❌ ${label} check failed or keys unauthorized.`);
    }
  } catch (e: any) {
    console.log(`🔥 Error connecting to ${label}: ${e.message}`);
  }
}

async function run() {
  await checkHealth(URL_V1, "V1");
  await checkHealth(URL_V2, "V2");
}

run();
