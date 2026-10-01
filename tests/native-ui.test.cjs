const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

// Compile small UI modules in memory; no generated files or browser dependencies.
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = createRequire(filename);
  const resolve = (name) => {
    if (!name.startsWith("@/")) return localRequire(name);
    const base = "src/" + name.slice(2);
    const file = [base + ".tsx", base + ".ts", base + "/index.ts"].find((f) =>
      fs.existsSync(path.join(root, f)),
    );
    assert.ok(file, "Unresolved project import: " + name);
    return load(file);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  new Function("require", "module", "exports", output)(resolve, module, module.exports);
  return module.exports;
}

const { Button } = load("src/components/ui/button.tsx");
const { Input } = load("src/components/ui/input.tsx");
const { Textarea } = load("src/components/ui/textarea.tsx");
const { PasswordInput } = load("src/components/ui/password-input.tsx");
const { Card, CardHeader, CardTitle, CardContent } = load("src/components/ui/card.tsx");
const { PageHeader } = load("src/components/layout/PageHeader.tsx");
const html = (component, props, children) => renderToStaticMarkup(React.createElement(component, props, children));

test("buttons preserve disabled state, accessible names and native sizing", () => {
  const output = html(Button, { disabled: true, size: "icon", "aria-label": "Buscar" });
  assert.match(output, /disabled=""/);
  assert.match(output, /aria-label="Buscar"/);
  assert.match(output, /data-size="icon"/);
  assert.match(output, /app-button/);
});

test("asChild actions render a single anchor, not a nested button", () => {
  const output = html(Button, { asChild: true }, React.createElement("a", { href: "/buscar" }, "Buscar"));
  assert.match(output, /^<a /);
  assert.match(output, /href="\/buscar"/);
  assert.doesNotMatch(output, /<button/);
});

test("form controls retain their native form attributes", () => {
  const output = html(Input, { id: "email", name: "email", type: "email", required: true, autoComplete: "email" });
  for (const pattern of [/id="email"/, /name="email"/, /type="email"/, /required=""/, /autoComplete="email"/, /app-input/]) assert.match(output, pattern);
  assert.match(html(Textarea, { name: "message", required: true }), /name="message"/);
});

test("password visibility control is named and never submits the form", () => {
  const output = html(PasswordInput, { id: "password", autoComplete: "current-password" });
  assert.match(output, /type="password"/);
  assert.match(output, /type="button"/);
  assert.match(output, /aria-label="Mostrar senha"/);
  assert.match(output, /aria-pressed="false"/);
});

test("cards retain content slots and theme-aware surfaces", () => {
  const output = html(Card, {}, [React.createElement(CardHeader, { key: "header" }, React.createElement(CardTitle, {}, "Projeto")), React.createElement(CardContent, { key: "body" }, "Detalhes")]);
  assert.match(output, /data-slot="card"/);
  assert.match(output, /data-slot="card-content"/);
  assert.match(output, /var\(--cl-surface\)/);
  assert.match(output, /Detalhes/);
});

test("page headers expose one h1 and preserve navigation and actions", () => {
  const output = html(PageHeader, { title: "Portfólio", description: "Seus projetos", backHref: "/home", actions: React.createElement(Button, {}, "Novo projeto") });
  assert.equal((output.match(/<h1/g) || []).length, 1);
  assert.match(output, /href="\/home"/);
  assert.match(output, /Novo projeto/);
  assert.match(output, /app-page-actions/);
});

test("administrative navigation only links to existing routes", () => {
  const source = fs.readFileSync(path.join(root, "src/components/gestao-confi/AdminBottomNav.tsx"), "utf8");
  const ast = ts.createSourceFile("nav.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const routes = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === "href") {
      const value = node.initializer.getText(ast);
      const suffix = value.match(/^base \+ "(.*)"$/);
      if (value === "base" || suffix) routes.push("/gestao-confi/dashboard" + (suffix?.[1] || ""));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(routes.length >= 10);
  for (const route of routes) assert.ok(fs.existsSync(path.join(root, "src/app", route, "page.tsx")), route);
});

test("shell reserves safe areas and supports reduced motion", () => {
  const css = fs.readFileSync(path.join(root, "src/app/native-app.css"), "utf8");
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /min-height: 44px/);
});
