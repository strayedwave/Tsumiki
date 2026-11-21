import { createEffect, createSignal, onCleanup, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { type Collapse, createCollapse } from "./collapse";
import type { EasingName } from "./easing";
import "./collapse.css";

/**
 * フォルダ型UIの開閉をアニメーションさせる、使い回し用の枠（Solid用）。
 *
 * 見出しはこの外に置き、`open` だけを渡す。中身の見た目（余白・縦線など）は
 * `children` 側のクラスで決める。動きの仕組みと制約は `collapse.ts` を参照。
 *
 * - 閉じ切るまで中身は残る。閉じ始めた時点で `inert` になるので、
 *   操作・フォーカス・読み上げの対象にはならない。
 * - `unmountWhenClosed` を付けると、閉じ切った時点で `children` も破棄する。
 *   行が多いツリーなど、閉じている間は描画したくない場合に使う。
 *   付けない場合は、閉じても中身の状態（入力値など）を保つ。
 * - `easing` は `easing.ts` の名前、またはCSSのイージング文字列。
 *   `duration` はミリ秒。どちらもアニメーションを始める時点の値を使う。
 */
export default function Collapsible(props: {
  open: boolean;
  id?: string;
  easing?: EasingName | (string & {});
  duration?: number;
  unmountWhenClosed?: boolean;
  children: JSX.Element;
}) {
  // 初期状態だけを読む（以後の変化は下の effect が追う）
  const initiallyOpen = untrack(() => props.open);
  const [present, setPresent] = createSignal(initiallyOpen);
  const ref = { current: null as HTMLDivElement | null };
  let collapse: Collapse | undefined;

  createEffect(
    () => props.open,
    (open) => {
      collapse ??= createCollapse(ref.current!, initiallyOpen, () => ({
        duration: props.duration,
        easing: props.easing,
        onSettled: (settledOpen) => setPresent(settledOpen),
      }));
      if (open) setPresent(true);
      collapse.set(open);
    },
  );
  onCleanup(() => collapse?.dispose());

  return (
    <div
      ref={(element) => (ref.current = element)}
      id={props.id}
      class="motion-collapse"
      hidden={!initiallyOpen}
    >
      <div class="motion-collapse-clip">
        {(!props.unmountWhenClosed || present()) && props.children}
      </div>
    </div>
  );
}
