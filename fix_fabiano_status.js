const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncFabiano() {
  console.log("--- Sincronizando Fabiano Schmitss ---");

  // Buscar ID
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .ilike("full_name", "%Fabiano Schmitss%");

  const userId = profiles?.[0]?.id;
  if (!userId) return console.log("User not found");

  // Atualizar para APPROVED
  const { error } = await supabase
    .from("professional_verifications")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Erro ao atualizar:", error);
  } else {
    console.log('✅ Registro de verificação atualizado para "approved".');
    console.log('Agora deve aparecer na aba "Aprovados" do Admin.');
  }
}

syncFabiano();
