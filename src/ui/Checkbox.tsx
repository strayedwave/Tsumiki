import "./Checkbox.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * チェックボックスと文字を組にした、1つの項目。押せる範囲は、文字も含む。
 * 並べる間隔は、置く側が決める。
 */
export default function Checkbox(props: {
  checked: boolean;
  disabled?: boolean;
  class?: string;
  onChange: (checked: boolean) => void;
  children: JSX.Element;
}) {
  return (
    <label class={classes("ui-checkbox", props.class)}>
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      {props.children}
    </label>
  );
}
