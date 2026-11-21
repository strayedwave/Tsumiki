import "./Disclosure.css";
import "./heading-actions.css";
import { createUniqueId } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Collapsible, type EasingName } from "../motion";
import { type Line, classes, lineClass } from "./line";

/**
 * フォルダ型UI。見出し（矢印・アイコン・ラベル）を押すと、中身が開閉する。
 *
 * 見出しボタンと中身の対応（`aria-expanded`・`aria-controls`・id）、
 * 開閉アニメーション、閉じている間の `inert` / `hidden` までをまとめて持つ。
 * 開閉の状態は持たない。`open` と `onToggle` で呼び出し側が管理する
 * （設定へ保存する、検索中は固定する、などを呼び出し側で決められるように）。
 *
 * アイコンは持たない。開閉を示す矢印は、プロダクトに合わせて `indicator` で渡す。
 *
 * 構造:
 * ```
 * <section class={class}>
 *   <button class={toggleClass}>indicator icon <span>label</span> trailing</button>
 *   <div id class="motion-collapse"> … <div class={bodyClass}>children</div> … </div>
 * </section>
 * ```
 * `actions` にボタンやドロップダウンを1つ、またはフラグメントで複数渡せる。
 * `actions` または `headingClass` を指定すると、見出しボタンと右側の操作を横に並べる。
 * この指定の有無は、最初の描画で決まる（途中で変えると、ボタンが作り直されて
 * フォーカスが外れるため）。
 */
export default function Disclosure(props: {
  open: boolean;
  onToggle: () => void;
  /** 見出しの文字 */
  label: JSX.Element;
  /** 開閉を示す表示（矢印など）。見出しボタンの先頭に置く。開閉のたびに呼ばれる */
  indicator: (open: boolean) => JSX.Element;
  /** 矢印とラベルの間に置くアイコン */
  icon?: JSX.Element;
  /** ラベルの後ろ（件数など）。見出しボタンの中に入る */
  trailing?: JSX.Element;
  /** 開閉ボタンから独立した右側の操作 */
  actions?: JSX.Element;
  /** 見出しボタンの右隣（ボタンの外）。`headingClass` が必要 */
  extra?: JSX.Element;
  /** 開閉を受け付けない（検索中など）。`aria-disabled` になり、`onToggle` は呼ばれない */
  locked?: boolean;
  class?: string;
  headingClass?: string;
  toggleClass?: string;
  /** 見出しの縁の線（既定は線なし）。`headingClass` があればその行、なければ見出しボタン */
  line?: Line;
  bodyClass?: string;
  /** 外側の `aria-label` */
  ariaLabel?: string;
  /** 外側の `aria-busy` */
  busy?: boolean;
  ref?: (element: HTMLElement) => void;
  /** 閉じ切ったら中身も破棄する。行が多いツリー向け。付けなければ中身の状態を保つ */
  unmountWhenClosed?: boolean;
  easing?: EasingName | (string & {});
  duration?: number;
  children: JSX.Element;
}) {
  const bodyId = createUniqueId();
  const wrapHeading = props.headingClass !== undefined || "actions" in props;
  const toggle = (
    <button
      type="button"
      class={
        classes(
          "ui-disclosure-toggle",
          props.toggleClass,
          !wrapHeading && lineClass(props.line),
        ) || undefined
      }
      aria-expanded={props.open ? "true" : "false"}
      aria-controls={bodyId}
      aria-disabled={props.locked ? "true" : undefined}
      onClick={() => {
        if (!props.locked) props.onToggle();
      }}
    >
      {props.indicator(props.open)}
      {props.icon}
      <span>{props.label}</span>
      {props.trailing}
    </button>
  );
  return (
    <section
      class={props.class}
      aria-label={props.ariaLabel}
      aria-busy={
        props.busy === undefined ? undefined : props.busy ? "true" : "false"
      }
      ref={(element) => props.ref?.(element)}
    >
      {wrapHeading ? (
        <div
          class={classes(
            "ui-disclosure-heading",
            props.headingClass,
            lineClass(props.line),
          )}
        >
          {toggle}
          {props.actions ? (
            <div class="ui-heading-actions">{props.actions}</div>
          ) : (
            props.extra
          )}
        </div>
      ) : (
        toggle
      )}
      <Collapsible
        id={bodyId}
        open={props.open}
        unmountWhenClosed={props.unmountWhenClosed}
        easing={props.easing}
        duration={props.duration}
      >
        <div class={props.bodyClass}>{props.children}</div>
      </Collapsible>
    </section>
  );
}
