/** Clamps, orders and separates a two-thumb numeric range. */
export function normalizeRange(value: readonly [number, number], min: number, max: number, minGap = 0): [number, number] {
  const gap = Math.max(0, Math.min(minGap, max - min));
  const ordered = [...value].sort((a, b) => a - b);
  let start = Math.max(min, Math.min(max, ordered[0] ?? min));
  let end = Math.max(min, Math.min(max, ordered[1] ?? max));
  if (end - start < gap) {
    const center = (start + end) / 2;
    start = Math.max(min, Math.min(max - gap, center - gap / 2));
    end = start + gap;
  }
  return [start, end];
}
