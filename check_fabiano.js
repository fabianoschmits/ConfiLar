const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFabiano() {
  console.log("--- Verificando Fabiano Schmitss ---");

  // 1. Buscar ID do usuário pelo nome
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, verification_status")
    .ilike("full_name", "%Fabiano Schmitss%");

  if (!profiles || profiles.length === 0) {
    console.log("Usuário não encontrado.");
    return;
  }

  const user = profiles[0];
  console.log("PERFIL:", user);

  // 2. Buscar verificações deste ID
  const { data: verifications } = await supabase
    .from("professional_verifications")
    .select("id, status, created_at, updated_at")
    .eq("user_id", user.id);

  console.log("VERIFICAÇÕES NO BANCO:", verifications);

  // 3. Análise
  if (user.verification_status === "approved") {
    const pendingVer = verifications?.find((v) => v.status === "pending");
    if (pendingVer) {
      console.log("\n❌ INCONSISTÊNCIA DETECTADA:");
      console.log(
        `O perfil está APROVADO, mas existe um registro de verificação PENDENTE (ID: ${pendingVer.id}).`,
      );
      console.log(
        "Isso faz com que o admin veja como pendente, mesmo o usuário já tendo a badge.",
      );
    } else {
      console.log("\n✅ Dados consistentes (ou sem verificações pendentes).");
    }
  }
}

checkFabiano();
