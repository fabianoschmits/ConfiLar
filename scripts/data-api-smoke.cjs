// Browser-equivalent reads and temporary uploads removed in finally blocks.
// Test credentials come from temporary environment variables.
require("dotenv").config({ quiet: true });
const { createClient } = require("@supabase/supabase-js");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
async function main() {
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
  );
  const guest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options,
  );
  const login = await client.auth.signInWithPassword({
    email: process.env.AUDIT_EMAIL,
    password: process.env.AUDIT_PASSWORD,
  });
  assert.equal(login.error, null, "Login failed");
  const uid = login.data.user.id;
  for (const [name, query] of [
    [
      "Public classifieds",
      guest
        .from("classified_ads")
        .select("id,title,likes_count,comments_count")
        .eq("is_active", true)
        .limit(1),
    ],
    [
      "Comment/profile relationship",
      client
        .from("classified_ad_comments")
        .select(
          "id,content,author:profiles!classified_ad_comments_user_id_fkey(id,full_name,avatar_url)",
        )
        .limit(1),
    ],
    [
      "Own notifications",
      client
        .from("notifications")
        .select("id,is_read")
        .eq("user_id", uid)
        .limit(1),
    ],
    [
      "Public profile excludes migrated private fields",
      client
        .from("profiles")
        .select("id,cpf_cnpj,birth_date,selfie_document_url")
        .eq("id", uid)
        .single(),
    ],
    [
      "Own private details RPC",
      client.rpc("get_private_profile", { p_user_id: uid }),
    ],
    [
      "Visible feed",
      client.from("feed_posts").select("id,title,is_public").limit(1),
    ],
    [
      "Conversation membership",
      client
        .from("conversation_participants")
        .select("conversation_id,profile_id")
        .limit(1),
    ],
  ]) {
    const result = await query;
    if (result.error) throw new Error(`${name}: ${result.error.code}`);
    if (name.startsWith("Public profile")) {
      for (const key of ["cpf_cnpj", "birth_date", "selfie_document_url"])
        assert.equal(result.data[key], null);
    }
    console.log(`${name}: passed`);
  }
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=",
    "base64",
  );
  for (const [bucket, path] of [
    ["avatars", `${uid}/audit-${randomUUID()}.png`],
    ["feed-images", `feed/${uid}/audit-${randomUUID()}.png`],
  ]) {
    let uploaded = false;
    try {
      const own = await client.storage
        .from(bucket)
        .upload(path, image, { contentType: "image/png" });
      if (own.error) throw new Error(`${bucket}: own upload failed`);
      uploaded = true;
      const wrongPath = path.replace(uid, randomUUID());
      const spoof = await client.storage
        .from(bucket)
        .upload(wrongPath, image, { contentType: "image/png" });
      if (!spoof.error) {
        await client.storage.from(bucket).remove([wrongPath]);
        throw new Error(`${bucket}: wrong-owner upload accepted`);
      }
      const overwrite = await guest.storage
        .from(bucket)
        .update(path, image, { contentType: "image/png" });
      assert.ok(overwrite.error, `${bucket}: anonymous overwrite accepted`);
      console.log(
        `${bucket}: own upload allowed; wrong owner/guest overwrite denied`,
      );
    } finally {
      if (uploaded) {
        const cleanup = await client.storage.from(bucket).remove([path]);
        if (cleanup.error || !cleanup.data?.length)
          throw new Error(`${bucket}: temporary fixture cleanup failed`);
        console.log(`${bucket}: temporary test image removed`);
      }
    }
  }
  await client.auth.signOut({ scope: "local" });
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
