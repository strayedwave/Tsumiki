import "./ColorWheel.css";
import { moveWheelPlane, wheelHue, wheelPlane } from "./color-wheel-input";

type WheelPointerEvent = PointerEvent & { currentTarget: HTMLDivElement };

/** 色相は度、彩度と明度は 0〜1。色の変換や保存は呼び出し側で行う。 */
export default function ColorWheel(props: {
  hue: number;
  saturation: number;
  value: number;
  planeHue?: number;
  ringColors?: readonly string[];
  marker?: readonly [number, number];
  gamutPath?: string;
  disabled?: boolean;
  planeLabel: string;
  onHueChange: (hue: number) => void;
  onPlaneChange: (saturation: number, value: number) => void;
}) {
  const hueAngle = () => ((props.hue - 90) * Math.PI) / 180;
  const markerPosition = (direction: number) =>
    `calc(${50 + direction * 50}% - ${direction / 2} * var(--hue-ring-width))`;
  const saturationPercent = () => Math.round(props.saturation * 100);
  const valuePercent = () => Math.round(props.value * 100);

  const changeHue = (event: WheelPointerEvent) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const hue = wheelHue(bounds, event.clientX, event.clientY);
    if (hue !== undefined) props.onHueChange(hue);
  };

  const changePlane = (event: WheelPointerEvent) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const next = wheelPlane(bounds, event.clientX, event.clientY);
    if (next) props.onPlaneChange(...next);
  };

  const movePlaneWithKeys = (event: KeyboardEvent) => {
    if (props.disabled) return;
    const next = moveWheelPlane(
      event.key,
      event.shiftKey,
      props.saturation,
      props.value,
    );
    if (!next) return;
    event.preventDefault();
    props.onPlaneChange(...next);
  };

  return (
    <div
      class={props.disabled ? "hue-ring disabled" : "hue-ring"}
      style={{
        "--hue-color": `hsl(${props.planeHue ?? props.hue} 100% 50%)`,
        "--hue-ring-colors": props.ringColors
          ?.map(
            (color, index, colors) =>
              `${color} ${(index * 360) / Math.max(1, colors.length - 1)}deg`,
          )
          .join(","),
      }}
      onPointerDown={(event) => {
        if (props.disabled || event.target !== event.currentTarget) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        changeHue(event);
      }}
      onPointerMove={(event) => {
        if (
          !props.disabled &&
          event.buttons &&
          event.target === event.currentTarget
        ) {
          changeHue(event);
        }
      }}
    >
      <span
        class="hue-marker"
        style={{
          left: markerPosition(Math.cos(hueAngle())),
          top: markerPosition(Math.sin(hueAngle())),
        }}
      />
      <div
        class="saturation-value"
        role="slider"
        aria-disabled={props.disabled ? "true" : "false"}
        tabindex={props.disabled ? -1 : 0}
        aria-label={props.planeLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={saturationPercent()}
        aria-valuetext={`${saturationPercent()}%, ${valuePercent()}%`}
        style={{
          "--color-saturation": `${(props.marker?.[0] ?? props.saturation) * 100}%`,
          "--color-brightness": `${(props.marker?.[1] ?? 1 - props.value) * 100}%`,
        }}
        onPointerDown={(event) => {
          if (props.disabled) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          changePlane(event);
        }}
        onPointerMove={(event) => {
          if (!props.disabled && event.buttons) changePlane(event);
        }}
        onKeyDown={movePlaneWithKeys}
      >
        {props.gamutPath && (
          <svg
            class="gamut-mask"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="gamut-outside"
              fill-rule="evenodd"
              d={`M0,0H100V100H0Z ${props.gamutPath}`}
            />
            <path class="gamut-outline" d={props.gamutPath} />
          </svg>
        )}
        <span class="sv-marker" />
      </div>
    </div>
  );
}
