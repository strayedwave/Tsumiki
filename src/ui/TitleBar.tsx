import "./TitleBar.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

/**
 * タイトルバー。左にアイコンとタイトル、右にウィンドウ操作ボタン（`children`）。
 * ボタン以外を押して動かしたとき（左ボタン）に `onDragStart` が呼ばれる。
 * アイコン・ボタンの中身は、呼び出し側が渡す。
 */
export default function TitleBar(props: {
  icon?: JSX.Element;
  title: string;
  onDragStart?: () => void;
  /** 縁の線（既定は線なし） */
  line?: Line;
  children?: JSX.Element;
}) {
  return (
    <header
      class={classes("titlebar", lineClass(props.line))}
      onMouseDown={(e) => {
        if (e.button === 0 && !(e.target as HTMLElement).closest("button")) {
          props.onDragStart?.();
        }
      }}
    >
      {props.icon}
      <strong>{props.title}</strong>
      <div class="window-controls">{props.children}</div>
    </header>
  );
}

/**
 * ウィンドウ操作ボタン。`kind` で見た目が決まる
 * （`close` は押したときに赤くなる、`pin` は `pressed` で状態を示す）。
 * `showTitle` を付けると、ラベルをツールチップにも出す。
 */
export function WindowButton(props: {
  kind: "pin" | "minimize" | "close";
  label: string;
  showTitle?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: JSX.Element;
}) {
  return (
    <button
      type="button"
      class={`${props.kind}-button`}
      aria-label={props.label}
      title={props.showTitle ? props.label : undefined}
      aria-pressed={
        props.pressed === undefined ? undefined : props.pressed ? "true" : "false"
      }
      disabled={props.disabled}
      onClick={() => props.onClick()}
    >
      {props.children}
    </button>
  );
}
