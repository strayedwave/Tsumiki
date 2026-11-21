function decimalParts(value: number) {
  const [mantissa, exponent = "0"] = String(value).split("e");
  const [whole, fraction = ""] = mantissa.split(".");
  return {
    units: BigInt(whole + fraction),
    exponent: Number(exponent) - fraction.length,
  };
}

/** Round to the nearest selectable step, choosing the higher value on ties. */
export function parseSliderNumber(
  raw: string,
  min: number,
  max: number,
  step = 1,
): number | undefined {
  if (raw !== raw.trim() || !/^-?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/.test(raw))
    return;
  const value = Number(raw);
  if (![value, min, max, step].every(Number.isFinite) || max < min || step <= 0)
    return;

  // Use integer arithmetic at a common decimal scale so halfway values
  // and aligned upper bounds are handled without floating-point drift.
  const parts = [Math.max(min, Math.min(max, value)), min, max, step].map(
    decimalParts,
  );
  const scale = Math.min(...parts.map((part) => part.exponent));
  const [input, lower, upper, increment] = parts.map(
    (part) => part.units * 10n ** BigInt(part.exponent - scale),
  );
  const offset = input - lower;
  const nearest = (2n * offset + increment) / (2n * increment);
  const last = (upper - lower) / increment;
  const units = lower + (nearest > last ? last : nearest) * increment;
  return Number(`${units}e${scale}`);
}
