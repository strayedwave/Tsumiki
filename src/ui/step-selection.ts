/** Resolve a range input's index to a finite choice. */
export function stepAt<T extends number>(
  steps: readonly T[],
  index: number,
): T | undefined {
  if (!Number.isInteger(index) || index < 0 || index >= steps.length) return;
  const value = steps[index];
  return Number.isFinite(value) ? value : undefined;
}
