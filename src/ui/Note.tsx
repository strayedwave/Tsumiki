import "./Note.css";
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 短い注意書き・お知らせ（`role="status"`）。小さな文字で、折り返す。
 * `kind="warning"` で、警告の色になる。
 *
 * - `icon` は、文字の前に置く（呼び出し側が渡す。ライブラリは持たない）。
 * - その他の属性（`title`、`data-*` など）は、そのまま `<p>` に渡る。
 * - 左右の余白は、この部品が持つ（`--ui-pad-x`）。
 */
export default function Note(
  props: {
    kind?: "info" | "warning";
    icon?: JSX.Element;
    class?: string;
    children: JSX.Element;
  } & Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children">,
) {
  const rest = omit(props, "kind", "icon", "class", "children");
  return (
    <p
      role="status"
      {...rest}
      class={classes(
        "ui-note",
        props.kind === "warning" && "ui-note-warning",
        props.class,
      )}
    >
      {props.icon}
      {props.icon ? <span>{props.children}</span> : props.children}
    </p>
  );
}
