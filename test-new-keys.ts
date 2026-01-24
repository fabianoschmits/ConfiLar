import fetch from "node-fetch";

const API_KEY = "sk_live_v2m5BU09YLJT0qpI1Wlk3ZY0ffNcebOZkgNXXmH6MP";
const URL = "https://api.pagou.ai/pix/v1/payment";

async function finalTest() {
  console.log("🧪 Testing NEW API KEYS (John Marvin Spec)...");

  const body = {
    type: "PIX",
    transaction: {
      value: 1.15,
      description: "Teste Chaves Novas",
      externalId: crypto.randomUUID(),
      expirationTime: 300,
    },
    payer: {
      fullName: "John Marvin",
      document: "12312312387",
      contact: {
        phone: "11999887766",
        mail: "john.marvin@mail.com",
      },
    },
  };

  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

finalTest();
