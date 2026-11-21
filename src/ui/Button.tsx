import "./Button.css";
import "./icon-paint.css";
import type { JSX } from "@solidjs/web";
import { type AnimateSpec, useAnimate } from "../motion";
import type { IconPaint } from "./icon-paint";
import { classes } from "./line";

/**
 * 文字のボタン。左にアイコン（任意）、右に文字。アイコンは `icon` で渡す（ライブラリは持たない）。
 *
 * - 塗りのカード状で、押せる範囲は文字より広い（自分の上下左右の余白を持つ）。
 * - 幅は中身に合わせる。並べる位置（右寄せなど）は、置く側が決める。
 * - アイコンだけのボタンは `IconButton`、行の中の小さなアイコンは `InlineButton`。
 * - `animate` を渡すと、アイコン（`icon` がなければボタン全体）が動く（`motion/animate.ts`）。
 */
export default function Button(props: {
  icon?: JSX.Element;
  animate?: AnimateSpec;
  /** アイコンの描き方: 縁だけ（既定）/ 塗りだけ / 塗り+縁（`icon-paint.css`） */
  iconPaint?: IconPaint;
  disabled?: boolean;
  class?: string;
  onClick: () => void;
  children: JSX.Element;
}) {
  const animate = useAnimate({ spec: () => props.animate });
  return (
    <button
      ref={animate.ref}
      type="button"
      data-icon-paint={props.iconPaint}
      class={classes("ui-button", props.class)}
      disabled={props.disabled}
      onPointerEnter={animate.onPointerEnter}
      onClick={() => {
        animate.onClick();
        props.onClick();
      }}
    >
      {props.icon}
      {props.children}
    </button>
  );
}
