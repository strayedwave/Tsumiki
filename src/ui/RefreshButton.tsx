import type { JSX } from "@solidjs/web";
import type { AnimateSpec } from "../motion";
import IconButton from "./IconButton";
import type { IconPaint } from "./icon-paint";
import type { Line } from "./line";

/** 既定の動き: `busy` の間、アイコンが一定の速さで回る */
const SPIN: AnimateSpec = {
  preset: "spin",
  trigger: "busy",
  easing: "linear",
  duration: 1000,
};

/**
 * 更新（再読み込み）ボタン。アイコンは `icon` で渡す（ライブラリは持たない）。
 *
 * - `busy` の間は、アイコンが回り、`aria-busy` になる。押せなくするかは、`disabled` で決める。
 *   `prefers-reduced-motion: reduce` では回さない。動きは `animate` で変えられる（`motion/animate.ts`）。
 * - `bare` を付けると、`IconButton` の標準の見た目を付けない（`class` で決める）。
 * - ラベルは `aria-label`。`showTitle` でツールチップにも出す。
 */
export default function RefreshButton(props: {
  label: string;
  icon: JSX.Element;
  showTitle?: boolean;
  busy?: boolean;
  animate?: AnimateSpec;
  /** アイコンの描き方: 縁だけ（既定）/ 塗りだけ / 塗り+縁 */
  iconPaint?: IconPaint;
  bare?: boolean;
  disabled?: boolean;
  class?: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  onClick: () => void;
}) {
  return (
    <IconButton
      line={props.line}
      class={["refresh-button", props.busy ? "is-busy" : "", props.class]
        .filter(Boolean)
        .join(" ")}
      label={props.label}
      showTitle={props.showTitle}
      bare={props.bare}
      busy={props.busy}
      animate={props.animate ?? SPIN}
      iconPaint={props.iconPaint}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.icon}
    </IconButton>
  );
}
