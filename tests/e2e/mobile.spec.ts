import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

for (const theme of ["light", "dark"] as const) {
  test(`notifications use shared mobile presentation in ${theme} mode`, async ({
    page,
  }, testInfo) => {
    let readUpdates = 0;
    let rows = [
      {
        id: "33333333-3333-4333-8333-333333333333",
        user_id: owner,
        title: "Nova mensagem de suporte",
        message:
          "Você recebeu uma resposta. Abra a notificação para consultar os detalhes.",
        type: "support",
        is_read: false,
        created_at: "2026-10-01T10:00:00Z",
        metadata: {},
      },
    ];
    await page.addInitScript((theme) => {
      localStorage.setItem("confilar-theme", theme);
      localStorage.setItem("confilar-theme-state", JSON.stringify({ theme }));
      localStorage.setItem("push-prompt-dismissed", "true");
    }, theme);
    if (theme === "dark")
      await page.route(/\/rest\/v1\/profiles(?:\?|$)/, (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([{ ...profile, user_type: "admin" }]),
        }),
      );
    await page.route(/\/rest\/v1\/notifications(?:\?|$)/, (route) => {
      if (route.request().method() === "PATCH") {
        readUpdates++;
        rows = rows.map((row) => ({ ...row, is_read: true }));
      }
      if (route.request().method() === "DELETE") rows = [];
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(rows),
      });
    });
    await page.goto("/classificados");
    await page
      .getByRole("button", { name: "Notificações: 1 não lidas", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Notificações", exact: true }),
    ).toHaveCount(1);
    await page.screenshot({
      path: testInfo.outputPath(`notification-menu-${theme}.png`),
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Fechar notificações", exact: true })
      .click();
    expect(readUpdates).toBe(0);
    await page
      .getByRole("button", { name: "Notificações: 1 não lidas", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Marcar todas como lidas", exact: true })
      .click();
    await expect(
      page.locator('.notification-item[data-read="true"]'),
    ).toHaveCount(1);
    await page
      .getByRole("button", { name: "Fechar notificações", exact: true })
      .click();
    await page.goto("/notificacoes");
    await page
      .getByRole("button", { name: "Excluir notificação", exact: true })
      .click();
    const toast = page.locator('[data-sonner-toast][data-type="success"]');
    await expect(
      toast.getByText("Notificação removida", { exact: true }),
    ).toBeVisible();
    await expect(
      toast.getByRole("button", { name: "Fechar aviso" }),
    ).toBeVisible();
    await expect
      .poll(() => toast.evaluate((el) => el.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(11);
    expect(
      await toast.evaluate((el) => {
        const card = el.getBoundingClientRect();
        const close = el
          .querySelector("[data-close-button]")!
          .getBoundingClientRect();
        return (
          close.left >= card.left &&
          close.right <= card.right &&
          close.top >= card.top &&
          close.bottom <= card.bottom
        );
      }),
    ).toBe(true);
    expect(
      await toast.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(theme === "dark" ? "rgb(16, 28, 37)" : "rgb(255, 255, 255)");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`notifications-${theme}.png`),
      animations: "disabled",
    });
    await toast.getByRole("button", { name: "Fechar aviso" }).click();
    await expect(toast).toHaveCount(0);
  });
}

const owner = "11111111-1111-4111-8111-111111111111";
const profile = {
  id: owner,
  full_name: "Profissional de teste",
  user_type: "professional",
  avatar_url: null,
  is_verified: false,
  is_available: true,
  profile_completed: true,
  hide_ai_announcement: true,
  phone: "00000000000",
  location_city: "Venâncio Aires",
  location_state: "RS",
};
const ad = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: owner,
  user_name: profile.full_name,
  user_type: "professional",
  title: "Anúncio de teste",
  description: "Serviço disponível no bairro",
  category: "Telhado",
  location_city: "Venâncio Aires",
  location_state: "RS",
  created_at: "2026-10-01T10:00:00Z",
  is_active: true,
  views: 0,
  likes_count: 0,
  comments_count: 0,
  ad_type: "oferecer",
  price_range: "1200",
  images: [],
};
test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:3001/api/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        balance: { balance: 1000 },
        data: [],
      }),
    }),
  );
  // Isolated fixtures: no credentials and no writes to the real Supabase project.
  await page.addInitScript(
    ({ project, owner }) => {
      localStorage.setItem("cookie-consent", "true");
      localStorage.setItem(
        "cookie-preferences",
        JSON.stringify({ essential: true, analytical: false }),
      );
      for (const route of ["feed", "classificados", "busca"])
        localStorage.setItem(
          `confilar_tutorial_seen_${route}_${owner}`,
          "true",
        );
      const expires = Math.floor(Date.now() / 1000) + 3600;
      const encoded = (value: object) =>
        btoa(JSON.stringify(value))
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      const token =
        encoded({ alg: "HS256", typ: "JWT" }) +
        "." +
        encoded({
          sub: owner,
          role: "authenticated",
          exp: expires,
          iat: expires - 3600,
        }) +
        ".fixture";
      const session = {
        access_token: token,
        refresh_token: "fixture",
        expires_in: 3600,
        expires_at: expires,
        token_type: "bearer",
        user: {
          id: owner,
          role: "authenticated",
          email: "fixture@example.invalid",
          app_metadata: { provider: "email" },
          user_metadata: {},
        },
      };
      document.cookie = `sb-${project}-auth-token=base64-${encoded(session)}; Path=/; SameSite=Lax`;
    },
    {
      project: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(
        ".",
      )[0],
      owner,
    },
  );
  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/auth/v1/user"))
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: owner,
          role: "authenticated",
          email: "fixture@example.invalid",
          user_metadata: {},
          app_metadata: {},
        }),
      });
    if (!["GET", "HEAD"].includes(route.request().method()))
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    const data = url.pathname.endsWith("/classified_ads")
      ? [ad]
      : url.pathname.endsWith("/profiles")
        ? [profile]
        : [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
});
test("mobile classifieds retain complete price, filters and detail modal", async ({
  page,
}) => {
  await page.goto("/classificados");
  const card = page.getByRole("article").filter({ hasText: ad.title });
  await expect(card).toBeVisible();
  await expect(card.getByText("A partir de R$ 1200")).toBeVisible();
  await card.getByRole("button", { name: "Ver mais" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText(ad.description),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Pedidos", exact: true }).click();
  await expect(card).toHaveCount(0);
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await expect(card).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("offline state is visible and clears after reconnection", async ({
  page,
  context,
}) => {
  await page.goto("/classificados");
  await expect(page.getByRole("article")).toBeVisible();
  await context.setOffline(true);
  await expect(
    page.getByRole("status").filter({ hasText: "Sem conexão" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toBeVisible();
  await context.setOffline(false);
  await expect(
    page.getByRole("status").filter({ hasText: "Sem conexão" }),
  ).toHaveCount(0);
});
test("feed empty state and search controls remain usable", async ({ page }) => {
  await page.goto("/feed");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Buscar/ }).first(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("long feed uses cursor pages and keeps the rendered DOM bounded", async ({
  page,
}) => {
  const anchor = Date.now();
  const posts = Array.from({ length: 100 }, (_, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    user_id: owner,
    professional_id: owner,
    user: profile,
    professional: profile,
    title: `Publicação ${index + 1}`,
    description: `Conteúdo de teste ${index + 1}`,
    content: `Conteúdo de teste ${index + 1}`,
    images: [],
    tags: [],
    is_active: true,
    is_public: true,
    is_featured: false,
    is_premium: false,
    likes_count: 0,
    comments_count: 0,
    metadata: null,
    created_at: new Date(anchor - index * 60000).toISOString(),
  }));
  let pages = 0;
  await page.route(/\/rest\/v1\/feed_posts\?/, async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("limit") !== "20")
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    pages++;
    const expression = url.searchParams.getAll("or").join(",");
    const before = expression.match(/created_at\.lt\.([^,)]+)/)?.[1];
    const data = posts
      .filter((post) => !before || post.created_at < before)
      .slice(0, 20);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/feed");
  const list = page.getByTestId("feed-list");
  await expect(list).toBeVisible();
  await expect(list.locator("article")).toHaveCount(20);
  for (let index = 0; index < 4; index++) {
    await page.locator(".social-feed-loading-more").scrollIntoViewIfNeeded();
    await expect.poll(() => pages).toBeGreaterThan(index + 1);
  }
  await expect(list).toHaveAttribute("data-virtualized", "true");
  expect(await list.locator("article").count()).toBeLessThan(30);
  const ids = await list
    .locator("article")
    .evaluateAll((elements) => elements.map((e) => e.id));
  expect(new Set(ids).size).toBe(ids.length);
});
