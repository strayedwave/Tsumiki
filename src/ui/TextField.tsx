import "./TextField.css";
import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 1行の入力欄。塗りだけの、角丸の欄で、文字は中央に置く。
 *
 * - `size`: `md`（既定）は標準の行の高さ、`lg` は高さ48pxで、文字も大きい（キーの表示など）。
 * - その他の属性（`value`、`placeholder`、`readonly`、`onInput`、`onKeyDown` など）は、
 *   そのまま `<input>` に渡る。
 */
export default function TextField(
  props: {
    size?: "md" | "lg";
    class?: string;
  } & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "class" | "size">,
) {
  const rest = omit(props, "size", "class");
  return (
    <input
      type="text"
      {...rest}
      class={classes(
        "ui-text-field",
        props.size === "lg" && "ui-text-field-lg",
        props.class,
      )}
    />
  );
}
