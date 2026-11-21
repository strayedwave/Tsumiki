export function nextTabIndex(
  key: string,
  current: number,
  count: number,
  orientation: "horizontal" | "vertical" = "horizontal",
): number | undefined {
  if (!Number.isInteger(current) || current < 0 || current >= count) return;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === (orientation === "vertical" ? "ArrowUp" : "ArrowLeft"))
    return (current + count - 1) % count;
  if (key === (orientation === "vertical" ? "ArrowDown" : "ArrowRight"))
    return (current + 1) % count;
}
