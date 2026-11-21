import "./StatusBar.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

/**
 * 画面下端のステータスバー。左に状態の表示、右に操作ボタン（`children`）。
 * `kind` は `data-status-kind` として出る（状態ごとの色分けなど、CSSで使う）。
 */
export default function StatusBar(props: {
  icon?: JSX.Element;
  text: string;
  title?: string;
  kind?: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  children?: JSX.Element;
}) {
  return (
    <footer
      class={classes("statusbar", lineClass(props.line))}
    >
      <span class="status" title={props.title} data-status-kind={props.kind}>
        {props.icon}
        <span>{props.text}</span>
      </span>
      {props.children}
    </footer>
  );
}
