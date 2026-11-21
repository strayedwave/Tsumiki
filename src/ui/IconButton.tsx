import "./IconButton.css";
import "./icon-paint.css";
import type { JSX } from "@solidjs/web";
import { type AnimateSpec, useAnimate } from "../motion";
import type { IconPaint } from "./icon-paint";
import { type Line, classes, lineClass } from "./line";

/**
 * アイコンだけのボタン。アイコンは `children` で渡す（ライブラリは持たない）。
 * `label` は `aria-label`。`showTitle` を付けると、同じ文字をツールチップにも出す。
 * `bare` を付けると、標準の見た目（`icon-button`）を付けない。見た目は `class` で決める。
 * `busy` は `aria-busy` になる。
 * `animate` を渡すと、アイコン（またはボタン）が動く（`motion/animate.ts`）。
 * `busy` の間だけ繰り返すには、`trigger: "busy"` にする。
 */
export default function IconButton(props: {
  label: string;
  showTitle?: boolean;
  bare?: boolean;
  busy?: boolean;
  animate?: AnimateSpec;
  /** アイコンの描き方: 縁だけ（既定）/ 塗りだけ / 塗り+縁（`icon-paint.css`） */
  iconPaint?: IconPaint;
  class?: string;
  /** 縁の線（既定は線なし）。隣の部品との境目には `start` / `end` */
  line?: Line;
  disabled?: boolean;
  onClick: () => void;
  children: JSX.Element;
}) {
  const animate = useAnimate({
    spec: () => props.animate,
    busy: () => props.busy,
  });
  return (
    <button
      ref={animate.ref}
      type="button"
      data-icon-paint={props.iconPaint}
      class={
        classes(
          !props.bare && "icon-button",
          lineClass(props.line),
          props.class,
        ) || undefined
      }
      aria-label={props.label}
      aria-busy={props.busy === undefined ? undefined : props.busy ? "true" : "false"}
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
