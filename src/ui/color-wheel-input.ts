type Bounds = { left: number; top: number; width: number; height: number };
const clampUnit = (value: number) => Math.max(0, Math.min(1, value));

function hasArea(bounds: Bounds) {
  return bounds.width > 0 && bounds.height > 0;
}

export function wheelHue(bounds: Bounds, x: number, y: number) {
  if (!hasArea(bounds)) return;
  const angle = Math.atan2(
    y - bounds.top - bounds.height / 2,
    x - bounds.left - bounds.width / 2,
  );
  return ((angle * 180) / Math.PI + 450) % 360;
}

export function wheelPlane(
  bounds: Bounds,
  x: number,
  y: number,
): [number, number] | undefined {
  if (!hasArea(bounds)) return;
  return [
    clampUnit((x - bounds.left) / bounds.width),
    clampUnit(1 - (y - bounds.top) / bounds.height),
  ];
}

export function moveWheelPlane(
  key: string,
  shift: boolean,
  saturation: number,
  value: number,
): [number, number] | undefined {
  const step = shift ? 0.1 : 0.02;
  switch (key) {
    case "ArrowRight":
      return [clampUnit(saturation + step), clampUnit(value)];
    case "ArrowLeft":
      return [clampUnit(saturation - step), clampUnit(value)];
    case "ArrowUp":
      return [clampUnit(saturation), clampUnit(value + step)];
    case "ArrowDown":
      return [clampUnit(saturation), clampUnit(value - step)];
  }
}
