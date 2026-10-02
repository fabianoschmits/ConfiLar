export const METRIC_NAMES = [
  "LCP",
  "INP",
  "CLS",
  "ERROR",
  "REJECTION",
  "REACT_ERROR",
] as const;
export function canMeasure() {
  if (typeof window === "undefined" || navigator.doNotTrack === "1")
    return false;
  try {
    return (
      JSON.parse(localStorage.getItem("cookie-preferences") || "{}")
        .analytical === true
    );
  } catch {
    return false;
  }
}
const routes = new Set([
  "/home",
  "/feed",
  "/classificados",
  "/buscar",
  "/usuarios",
  "/auth",
  "/mensagens",
  "/perfil",
  "/confipoints/dashboard",
  "/confipoints/loja",
]);
export function metricRoute(path: string) {
  return routes.has(path)
    ? path
    : path.startsWith("/perfil/")
      ? "/perfil/:id"
      : "other";
}
export function validMetric(value: unknown): value is {
  name: (typeof METRIC_NAMES)[number];
  value: number;
  route: string;
  mobile: boolean;
} {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    Object.keys(row).every((k) =>
      ["name", "value", "route", "mobile"].includes(k),
    ) &&
    METRIC_NAMES.includes(row.name as (typeof METRIC_NAMES)[number]) &&
    typeof row.value === "number" &&
    Number.isFinite(row.value) &&
    row.value >= 0 &&
    row.value <= (row.name === "CLS" ? 100 : 3600000) &&
    typeof row.route === "string" &&
    (routes.has(row.route) || ["other", "/perfil/:id"].includes(row.route)) &&
    typeof row.mobile === "boolean"
  );
}
