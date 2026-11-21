import "./Dropdown.css";
import type { FieldLabelProps } from "./FormField";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

export interface DropdownOption {
  value: string;
  label: string;
  /** ツールチップ（無効な理由など） */
  title?: string;
  disabled?: boolean;
}

/**
 * ドロップダウン（標準の `<select>`）。選択肢の一覧は、OSの標準の表示を使う。
 *
 * - `placeholder` を渡すと、値が空（`""`）のときに出る、選べない先頭の項目になる。
 *   選択前は、文字が薄くなる。
 * - `trailing` は、選択欄の右隣に置く要素（更新ボタンなど）。
 * - 矢印は部品が持たない。CSS変数 `--select-chevron`（`url(...)` など）で渡す。
 * - `class` は、外側の要素に付く（`dropdown` に追加）。
 * - 説明付きの選択肢が要るときは、`Select`（独自の一覧）を使う。
 */
export default function Dropdown(
  props: FieldLabelProps & {
    title?: string;
    value: string;
    options: readonly DropdownOption[];
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    /** 縁の線（既定は線なし） */
    line?: Line;
    trailing?: JSX.Element;
    onChange: (value: string) => void;
  },
) {
  return (
    <div class={classes("dropdown", lineClass(props.line), props.class)}>
      <select
        id={props.field?.id}
        aria-label={props.field ? undefined : props.label}
        aria-labelledby={props.field?.["aria-labelledby"]}
        aria-invalid={props.field?.["aria-invalid"]}
        aria-describedby={props.field?.["aria-describedby"]}
        required={props.field?.required}
        title={props.title}
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {props.placeholder !== undefined && (
          <option value="" disabled>
            {props.placeholder}
          </option>
        )}
        {props.options.map((option) => (
          <option
            value={option.value}
            title={option.title}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {props.trailing}
    </div>
  );
}
