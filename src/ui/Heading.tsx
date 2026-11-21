import "./Heading.css";
import "./heading-actions.css";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * 見出しと説明が一体になったブロック（スクリプトの1単位など）。
 * 左にアイコン（任意）、中に「見出し（太字）＋説明（小さく薄く）」。
 * `actions` にボタンやドロップダウンを1つ、またはフラグメントで複数渡せる。
 *
 * - `onClick` を渡すと、アイコン・見出し・説明が1つのボタンになる。
 *   右側の操作は独立したまま。見出しを操作しない場合は `onClick` を省略する。
 * - 見出し・説明は、1行で、はみ出す分は「…」にする。
 * - アイコンは持たない。呼び出し側が渡す。
 * - 並べる位置・外側の余白は、置く側が決める。自分の余白は、上下 `--space-2`、左右 `--ui-pad-x`。
 * - `label` は、ボタンのときの `aria-label`。`tooltip` は `title`。
 */
export default function Heading(props: {
  title: JSX.Element;
  description?: JSX.Element;
  icon?: JSX.Element;
  actions?: JSX.Element;
  /** 右側の操作。既存の利用箇所との互換用。新規コードでは `actions` を使用する。 */
  trailing?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  class?: string;
}) {
  const actions = () => props.actions ?? props.trailing;
  const content = (
    <>
      {props.icon}
      <span class="ui-heading-text">
        <strong>{props.title}</strong>
        {props.description !== undefined && <small>{props.description}</small>}
      </span>
    </>
  );
  const main = (className: string) =>
    props.onClick ? (
      <button
        type="button"
        class={className}
        title={props.tooltip}
        aria-label={props.label}
        disabled={props.disabled}
        onClick={() => props.onClick?.()}
      >
        {content}
      </button>
    ) : (
      <div class={className} title={props.tooltip}>
        {content}
      </div>
    );
  return (
    <>
      {actions() ? (
        <div class={classes("ui-heading ui-heading-with-actions", props.class)}>
          {main("ui-heading-main")}
          <div class="ui-heading-actions">{actions()}</div>
        </div>
      ) : (
        main(classes("ui-heading", props.class))
      )}
    </>
  );
}
