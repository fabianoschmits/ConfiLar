import { PREMIUM_PRICES } from "@/constants/premiumPrices";

/** Validate the quoted price against the server's catalog before any debit. */
export function validPremiumPurchase(
  kind: "AD" | "POST",
  duration: unknown,
  points: unknown,
  credit?: unknown,
): boolean {
  if (typeof duration !== "number" || ![1, 7, 14, 30].includes(duration))
    return false;
  if (credit != null && credit !== "") {
    return (
      kind === "AD" &&
      points === 0 &&
      ((credit === "1d" && duration === 1) ||
        (credit === "7d" && duration === 7))
    );
  }
  const key =
    `${kind}_${duration}_${duration === 1 ? "DAY" : "DAYS"}` as keyof typeof PREMIUM_PRICES;
  return points === PREMIUM_PRICES[key]?.POINTS;
}
