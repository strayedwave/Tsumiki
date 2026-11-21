import "./Switch.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

/** オン・オフのスイッチ行。アイコンは呼び出し側が渡す。 */
export default function Switch(props: {
  label: string;
  icon?: JSX.Element;
  checked: boolean;
  disabled?: boolean;
  /** 縁の線（既定は線なし） */
  line?: Line;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      class={classes("toggle-row", lineClass(props.line))}
    >
      {props.icon}
      <span>{props.label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
    </label>
  );
}
