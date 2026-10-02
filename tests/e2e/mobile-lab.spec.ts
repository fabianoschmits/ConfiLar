import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("mobile lab records LCP and INP with constrained network and CPU", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    !process.env.RUN_MOBILE_LAB,
    "Optional laboratory benchmark, not real-device measurement",
  );
  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.addInitScript(() =>
    localStorage.setItem("cookie-consent", "true"),
  );
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200000,
    uploadThroughput: 93750,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/classificados");
  await page.addScriptTag({
    content: readFileSync(
      "node_modules/web-vitals/dist/web-vitals.iife.js",
      "utf8",
    ),
  });
  await page.evaluate(() => {
    const state = window as unknown as {
      webVitals: {
        onLCP: (fn: (metric: { value: number }) => void, opts: object) => void;
        onINP: (fn: (metric: { value: number }) => void, opts: object) => void;
      };
      lab: { LCP?: number; INP?: number };
    };
    state.lab = {};
    state.webVitals.onLCP(
      (metric) => {
        state.lab.LCP = metric.value;
      },
      { reportAllChanges: true },
    );
    state.webVitals.onINP(
      (metric) => {
        state.lab.INP = metric.value;
      },
      { reportAllChanges: true },
    );
  });
  await expect(
    page.getByRole("textbox", { name: "O que você precisa?" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "O que você precisa?" })
    .fill("limpeza");
  await page
    .getByRole("textbox", { name: "O que você precisa?" })
    .press("Escape");
  await page.getByRole("button", { name: "Pedidos", exact: true }).click();
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () => (window as unknown as { lab: { LCP?: number } }).lab.LCP,
      ),
    )
    .toBeGreaterThan(0);
  const result = await page.evaluate(() => ({
    metrics: (window as unknown as { lab: unknown }).lab,
    viewport: window.innerWidth,
    scriptResources: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("/_next/static/")).length,
  }));
  console.log("Mobile laboratory:", JSON.stringify(result));
  await testInfo.attach("mobile-lab.json", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
});
