import "./Text.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 文字だけを表示する部品。全幅で、自分の余白（書く方向＝左右と、上下）を持つ。
 * 中身（開閉の中身、カードの中など）は、上下の余白を持たず、文字は、この部品が余白を持って置く。
 *
 * - `muted` を付けると、薄い色（補足の説明など）になる。
 * - 長い文字は折り返す。
 */
export default function Text(props: {
  muted?: boolean;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <p class={classes("ui-text", props.muted && "ui-text-muted", props.class)}>
      {props.children}
    </p>
  );
}
