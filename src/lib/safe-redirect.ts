/** Only accept application paths. Never execute schemes or protocol-relative URLs. */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/home",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded))
      return fallback;
    const url = new URL(value, "https://confilar.invalid");
    return url.origin === "https://confilar.invalid"
      ? url.pathname + url.search + url.hash
      : fallback;
  } catch {
    return fallback;
  }
}
