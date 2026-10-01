// Apply ONLY this audit's additive migrations to the project configured in .env.
// Requires a management token with database-write permission on that project.
require("dotenv").config({ quiet: true });
const fs = require("node:fs");
const migrations = [
  "supabase/migrations/20261001_add_classified_engagement.sql",
  "supabase/migrations/20261001120000_classified_shares.sql",
];
async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token)
    throw new Error(
      "SUPABASE_ACCESS_TOKEN is required. The service-role Data API key cannot apply SQL migrations.",
    );
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!/^[a-z0-9]+\.supabase\.co$/.test(url.hostname))
    throw new Error("Unrecognized Supabase project URL");
  const ref = url.hostname.split(".")[0];
  // One transaction across both files prevents partial schema installation.
  const query =
    "BEGIN;\n" +
    migrations
      .map((file) =>
        fs.readFileSync(file, "utf8").replace(/^BEGIN;\s*|^COMMIT;\s*/gm, ""),
      )
      .join("\n") +
    "\nCOMMIT;";
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(60000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Migration failed: HTTP ${response.status}. No credentials or response body are logged.`,
    );
  console.log(
    "Migrations applied. Run npm run audit:system to verify the remote schema.",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
