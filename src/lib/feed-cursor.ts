export interface FeedCursor {
  id: string;
  created_at: string;
  featured: boolean | null;
}
export function feedCursorFilter(cursor: FeedCursor): string {
  if (
    !/^[0-9a-f-]{36}$/i.test(cursor.id) ||
    !/^\d{4}-\d{2}-\d{2}T[\d:.+-]+Z?$/.test(cursor.created_at)
  )
    throw new Error("Invalid cursor");
  const same =
    cursor.featured === null
      ? "is_featured.is.null"
      : `is_featured.eq.${cursor.featured}`;
  const laterGroups =
    cursor.featured === true
      ? ["is_featured.eq.false", "is_featured.is.null"]
      : cursor.featured === false
        ? ["is_featured.is.null"]
        : [];
  return [
    ...laterGroups,
    `and(${same},created_at.lt.${cursor.created_at})`,
    `and(${same},created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
  ].join(",");
}
export function oldestFeedCursor(
  items: {
    id: string;
    created_at: string;
    pagination_featured?: boolean | null;
  }[],
): FeedCursor | null {
  const rank = (value: boolean | null | undefined) =>
    value === true ? 0 : value === false ? 1 : 2;
  const last = [...items]
    .sort(
      (a, b) =>
        rank(a.pagination_featured) - rank(b.pagination_featured) ||
        b.created_at.localeCompare(a.created_at) ||
        b.id.localeCompare(a.id),
    )
    .at(-1);
  return last
    ? {
        id: last.id,
        created_at: last.created_at,
        featured: last.pagination_featured ?? null,
      }
    : null;
}
