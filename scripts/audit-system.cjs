// Read-only inventory. Never prints credentials or application rows.
require("dotenv").config({ quiet: true });
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory()
      ? files(target)
      : /\.[cm]?[jt]sx?$/.test(target)
        ? [target]
        : [];
  });
}

async function main() {
  const refs = { tables: new Map(), rpcs: new Map() };
  const inventory = files("src");
  const imports = new Set();
  const selections = [];
  const navigation = new Map();
  const routes = inventory
    .filter((file) => /(?:page|route)\.[jt]sx?$/.test(path.basename(file)))
    .map(
      (file) =>
        "/" +
        path
          .relative("src/app", path.dirname(file))
          .split(path.sep)
          .filter(
            (segment) => segment !== "[locale]" && !/^\(.*\)$/.test(segment),
          )
          .join("/"),
    );
  const existsRoute = (target) =>
    routes.some((route) =>
      new RegExp(
        "^" +
          route
            .split("/")
            .map((segment) =>
              segment.startsWith("[...")
                ? ".+"
                : segment.startsWith("[")
                  ? "[^/]+"
                  : segment,
            )
            .join("/") +
          "/?$",
      ).test(target),
    );
  for (const file of files("src")) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    function visit(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteralLike(node.moduleSpecifier)
      ) {
        const spec = node.moduleSpecifier.text;
        const base = spec.startsWith("@/")
          ? path.resolve("src", spec.slice(2))
          : spec.startsWith(".")
            ? path.resolve(path.dirname(file), spec)
            : null;
        if (base)
          for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
            if (fs.existsSync(base + suffix)) {
              imports.add(path.resolve(base + suffix));
              break;
            }
          }
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression)
      ) {
        const method = node.expression.name.text;
        const arg = node.arguments[0];
        if (method === "select" && arg && ts.isStringLiteralLike(arg)) {
          let base = node.expression.expression;
          while (
            ts.isCallExpression(base) &&
            ts.isPropertyAccessExpression(base.expression)
          ) {
            if (
              base.expression.name.text === "from" &&
              ts.isStringLiteralLike(base.arguments[0]) &&
              !/\.storage\b/.test(base.expression.expression.getText(source))
            ) {
              const fields = [];
              let depth = 0;
              let token = "";
              for (const char of arg.text + ",") {
                if (char === "(") depth++;
                if (char === ")") depth--;
                if (char === "," && depth === 0) {
                  if (!token.includes("(")) fields.push(token.trim());
                  token = "";
                } else token += char;
              }
              selections.push({
                table: base.arguments[0].text,
                fields: fields.filter(Boolean),
                file,
              });
              break;
            }
            base = base.expression.expression;
          }
        }
        if (
          (method === "from" || method === "rpc") &&
          !/\.storage\b/.test(node.expression.expression.getText(source)) &&
          arg &&
          ts.isStringLiteralLike(arg)
        ) {
          const map = method === "from" ? refs.tables : refs.rpcs;
          map.set(arg.text, [...(map.get(arg.text) || []), file]);
        }
      }
      if (
        ts.isStringLiteralLike(node) &&
        node.text.startsWith("/") &&
        !node.text.startsWith("//")
      ) {
        const parent = node.parent;
        const context = parent.getText(source);
        if (
          /^(?:href|action_url)\b/.test(context) ||
          (ts.isCallExpression(parent) &&
            /(?:fetch|\.push|\.replace)\(/.test(context))
        ) {
          const target = node.text.split(/[?#]/)[0];
          if (!existsRoute(target))
            navigation.set(target, [...(navigation.get(target) || []), file]);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Missing Supabase environment configuration");
  const response = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw new Error(`Schema inventory failed: HTTP ${response.status}`);
  const schema = await response.json();
  const paths = new Set(Object.keys(schema.paths || {}));
  const missing = (map, prefix) =>
    [...map]
      .filter(([name]) => !paths.has(prefix + name))
      .map(([name, locations]) => ({ name, files: [...new Set(locations)] }));
  console.log(
    JSON.stringify(
      {
        project: new URL(url).hostname,
        sourceFiles: inventory.length,
        tablesReferenced: refs.tables.size,
        rpcsReferenced: refs.rpcs.size,
        missingTables: missing(refs.tables, "/"),
        missingRpcs: missing(refs.rpcs, "/rpc/"),
        unresolvedRoutes: [...navigation]
          .filter(
            ([route]) => !fs.existsSync(path.join("public", route.slice(1))),
          )
          .map(([route, locations]) => ({
            route,
            files: [...new Set(locations)],
          })),
        missingSelectedColumns: selections.flatMap(
          ({ table, fields, file }) => {
            const columns = schema.definitions?.[table]?.properties;
            if (!columns) return [];
            return fields
              .filter((field) => field !== "*" && !field.includes("!"))
              .map((field) => field.split(":").pop().split("->")[0])
              .filter((field) => !columns[field])
              .map((column) => ({ table, column, file }));
          },
        ),
        unreferencedHooks: inventory.filter(
          (file) =>
            file.startsWith("src" + path.sep + "hooks" + path.sep) &&
            !imports.has(path.resolve(file)),
        ),
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
