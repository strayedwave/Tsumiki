import "./InlineButton.css";
import "./icon-paint.css";
import type { JSX } from "@solidjs/web";
import { type AnimateSpec, useAnimate } from "../motion";
import type { IconPaint } from "./icon-paint";
import { type Line, classes, lineClass } from "./line";

/**
 * 行の中に置く、小さなアイコンボタン（お気に入り・編集など）。
 * アイコンは `children` で渡す（ライブラリは持たない）。
 *
 * - `selected` を渡すと、切り替えボタンになる（`aria-pressed`）。選択中は、アイコンが
 *   アクセント色で塗られ、`selected` クラスが付く。
 * - `label` は `aria-label`。`showTitle` でツールチップにも出す。
 * - 並べる間隔や、行の中での位置は、置く側が決める。
 * - `animate` を渡すと、アイコン（またはボタン）が動く（`motion/animate.ts`）。
 *   `trigger: "selected"` なら、`selected` が変わったときに動く。
 */
export default function InlineButton(props: {
  label: string;
  selected?: boolean;
  animate?: AnimateSpec;
  /** アイコンの描き方: 縁だけ（既定）/ 塗りだけ / 塗り+縁（`icon-paint.css`） */
  iconPaint?: IconPaint;
  showTitle?: boolean;
  disabled?: boolean;
  class?: string;
  /** 縁の線（既定は線なし）。隣との境目には `start` / `end` */
  line?: Line;
  onClick: () => void;
  children: JSX.Element;
}) {
  const animate = useAnimate({
    spec: () => props.animate,
    selected: () => props.selected,
  });
  return (
    <button
      ref={animate.ref}
      type="button"
      data-icon-paint={props.iconPaint}
      class={classes(
        "inline-button",
        props.selected && "selected",
        lineClass(props.line),
        props.class,
      )}
      aria-label={props.label}
      aria-pressed={
        props.selected === undefined ? undefined : props.selected ? "true" : "false"
      }
      title={props.showTitle ? props.label : undefined}
      disabled={props.disabled}
      onPointerEnter={animate.onPointerEnter}
      onClick={() => {
        animate.onClick();
        props.onClick();
      }}
    >
      {props.children}
    </button>
  );
}
