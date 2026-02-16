const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBadgeStatus() {
  console.log("--- Verificando Status de Badge (Debug) ---");

  const { data: verifications } = await supabase
    .from("professional_verifications")
    .select("user_id, status, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (!verifications || verifications.length === 0) {
    console.log("Nenhuma verificação aprovada recentemente.");
    return;
  }

  for (const v of verifications) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, is_verified, user_type")
      .eq("id", v.user_id)
      .single();

    if (profile) {
      console.log(`User: ${profile.full_name}`);
      console.log(`Type: ${profile.user_type}`);
      console.log(`is_verified (RAW):`, profile.is_verified);
      console.log(`is_verified (TYPE):`, typeof profile.is_verified);

      if (profile.is_verified === true) {
        console.log("✅ Status OK");
      } else {
        console.log("❌ Status NOK");
      }
      console.log("---");
    }
  }
}

checkBadgeStatus();
