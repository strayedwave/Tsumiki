import "./NumberSliderGroup.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 数値スライダー（`NumberSlider`）を縦に並べる、まとまり。HSB・RGB・CMYKなどの、チャンネルの束。
 *
 * - 子は `NumberSlider`（全幅の行）。行どうしの間隔は0で、積み重ねる。
 *   行の見た目（高さ・見出しの列・数値欄・溝）は、`NumberSlider` が持つ。
 *   モードが変わっても（HSB・RGB・CMYK）、同じ部品を並べるので、同じ見た目になる。
 * - `ariaLabel` は、まとまりの名前（`role="group"`）。
 * - `columns` を2にすると、2列で並べる（広いときだけ使う、など）。列の間には、
 *   縦線（`--border`）が入る。
 */
export default function NumberSliderGroup(props: {
  class?: string;
  ariaLabel?: string;
  columns?: 1 | 2;
  children: JSX.Element;
}) {
  return (
    <div
      class={classes("number-slider-group", props.class)}
      role="group"
      aria-label={props.ariaLabel}
      data-columns={props.columns === 2 ? "2" : undefined}
    >
      {props.children}
    </div>
  );
}
