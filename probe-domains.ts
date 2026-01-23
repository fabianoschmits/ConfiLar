import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";

const combinations = [
  // 1. Pagou.com.br (Legacy?) - X-API-KEY
  {
    url: "https://api.pagou.com.br/v1/pix",
    method: "POST",
    header: { "X-API-KEY": API_KEY },
  },
  {
    url: "https://api.pagou.com.br/v1/pix",
    method: "POST",
    header: { Authorization: `Bearer ${API_KEY}` },
  },

  // 2. Pagou.ai (Newer?) - Bearer
  {
    url: "https://api.pagou.ai/v1/pix",
    method: "POST",
    header: { Authorization: `Bearer ${API_KEY}` },
  },
  {
    url: "https://api.pagou.ai/pix/cash-in",
    method: "POST",
    header: { Authorization: `Bearer ${API_KEY}` },
  },
  {
    url: "https://api.pagou.ai/api/v1/pix",
    method: "POST",
    header: { Authorization: `Bearer ${API_KEY}` },
  },

  // 3. User suggestion (Payments subdomain)
  {
    url: "https://payments.pagou.ai/v1/pix",
    method: "POST",
    header: { Authorization: `Bearer ${API_KEY}` },
  },
];

async function probe() {
  console.log("🕵️ Probing Pagou Domains & Endpoints...");

  for (const combo of combinations) {
    try {
      console.log(
        `\n👉 Testing: ${combo.url} [${Object.keys(combo.header)[0]}]`,
      );
      const res = await fetch(combo.url, {
        method: combo.method,
        headers: {
          ...combo.header,
          "Content-Type": "application/json",
          "User-Agent": "ConfiLar/1.0",
        },
        body: JSON.stringify({
          amount: 50.0, // Float attempts
          description: "Probe",
          payer: {
            name: "Test user",
            document: "02494171032",
          },
        }),
      });

      console.log(`   Status: ${res.status}`);
      const text = await res.text();
      if (text.length < 300) console.log(`   Response: ${text}`);

      if (res.status === 200 || res.status === 201) {
        console.log("🎉 SUCCESS FOUND! This is the correct combination.");
        return;
      }
    } catch (e: any) {
      console.log(`   Error: ${e.message}`);
    }
  }
}

probe();
