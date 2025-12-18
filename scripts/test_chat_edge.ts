import dotenv from 'dotenv';
import path from 'path';

// Load ENV from ingestion package
const envPath = path.resolve(process.cwd(), 'packages/ingestion/.env');
dotenv.config({ path: envPath });

// Use CHAT_EDGE_URL from env or fallback to local
const FUNCTION_URL = process.env.CHAT_EDGE_URL || "http://127.0.0.1:54321/functions/v1/chat";

async function testChat() {
  console.log(`🚀 Testing Chat Edge Function at: ${FUNCTION_URL}`);

  // Payload
  const payload = {
    exam_id: "diritto-privato",
    question: "Cos’è la capacità di agire?",
    k: 8,
    threshold: 0.35,
    debug: true
  };

  console.log("Request Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass Auth if needed
        "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    console.log(`\nHTTP Status: ${status}`);

    if (status !== 200) {
      console.error("❌ Failed: Status is not 200");
      const text = await response.text();
      console.error("Response:", text);
      process.exit(1);
    }

    const data = await response.json() as any;
    console.log("Response Data:", JSON.stringify(data, null, 2));

    // Strict Assertions
    if (!data.answer) {
      console.error("❌ Failed: No 'answer' field in response.");
      process.exit(1);
    }

    const citations = data.citations || [];
    console.log(`\nCitations Found: ${citations.length}`);

    if (citations.length > 0) {
      console.log("✅ Citations present.");
      citations.forEach((c: any, i: number) => {
        const sim = c.similarity ? Number(c.similarity).toFixed(4) : "N/A";
        console.log(`   [${i}] ${c.source_title} (${sim}) URL: ${c.source_url}`);

        // Strict Metadata Check
        if (!c.source_title || c.source_title === "Unknown Source") {
          console.error(`❌ Failed: Citation [${i}] has invalid title 'Unknown Source'.`);
          process.exit(1);
        }
        // Check URL for known public sources
        if (c.source_title.toLowerCase().includes("treccani") || c.source_title.toLowerCase().includes("normattiva") || c.source_title.toLowerCase().includes("dispensa")) {
          if (!c.source_url) {
            console.error(`❌ Failed: Citation [${i}] (${c.source_title}) match known public source but missing URL.`);
            process.exit(1);
          }
        }
      });
    } else {
      console.log("⚠️ No citations found. Checking if refusal message is correct...");
      const answerLower = data.answer.toLowerCase();
      // Valid Refusal logic
      if (answerLower.includes("non ho abbastanza") || answerLower.includes("fonti pubbliche")) {
        console.log("✅ Refusal message confirmed.");
      } else {
        console.error("❌ Failed: No citations and no refusal message.");
        process.exit(1); // Fail strict
      }
    }

    console.log("\n✅ TEST PASSED");

  } catch (e) {
    console.error("❌ Exception during test:", e);
    process.exit(1);
  }
}

testChat();
