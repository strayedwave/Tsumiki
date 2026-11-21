import "./SettingSection.css";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

/** 設定画面の1グループ。見出し（アイコン付き）と、塗りのカード（`plain` なら塗りなし）。 */
export default function SettingSection(props: {
  title: string;
  icon?: JSX.Element;
  plain?: boolean;
  children: JSX.Element;
}) {
  return (
    <section class="setting-section">
      <h2>
        {props.icon}
        {props.title}
      </h2>
      <div class={props.plain ? "setting-plain" : "setting-card"}>
        {props.children}
      </div>
    </section>
  );
}

/** 設定の1行。左にラベル、右に操作。 */
export function SettingRow(props: {
  label: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  children: JSX.Element;
}) {
  return (
    <div
      class={classes("setting-row", lineClass(props.line))}
    >
      <span>{props.label}</span>
      {props.children}
    </div>
  );
}
