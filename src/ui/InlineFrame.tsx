import "./InlineFrame.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * インラインの要素（ボタン・文字・見出し付きのアイコンの組など）を、行ごとに詰めて並べる枠。
 * 横に収まらなければ、次の行へ折り返す。行の中は、縦の中央にそろえる。
 *
 * - 枠が、自分の余白を持つ（上下 `--space-2`、左右 `--ui-pad-x`）。
 * - 要素どうしの間隔は、横が `--space-3`、行の間が `--space-1`。
 * - 幅いっぱいを取る要素（`Disclosure`・検索欄など）は、入れない。
 */
export default function InlineFrame(props: {
  class?: string;
  children: JSX.Element;
}) {
  return (
    <div class={classes("ui-inline-frame", props.class)}>{props.children}</div>
  );
}

/**
 * `InlineFrame` の中で、ここから次の行にする目印（改行）。見えない。
 */
export function InlineBreak() {
  return <span class="ui-inline-break" aria-hidden="true" />;
}
