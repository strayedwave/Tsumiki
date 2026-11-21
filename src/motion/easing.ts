/**
 * アニメーションのイージング集。値はCSSの `<easing-function>` なので、
 * Web Animations API・CSS transition・animation のどれにもそのまま渡せる。
 * ライブラリは使わない（`linear()` で複数点の曲線も書ける）。
 */
export const easings = {
  linear: "linear",
  /** 標準。素早く動き出し、最後にゆっくり止まる */
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  ease: "ease",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** 急に出て、ぐっと減速する。大きな動きの強調用 */
  emphasized: "cubic-bezier(0.05, 0.7, 0.1, 1)",
  /** 終点で跳ね返る（0〜1の範囲に収まるので、gridの高さ変化でも潰れない） */
  bounce:
    "linear(0, 0.063, 0.25 18.2%, 1 36.4%, 0.813, 0.75 54.5%, 1 72.7%, 0.953, 0.938 81.8%, 1 90.9%, 0.984, 1)",
} as const;

export type EasingName = keyof typeof easings;

/**
 * 名前、またはCSSのイージング文字列から、実際に使える文字列を返す。
 * 実行環境が解釈できない値（古いWebViewの `linear()` など）は、`fallback` にする。
 */
export function resolveEasing(
  easing: EasingName | (string & {}),
  fallback: EasingName = "standard",
): string {
  const value = easing in easings ? easings[easing as EasingName] : easing;
  const supported =
    typeof CSS === "undefined" ||
    typeof CSS.supports !== "function" ||
    CSS.supports("animation-timing-function", value);
  return supported ? value : easings[fallback];
}
