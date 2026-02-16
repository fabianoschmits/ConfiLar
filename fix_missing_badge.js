const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMissingBadges() {
  console.log("--- Corrigindo Badges Faltantes ---");

  // 1. Buscar verificações APROVADAS
  const { data: verifications } = await supabase
    .from("professional_verifications")
    .select("user_id, status")
    .eq("status", "approved");

  if (!verifications || verifications.length === 0) {
    console.log("Nenhuma verificação aprovada encontrada.");
    return;
  }

  let fixedCount = 0;

  for (const v of verifications) {
    // 2. Verificar perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, is_verified, verification_status")
      .eq("id", v.user_id)
      .single();

    if (profile) {
      // Se não estiver verificado OU status não estiver 'approved'
      if (!profile.is_verified || profile.verification_status !== "approved") {
        console.log(`Corrigindo usuário: ${profile.full_name} (${profile.id})`);

        const { error } = await supabase
          .from("profiles")
          .update({
            is_verified: true,
            verification_status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (error) {
          console.error("Erro ao atualizar perfil:", error);
        } else {
          console.log("✅ Badge concedido com sucesso!");
          fixedCount++;
        }
      }
    }
  }

  console.log(`\nProcesso finalizado. Total corrigido: ${fixedCount}`);
}

fixMissingBadges();
