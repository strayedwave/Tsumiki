import { createEffect, onCleanup } from "solid-js";
import { type AnimateSpec, type Animator, createAnimator } from "./animate";
import "./animate.css";

/**
 * ボタンなどに、`AnimateSpec`（`animate.ts`）の動きを付ける（Solid用）。
 * 返す `ref` と、2つのハンドラーを、ボタンに渡す。
 *
 * - `busy` / `selected` は、`trigger` が `busy` / `selected` のときだけ見る。
 * - 指定がない（`spec()` が `undefined`）ときは、何もしない。
 */
export function useAnimate(options: {
  spec: () => AnimateSpec | undefined;
  busy?: () => boolean | undefined;
  selected?: () => boolean | undefined;
}) {
  let animator: Animator | undefined;
  let first = true;
  let lastSelected: boolean | undefined;
  const trigger = () => options.spec()?.trigger ?? "click";

  createEffect(
    () => {
      const spec = options.spec();
      const kind = spec?.trigger ?? "click";
      return {
        spec,
        kind,
        busy: kind === "busy" ? !!options.busy?.() : false,
        selected: kind === "selected" ? !!options.selected?.() : undefined,
      };
    },
    (value) => {
      const initial = first;
      first = false;
      if (!animator) return;
      if (!value.spec) {
        animator.stop();
      } else if (value.kind === "loop") {
        animator.start(true);
      } else if (value.kind === "busy") {
        if (value.busy) animator.start(true);
        else animator.stop(true);
      } else if (value.kind === "mount") {
        if (initial) animator.start(false);
      } else if (value.kind === "selected") {
        if (!initial && value.selected !== lastSelected) animator.start(false);
        lastSelected = value.selected;
      }
    },
  );
  onCleanup(() => animator?.dispose());

  return {
    ref: (element: HTMLElement) => {
      animator = createAnimator(element, options.spec);
    },
    onClick: () => {
      if (trigger() === "click") animator?.start(false);
    },
    onPointerEnter: () => {
      if (trigger() === "hover") animator?.start(false);
    },
  };
}
