import "./Tabs.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";
import { nextTabIndex } from "./tab-navigation";

export interface TabOption<T extends string> {
  value: T;
  label: JSX.Element;
  id?: string;
  panelId?: string;
}

/**
 * タブの切り替え（`role="tablist"`）。選んだタブは `aria-selected` と、アクセント色の塗りで示す。
 *
 * - `orientation`: `horizontal`（既定）は横並び、`vertical` は縦に積む。
 *   タブの間には、`--border` の細い線が入る。
 * - 置く場所（右端に寄せる、枠の高さいっぱいに広げる、など）は、置く側が `class` で決める。
 * - 切り替わる中身は、この部品は持たない（`value` を見て、置く側が出し分ける）。
 */
export default function Tabs<T extends string>(props: {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  orientation?: "horizontal" | "vertical";
  ariaLabel?: string;
  class?: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
}) {
  const onKeyDown = (
    event: KeyboardEvent & { currentTarget: HTMLDivElement },
  ) => {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        ':scope > [role="tab"]',
      ),
    );
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    const next = nextTabIndex(
      event.key,
      current,
      tabs.length,
      props.orientation,
    );
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    if (next !== current) props.onChange(props.options[next].value);
  };
  const selectedIndex = () =>
    props.options.findIndex((option) => option.value === props.value);
  return (
    <div
      class={classes("ui-tabs", lineClass(props.line), props.class)}
      role="tablist"
      aria-label={props.ariaLabel}
      aria-orientation={props.orientation ?? "horizontal"}
      data-orientation={props.orientation ?? "horizontal"}
      onKeyDown={onKeyDown}
    >
      {props.options.map((option, index) => (
        <button
          type="button"
          role="tab"
          id={option.id}
          aria-controls={option.panelId}
          aria-selected={props.value === option.value ? "true" : "false"}
          tabindex={index === Math.max(0, selectedIndex()) ? 0 : -1}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
