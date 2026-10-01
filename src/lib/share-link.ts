/** Use the phone's native share sheet; desktop fallback copies the real URL. */
export async function shareLink(
  data: ShareData,
  api: Pick<Navigator, "share" | "clipboard"> = navigator,
): Promise<"shared" | "copied" | "cancelled"> {
  if (typeof api.share === "function") {
    try {
      await api.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError")
        return "cancelled";
      throw error;
    }
  }
  await api.clipboard.writeText(data.url || "");
  return "copied";
}
