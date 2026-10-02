// Live role tests use transactions ending in ROLLBACK: no fixture data persists.
const { spawnSync } = require("node:child_process");
for (const file of [
  "all-table-read",
  "live-rls",
  "social-flows",
  "premium-purchase",
  "private-profile",
  "mobile-purchases",
]) {
  console.log(`Testing ${file} (rolled back)`);
  const result = spawnSync(
    process.execPath,
    ["scripts/database-audit.cjs", `supabase/tests/${file}.sql`],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
