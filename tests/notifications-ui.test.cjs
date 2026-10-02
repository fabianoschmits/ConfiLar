const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  const resolve = (name) => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/")
        ? "src/" + name.slice(2)
        : path.resolve(path.dirname(file), name);
      const target = [base + ".tsx", base + ".ts"].find((p) =>
        fs.existsSync(p),
      );
      return load(target, mocks);
    }
    return require(name);
  };
  new Function("require", "module", "exports", code)(
    resolve,
    module,
    module.exports,
  );
  return module.exports;
}
test("all user/admin toasts share the theme, safe-area offsets and named close action", () => {
  let props;
  const originalError = () => {};
  const sonner = {
    toast: { error: originalError },
    useSonner: () => ({ toasts: [] }),
    Toaster: (p) => {
      props = p;
      return React.createElement("aside");
    },
  };
  const { ToasterWithSounds } = load(
    "src/components/ui/ToasterWithSounds.tsx",
    {
      sonner,
      "next-themes": { useTheme: () => ({ resolvedTheme: "dark" }) },
      "@/lib/soundManager": { soundManager: { play: async () => {} } },
    },
  );
  renderToStaticMarkup(React.createElement(ToasterWithSounds));
  assert.equal(props.theme, "dark");
  assert.equal(props.richColors, false);
  assert.equal(props.position, "top-center");
  assert.equal(props.toastOptions.closeButtonAriaLabel, "Fechar aviso");
  assert.match(props.mobileOffset.top, /safe-area-inset-top/);
  assert.equal(sonner.toast.error, originalError);
  for (const type of ["success", "error", "warning", "info"])
    assert.ok(props.icons[type]);
});
test("notification rows retain information, unread distinction and independent accessible actions", () => {
  const { DesktopNotificationItem } = load(
    "src/components/notifications/DesktopNotificationItem.tsx",
  );
  const notification = {
    id: "fixture",
    title: "Nova mensagem",
    message: "Detalhes da mensagem",
    type: "message",
    created_at: "invalid-legacy-date",
    is_read: false,
    metadata: {
      type: "shared_post",
      post_title: "Publicação compartilhada de teste",
    },
  };
  const render = (row) =>
    renderToStaticMarkup(
      React.createElement(DesktopNotificationItem, {
        notification: row,
        onClick() {},
        onDelete() {},
        onMarkAsRead() {},
      }),
    );
  const unread = render(notification);
  assert.match(unread, /data-read="false"/);
  for (const text of [
    "Nova mensagem",
    "Detalhes da mensagem",
    "Publicação compartilhada de teste",
    "Marcar como lida",
    "Excluir notificação",
    "Não lida",
  ])
    assert.ok(unread.includes(text));
  assert.equal((unread.match(/<button/g) || []).length, 3);
  assert.equal(
    (render({ ...notification, is_read: true }).match(/<button/g) || []).length,
    2,
  );
});
test("menu closing cannot silently mark every notification as read", () => {
  const source = fs.readFileSync(
    "src/components/notifications/AdaptiveNotificationCenter.tsx",
    "utf8",
  );
  assert.ok(!source.includes("if (!isOpen && unreadCount"));
  assert.match(source, /Marcar todas como lidas/);
  assert.match(source, /aria-label="Fechar notificações"/);
});
test("availability feedback uses shared presentation, without inline gradients", () => {
  const source = fs.readFileSync("src/hooks/useAvailability.ts", "utf8");
  assert.ok(!source.includes("linear-gradient"));
  assert.ok(!source.includes("style:"));
  const css = fs.readFileSync("src/app/native-app.css", "utf8");
  assert.match(css, /\.confilar-toaster/);
  assert.match(css, /var\(--cl-cta\)/);
});
