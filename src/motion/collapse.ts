import { type EasingName, resolveEasing } from "./easing";

/** 既定の長さとイージング */
export const COLLAPSE_DURATION_MS = 200;
export const COLLAPSE_EASING: EasingName = "standard";

export interface CollapseOptions {
  /** ミリ秒。既定は `COLLAPSE_DURATION_MS` */
  duration?: number;
  /** `easing.ts` の名前、またはCSSのイージング文字列。既定は `COLLAPSE_EASING` */
  easing?: EasingName | (string & {});
  /** 開閉が落ち着いたとき（動かさずに切り替えた場合も含む）に呼ばれる */
  onSettled?: (open: boolean) => void;
}

export interface Collapse {
  /** 開閉する。今と同じ状態なら何もしない。動いている途中なら、その位置から反対向きに動く */
  set(open: boolean): void;
  /** 動いているアニメーションを止める。要素は今の状態のまま残る */
  dispose(): void;
}

/**
 * 要素の開閉アニメーション（フレームワーク非依存）。
 *
 * `element` は `motion-collapse` クラスを持つ、直下に `motion-collapse-clip` を
 * 1つ持つ要素にする（`collapse.css`）。高さは測らず、`grid-template-rows` を
 * 0fr ↔ 1fr で動かす。
 *
 * - 閉じ始めた時点で `inert`、閉じ切ると `hidden` になる。
 * - `prefers-reduced-motion: reduce`、または Web Animations API がない環境では、
 *   動かさずに即座に切り替える。
 * - 開くときも閉じるときも、時間の順に同じイージングで動く（閉じるときも、素早く動き出して、
 *   最後にゆっくり止まる）。途中で向きが変わったら、その時点の高さから、残りの距離だけ動く。
 * - `grid` の高さは中身の高さで頭打ちになるため、1を超えるイージング
 *   （オーバーシュート）は効かない。
 * - `options` は、アニメーションを始める時点で読む。
 */
export function createCollapse(
  element: HTMLElement,
  initiallyOpen: boolean,
  options: () => CollapseOptions = () => ({}),
): Collapse {
  let shown = initiallyOpen;
  let animation: Animation | undefined;
  /** 動いている区間の、始まりと終わりの行の高さ（0〜1の fr） */
  let from = 0;
  let to = 0;

  /** いまの行の高さ（0〜1）。動いている途中なら、イージングを通した、その時点の値 */
  const currentRows = () => {
    if (!animation) return shown ? 1 : 0;
    const progress = animation.effect?.getComputedTiming().progress ?? 1;
    return from + (to - from) * progress;
  };

  const release = () => {
    if (animation) animation.onfinish = null;
    animation?.cancel();
    animation = undefined;
    delete element.dataset.animating;
  };
  const settle = () => {
    release();
    if (!shown) element.hidden = true;
    options().onSettled?.(shown);
  };

  return {
    set(open) {
      if (open === shown) return;
      // 動き出す高さは、状態を切り替える前に読む(切り替えたあとだと、行き先の高さになる)
      const start = currentRows();
      shown = open;
      element.inert = !open;
      if (open) element.hidden = false;
      const instant =
        typeof element.animate !== "function" ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (instant) {
        settle();
        return;
      }
      // 開くときも閉じるときも、同じ向き（時間の順）に、同じイージングで動かす。
      // 途中で向きが変わったら、いまの高さから、残りの距離だけを動かす。
      release();
      const target = open ? 1 : 0;
      const current = options();
      const full = current.duration ?? COLLAPSE_DURATION_MS;
      from = start;
      to = target;
      animation = element.animate(
        { gridTemplateRows: [`${start}fr`, `${target}fr`] },
        {
          duration: Math.max(1, full * Math.abs(target - start)),
          easing: resolveEasing(current.easing ?? COLLAPSE_EASING),
          fill: "both",
        },
      );
      animation.onfinish = settle;
      element.dataset.animating = "";
    },
    dispose: release,
  };
}
