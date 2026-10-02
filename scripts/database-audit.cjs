// Management SQL stays limited to saved SQL files; credentials never reach logs.
require("dotenv").config({ quiet: true });
const fs = require("node:fs");
async function main() {
  const query = fs.readFileSync(process.argv[2], "utf8");
  const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  if (!/^[a-z0-9]+\.supabase\.co$/.test(hostname))
    throw new Error("Invalid project URL");
  const ref = hostname.split(".")[0];
  if (!process.env.SUPABASE_ACCESS_TOKEN)
    throw new Error("Management token missing");
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(60000),
    },
  );
  const result = await response.json();
  if (!response.ok) {
    console.error(
      JSON.stringify({
        status: response.status,
        message: result.message || "SQL failed",
      }),
    );
    process.exitCode = 1;
    return;
  }
  if (process.argv[3] === "summary" && result[0]?.audit) {
    const a = result[0].audit;
    console.log(
      JSON.stringify(
        {
          tables: a.tables.length,
          withoutRls: a.tables.filter((t) => !t.rls),
          views: a.views,
          unrestrictedClientWrites: (
            a.unrestricted_write_policies || []
          ).filter((p) => !p.roles.every((r) => r === "service_role")),
          unsafeDefiners: a.definer_functions_without_search_path || [],
        },
        null,
        2,
      ),
    );
  } else if (process.argv[3] && result[0]?.audit) {
    console.log(
      JSON.stringify(
        result[0].audit.policies.filter((p) =>
          process.argv[3].split(",").includes(p.table),
        ),
        null,
        2,
      ),
    );
  } else console.log(JSON.stringify(result, null, 2));
}
main().catch(() => {
  console.error("Database audit failed; check configuration and SQL file");
  process.exitCode = 1;
});
