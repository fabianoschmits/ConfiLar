const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrphans() {
  console.log("--- CORREÇÃO DE ORFÃOS ---");

  // 1. Identificar órfãos
  const { data: verifications } = await supabase
    .from("professional_verifications")
    .select("user_id");

  const verifiedUserIds = new Set(verifications?.map((v) => v.user_id) || []);

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, user_type")
    .eq("verification_status", "pending");

  const orphans =
    pendingProfiles?.filter((p) => !verifiedUserIds.has(p.id)) || [];

  console.log(`Encontrados ${orphans.length} usuários travados.`);

  if (orphans.length === 0) {
    console.log("Nenhum usuário precisa de correção.");
    return;
  }

  // 2. Corrigir status para 'not_started'
  const orphanIds = orphans.map((o) => o.id);
  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "not_started" })
    .in("id", orphanIds);

  if (error) {
    console.error("Erro ao corrigir:", error);
  } else {
    console.log(
      '✅ Sucesso! Status resetado para "not_started" nos seguintes usuários:',
    );
    console.table(
      orphans.map((o) => ({ Name: o.full_name, Type: o.user_type })),
    );
    console.log(
      "\nAgora basta acessar essas contas e enviar os documentos novamente. O RLS já foi corrigido.",
    );
  }
}

fixOrphans();
