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
    if (!name.startsWith("@/") && !name.startsWith(".")) return localRequire(name);
    const base = name.startsWith("@/") ? "src/" + name.slice(2) : path.resolve(path.dirname(filename), name);
    const file = [base + ".tsx", base + ".ts", base + "/index.ts"].find((f) =>
      fs.existsSync(path.resolve(root, f)),
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
  assert.match(css, /\.account-dropdown-panel\s*\{[^}]*position: fixed;[^}]*right: 12px;[^}]*width: calc\(100% - 24px\)/);
});

const { getShortcutGroups, getMobileShortcuts, getHomeShortcuts, isShortcutActive } = load("src/lib/app-navigation.ts");
const { ShortcutLink } = load("src/components/navigation/ShortcutLink.tsx");
const { AccountShortcuts } = load("src/components/navigation/AccountShortcuts.tsx");
const { UserHomeContent } = load("src/components/home/UserHomeContent.tsx");
const sampleProfile = {
  id: "test-user", user_type: "client", full_name: "Pessoa Teste", avatar_url: null,
  location_city: "Venâncio Aires", location_state: "RS",
};

test("mobile shortcuts have five unique destinations and guests keep login", () => {
  for (const profile of [null, sampleProfile, { ...sampleProfile, user_type: "professional" }]) {
    const shortcuts = getMobileShortcuts(profile);
    assert.equal(shortcuts.length, 5);
    assert.equal(new Set(shortcuts.map(s => s.id)).size, 5);
    assert.deepEqual(shortcuts.slice(0, 4).map(s => s.id), ["home", "feed", "search", "classifieds"]);
    assert.equal(shortcuts[4].id, profile ? "messages" : "login");
    assert.equal(shortcuts[0].href, profile ? "/home" : "/");
  }
});

test("every moved tab and home shortcut remains accessible in the account dropdown", () => {
  for (const user_type of ["client", "professional"]) {
    const profile = { ...sampleProfile, user_type };
    const all = getShortcutGroups(profile).flatMap(g => g.shortcuts);
    assert.equal(new Set(all.map(s => s.id)).size, all.length);
    assert.equal(all.find(s => s.id === "profile").href, "/perfil/test-user");
    for (const shortcut of [...getMobileShortcuts(profile), ...getHomeShortcuts(profile)]) {
      assert.ok(all.some(s => s.id === shortcut.id && s.href === shortcut.href && s.action === shortcut.action), shortcut.id);
    }
    const output = html(AccountShortcuts, { profile, isAdmin: false, onNavigate() {}, onOpenChat() {} });
    for (const shortcut of all) {
      assert.ok(output.includes(shortcut.label), shortcut.id);
      if (shortcut.href) assert.ok(output.includes(`href="${shortcut.href}"`), shortcut.href);
    }
    assert.match(output, /aria-expanded="true" aria-controls="account-shortcuts-account"/);
    assert.match(output, /Meu perfil/);
  }
});

test("reorganized dropdown retains all previous destination routes", () => {
  const all = getShortcutGroups({ ...sampleProfile, user_type: "professional" }).flatMap(g => g.shortcuts);
  const previous = ["/home", "/feed", "/buscar", "/classificados", "/favoritos", "/avaliacoes", "/indicacoes", "/portfolio", "/reputacao", "/confipoints/dashboard", "/confipoints/comprar", "/confipoints/compras", "/confipoints/transferir"];
  for (const route of previous) {
    assert.ok(all.some(s => s.href === route), route);
    assert.ok(fs.existsSync(path.join(root, "src/app", route, "page.tsx")), route);
  }
  assert.ok(all.some(s => s.action === "chat"));
  const admin = html(AccountShortcuts, { profile: sampleProfile, isAdmin: true, unreadMessages: 125, onNavigate() {}, onOpenChat() {} });
  assert.match(admin, /href="\/gestao-confi\/confipoints"/);
  assert.match(admin, /125 mensagens não lidas/);
  assert.match(admin, /99\+/);
  const regular = html(AccountShortcuts, { profile: sampleProfile, isAdmin: false, onNavigate() {}, onOpenChat() {} });
  assert.doesNotMatch(regular, /href="\/gestao-confi/);
});

test("professional shortcuts never appear in the client home or guest inventory", () => {
  assert.ok(getHomeShortcuts({ ...sampleProfile, user_type: "professional" }).some(s => s.id === "portfolio"));
  for (const shortcuts of [getHomeShortcuts(sampleProfile), getShortcutGroups(null).flatMap(g => g.shortcuts)]) {
    assert.ok(!shortcuts.some(s => ["portfolio", "reputation"].includes(s.id)));
  }
});

test("shortcut actions close the menu before opening chat and never use placeholder links", () => {
  const shortcut = getMobileShortcuts(sampleProfile).find(s => s.id === "messages");
  const calls = [];
  const element = ShortcutLink({ shortcut, children: "Mensagens", onNavigate: () => calls.push("close"), onOpenChat: () => calls.push("chat") });
  assert.equal(element.type, "button");
  assert.equal(element.props.type, "button");
  element.props.onClick();
  assert.deepEqual(calls, ["close", "chat"]);
  assert.doesNotMatch(renderToStaticMarkup(element), /href=/);
});

test("tab state matches whole route segments and not similarly named paths", () => {
  const home = getMobileShortcuts(sampleProfile)[0];
  assert.ok(isShortcutActive("/home", home));
  assert.ok(!isShortcutActive("/home-other", home));
  const classified = getMobileShortcuts(sampleProfile).find(s => s.id === "classifieds");
  assert.ok(isShortcutActive("/classificados/anuncio", classified));
  assert.ok(!isShortcutActive("/classificados-other", classified));
  assert.ok(!isShortcutActive("/home", getMobileShortcuts(sampleProfile)[4]));
});

test("personal home uses real profile fields, role-specific actions and accessible headings", () => {
  for (const user_type of ["client", "professional"]) {
    const output = html(UserHomeContent, { profile: { ...sampleProfile, user_type }, onOpenChat() {}, onEditProfile() {} });
    assert.equal((output.match(/<h1/g) || []).length, 1);
    assert.match(output, /Olá, Pessoa/);
    assert.match(output, /Venâncio Aires - RS/);
    assert.match(output, /Meus atalhos/);
    assert.match(output, /Editar meu perfil/);
    assert.match(output, /href="\/ajuda"/);
    assert.match(output, /href="\/perfil\/test-user"/);
    assert.doesNotMatch(output, /href="#"/);
    if (user_type === "professional") assert.match(output, /Explorar classificados/);
    else assert.match(output, /Qual serviço você precisa\?/);
  }
  const withoutCity = html(UserHomeContent, { profile: { ...sampleProfile, location_city: "", location_state: "" }, onOpenChat() {}, onEditProfile() {} });
  assert.doesNotMatch(withoutCity, /Venâncio Aires/);
});

test("default login and root redirects lead to the personal home without discarding explicit destinations", () => {
  const login = fs.readFileSync(path.join(root, "src/components/forms/LoginForm.tsx"), "utf8");
  assert.match(login, /safeRedirectPath\(searchParams\.get\("redirect"\)\)/);
  const callback = fs.readFileSync(path.join(root, "src/app/auth/callback/route.ts"), "utf8");
  assert.match(callback, /safeRedirectPath\(searchParams\.get\("next"\)\)/);
  const landing = fs.readFileSync(path.join(root, "src/app/page.tsx"), "utf8");
  assert.match(landing, /router\.replace\("\/home"\)/);
});

// Exercise the actual provider handlers with isolated hook state and browser
// dependencies. No real login, storage or router is modified by these tests.
function tutorialHarness(href, signedIn = true) {
  const states = [];
  const pushes = [];
  const replacements = [];
  const storage = new Map();
  let cursor = 0;
  const browser = {
    location: { href },
    history: {
      state: { __NA: true, tree: "existing-next-state" },
      replaceState(state, _title, url) {
        replacements.push({ state, url: String(url) });
        browser.location.href = String(url);
      },
    },
  };
  const fakeReact = {
    ...React,
    useState(initial) {
      const slot = cursor++;
      if (states.length <= slot) states[slot] = typeof initial === "function" ? initial() : initial;
      return [states[slot], (value) => {
        states[slot] = typeof value === "function" ? value(states[slot]) : value;
      }];
    },
    useEffect() {},
  };
  const sampleSteps = [{ targetId: "first", title: "Primeiro passo" }, { targetId: "last", title: "Último passo" }];
  const imports = {
    react: fakeReact,
    "next/navigation": {
      useRouter: () => ({ push: route => pushes.push(route) }),
      usePathname: () => new URL(browser.location.href).pathname,
      useSearchParams: () => new URL(browser.location.href).searchParams,
    },
    "@/contexts/AuthContext": { useAuthContext: () => ({ user: signedIn ? { id: "tutorial-test" } : null }) },
    "@/data/tutorialSteps": { tutorialSteps: sampleSteps },
    "@/data/tutorialStepsClassifieds": { tutorialStepsClassifieds: sampleSteps },
    "@/data/tutorialStepsBusca": { tutorialStepsBusca: sampleSteps },
  };
  const filename = path.join(root, "src/contexts/TutorialContext.tsx");
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const storageStub = { setItem: (key, value) => storage.set(key, value) };
  new Function("require", "module", "exports", "window", "localStorage", output)(
    name => imports[name] || require(name), module, module.exports, browser, storageStub,
  );
  return {
    browser, pushes, replacements, storage,
    api() {
      cursor = 0;
      return module.exports.TutorialProvider({ children: null }).props.value;
    },
  };
}

test("closing each tutorial stays on its current page and records dismissal", () => {
  for (const [page, route] of [["feed", "/feed"], ["classificados", "/classificados"], ["busca", "/buscar"]]) {
    const href = `http://localhost:3000${route}?category=all#results`;
    const harness = tutorialHarness(href);
    harness.api().startPageTutorial(page);
    assert.equal(harness.api().isActive, true);
    harness.api().skipTutorial();
    assert.deepEqual(harness.pushes, []);
    assert.equal(harness.browser.location.href, href);
    assert.equal(harness.api().isActive, false);
    assert.equal(harness.api().currentPage, null);
    assert.equal(harness.storage.get(`confilar_tutorial_seen_${page}_tutorial-test`), "true");
  }
});

test("closing removes only welcome while retaining other parameters, hash and Next history state", () => {
  const harness = tutorialHarness("http://localhost:3000/feed?welcome=true&category=all#results");
  const originalState = harness.browser.history.state;
  harness.api().startTutorial();
  harness.api().skipTutorial();
  assert.deepEqual(harness.pushes, []);
  assert.equal(harness.replacements.length, 1);
  assert.equal(harness.replacements[0].state, originalState);
  assert.equal(harness.browser.location.href, "http://localhost:3000/feed?category=all#results");
});

test("finishing the last step preserves the intentional guided-tour progression", () => {
  for (const [page, nextRoute] of [["feed", "/classificados"], ["classificados", "/buscar"], ["busca", "/feed"]]) {
    const harness = tutorialHarness("http://localhost:3000/feed");
    harness.api().startPageTutorial(page);
    harness.api().nextStep();
    assert.equal(harness.api().currentStepIndex, 1);
    assert.deepEqual(harness.pushes, []);
    harness.api().nextStep();
    assert.deepEqual(harness.pushes, [nextRoute]);
    assert.equal(harness.api().isActive, false);
  }
});

test("dismissing a tutorial without a user or active tour remains non-navigating", () => {
  const harness = tutorialHarness("http://localhost:3000/feed", false);
  harness.api().skipTutorial();
  assert.deepEqual(harness.pushes, []);
  assert.equal(harness.storage.size, 0);
  harness.api().startPageTutorial("feed");
  harness.api().skipTutorial();
  assert.deepEqual(harness.pushes, []);
  assert.equal(harness.storage.size, 0);
  assert.equal(harness.api().isActive, false);
});
