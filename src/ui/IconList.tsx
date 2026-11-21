import "./IconList.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 見出し（左）と、アイコンのボタンの並び（右）を、1つにまとめた、インラインの要素。
 * 見出しの幅は、`--ui-icon-list-label-width`（既定は、文字の幅）で、そろえられる。
 *
 * - 並べるボタンは `children`（`IconButton` など）。アイコンは、呼び出し側が渡す。
 * - `ariaLabel` を渡すと、まとまりの名前（`role="group"`）になる。
 * - 置く場所・並べ方は、置く側が決める（`InlineFrame` の中に置くと、行ごとに詰まる）。
 */
export default function IconList(props: {
  label: JSX.Element;
  ariaLabel?: string;
  class?: string;
  children: JSX.Element;
}) {
  return (
    <div
      class={classes("ui-icon-list", props.class)}
      role="group"
      aria-label={props.ariaLabel}
    >
      <span class="ui-icon-list-label">{props.label}</span>
      <div class="ui-icon-list-items">{props.children}</div>
    </div>
  );
}
