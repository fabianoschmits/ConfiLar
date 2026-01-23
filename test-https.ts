import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLNB3xQaOUCPNibrcUDLoqjTwcC7N08wjs";
const HOST = "https://api.pagou.ai";
const ENDPOINT = "/pix/v1/payment";

async function probe() {
  console.log(`🕵️ Testing with HTTPS webhook...`);

  try {
    const res = await fetch(`${HOST}${ENDPOINT}`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "ConfiLar/1.0",
      },
      body: JSON.stringify({
        type: "PIX",
        transaction: {
          value: 10.0,
          description: "HTTPS Test",
          externalId: "test-" + Date.now(),
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
        // Use a valid HTTPS URL instead of localhost
        notificationUrl: "https://confilar.com.br/api/payment/pagouai/webhook",
      }),
    });

    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

probe();
