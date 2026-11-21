/**
 * 動き（アニメーション）の共通部品。アプリ本体には依存しない。
 *
 * - `Collapsible`: 開閉の枠（Solid）
 * - `createCollapse`: 開閉の中核（DOMだけ。Solid以外からも使える）
 * - `useAnimate` / `createAnimator`: ボタンなどの小さな動き（回転・3D回転・スライド・浮き上がり・明滅）
 * - `easings` / `resolveEasing`: イージング集
 */
export { default as Collapsible } from "./Collapsible";
export {
  COLLAPSE_DURATION_MS,
  COLLAPSE_EASING,
  createCollapse,
} from "./collapse";
export type { Collapse, CollapseOptions } from "./collapse";
export { buildAnimation, createAnimator } from "./animate";
export type {
  AnimatePreset,
  AnimateSpec,
  AnimateTrigger,
  Animator,
  Direction,
} from "./animate";
export { useAnimate } from "./useAnimate";
export { easings, resolveEasing } from "./easing";
export type { EasingName } from "./easing";
