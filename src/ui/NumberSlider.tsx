import "./NumberSlider.css";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { type Line, classes, lineClass } from "./line";
import { parseSliderNumber } from "./slider-number";

/**
 * 数値欄とスライダーを組にした、数値設定のパーツ。どちらを動かしても同じ値を示す。
 *
 * - `heading` を渡したときだけ、見出し（H・R・シアンなど）を表示する。
 *   `headingTitle` は見出しのツールチップ。
 * - `layout`: `row`（既定）は「見出し・数値欄・スライダー」を1行に並べる。
 *   `stacked` は「見出し＋数値欄」の下にスライダーを置く。この指定は最初の描画で決まる。
 * - `trackStyle` はスライダーの `style`。つまみの下地は CSS 変数 `--range-track` で渡す
 *   （グラデーションなど）。
 * - `onInput` はスライダーを動かしたとき、`onNumberInput` は数値欄に入力したとき
 *   （生の文字列）。`onNumberInput` を省略すると、入力を範囲内の最も近い刻みに丸めて
 *   `onInput` を呼ぶ。数値欄を離れると補正された値を表示する。
 * - `id` はスライダーの id、数値欄の id は `numberId`（省略時は `${id}-number`）。
 */
export default function NumberSlider(props: {
  id?: string;
  numberId?: string;
  layout?: "row" | "stacked";
  class?: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  heading?: JSX.Element;
  headingTitle?: string;
  /** スライダーの `aria-label` */
  label: string;
  /** 数値欄の `aria-label`。省略時は `label` */
  numberLabel?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  disabled?: boolean;
  trackStyle?: JSX.CSSProperties;
  onInput: (value: number) => void;
  onNumberInput?: (raw: string) => void;
}) {
  const [draft, setDraft] = createSignal<string>();
  const stacked = props.layout === "stacked";
  const headless = props.heading === undefined;
  const numberId = () =>
    props.numberId ?? (props.id ? `${props.id}-number` : undefined);
  const number = (
    <input
      id={numberId()}
      type="number"
      aria-label={props.numberLabel ?? props.label}
      min={props.min}
      max={props.max}
      step={props.step ?? 1}
      value={draft() ?? props.value}
      disabled={props.disabled}
      onFocus={(event) => {
        if (!props.onNumberInput) setDraft(event.currentTarget.value);
      }}
      onBlur={(event) => {
        if (!props.onNumberInput) {
          setDraft(undefined);
          event.currentTarget.value = String(props.value);
        }
      }}
      onInput={(event) => {
        const raw = event.target.value;
        if (props.onNumberInput) props.onNumberInput(raw);
        else {
          const value = parseSliderNumber(
            raw,
            props.min,
            props.max,
            props.step,
          );
          if (value !== undefined) props.onInput(value);
        }
      }}
    />
  );
  const slider = (
    <input
      id={props.id}
      type="range"
      aria-label={props.label}
      min={props.min}
      max={props.max}
      step={props.step ?? 1}
      value={props.value}
      disabled={props.disabled}
      style={props.trackStyle}
      onInput={(event) => props.onInput(Number(event.target.value))}
    />
  );
  const rootClass = (base: string) =>
    classes(
      base,
      headless && !stacked && "number-slider-headless",
      lineClass(props.line),
      props.class,
    );
  return stacked ? (
    <div class={rootClass("cmyk-channel")}>
      <label for={numberId()}>
        {!headless && <span>{props.heading}</span>}
        {number}
      </label>
      {slider}
    </div>
  ) : (
    <div class={rootClass("color-channel-slider")}>
      {!headless && (
        <label for={numberId()} title={props.headingTitle}>
          {props.heading}
        </label>
      )}
      {number}
      {slider}
    </div>
  );
}
