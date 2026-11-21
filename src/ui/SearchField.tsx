import "./SearchField.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

/** 検索欄。入力があるときだけ、消去ボタンが出る。アイコンは呼び出し側が渡す。 */
export default function SearchField(props: {
  icon: JSX.Element;
  clearIcon: JSX.Element;
  clearLabel: string;
  /** `aria-label` とプレースホルダーに使う */
  label: string;
  /** ツールチップ */
  help?: string;
  value: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  onChange: (value: string) => void;
}) {
  return (
    <label
      class={classes("search-field", lineClass(props.line))}
    >
      {props.icon}
      <input
        aria-label={props.label}
        placeholder={props.label}
        title={props.help}
        value={props.value}
        onInput={(e) => props.onChange(e.target.value)}
      />
      {props.value && (
        <button
          type="button"
          aria-label={props.clearLabel}
          onClick={() => props.onChange("")}
        >
          {props.clearIcon}
        </button>
      )}
    </label>
  );
}
