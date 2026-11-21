import "./StepSlider.css";
import { onCleanup } from "solid-js";
import { type EasingName, resolveEasing } from "../motion";
import { type Line, classes, lineClass } from "./line";
import { stepAt } from "./step-selection";

/**
 * 決まった段階だけを選ぶスライダー。段階ごとの目盛りボタンも付く。
 * `onInput` はつまみを動かしている間、`onCommit` は確定したとき
 * （目盛りのクリックを含む）に呼ばれる。
 *
 * つまみと、現在位置までの塗りは、段階が変わると、滑って移る
 * （`easing` と `duration`（ms）で決める）。つまみを手で動かしている間は、
 * 指に付いてくるので、滑らせない。`prefers-reduced-motion: reduce` では滑らない。
 */
export default function StepSlider<T extends number>(props: {
  label: string;
  steps: readonly T[];
  value: T;
  /** 値の表示（右上の数値と読み上げ）。既定は数値そのまま */
  format?: (step: T) => string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  /** つまみ・塗りが滑るときのイージング。既定は `standard` */
  easing?: EasingName | (string & {});
  /** 滑る長さ（ms）。既定は250 */
  duration?: number;
  onInput: (step: T) => void;
  onCommit: (step: T) => void;
}) {
  let root!: HTMLDivElement;
  const format = (step: T) => props.format?.(step) ?? String(step);
  const index = () => props.steps.indexOf(props.value);
  const emit = (index: number, handler: (step: T) => void) => {
    const step = stepAt(props.steps, index);
    if (step !== undefined) handler(step);
  };
  // つまみを押している間は、滑らせない（指に付いてこないと、ずれて見える）
  const release = () => delete root.dataset.dragging;
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  onCleanup(() => {
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", release);
  });
  return (
    <div
      ref={root}
      class={classes("setting-row scale-row", lineClass(props.line))}
      style={{
        "--scale-index": String(index()),
        "--scale-max": String(Math.max(1, props.steps.length - 1)),
        "--scale-duration": `${props.duration ?? 250}ms`,
        "--scale-easing": resolveEasing(props.easing ?? "standard"),
      }}
    >
      <span>{props.label}</span>
      <output class="scale-value">{format(props.value)}</output>
      <div class="scale-track">
        <span class="scale-progress" aria-hidden="true" />
        <span class="scale-thumb" aria-hidden="true" />
        <input
          class="scale-slider"
          type="range"
          min="0"
          max={Math.max(0, props.steps.length - 1)}
          disabled={props.steps.length === 0}
          step="1"
          aria-label={props.label}
          aria-valuetext={format(props.value)}
          value={index()}
          onPointerDown={() => {
            root.dataset.dragging = "";
          }}
          onInput={(e) => emit(e.currentTarget.valueAsNumber, props.onInput)}
          onChange={(e) => emit(e.currentTarget.valueAsNumber, props.onCommit)}
        />
      </div>
      <div class="scale-ticks">
        {props.steps.map((step, i) => (
          <button
            type="button"
            style={{ "--tick-index": String(i) }}
            aria-pressed={props.value === step ? "true" : "false"}
            disabled={!Number.isFinite(step)}
            onClick={() => emit(i, props.onCommit)}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}
