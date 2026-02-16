const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://oolqodaehouaidxuowtw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
  console.log("--- ALL VERIFICATIONS ---");
  const { data: verifications } = await supabase
    .from("professional_verifications")
    .select("status, profiles(full_name, user_type)");

  if (verifications) {
    verifications.forEach((v) => {
      console.log(
        `[${v.status}] ${v.profiles?.full_name} (${v.profiles?.user_type})`,
      );
    });
  } else {
    console.log("No verifications found.");
  }
}

listAll();
