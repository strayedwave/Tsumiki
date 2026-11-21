import "./SegmentedControl.css";
import { createEffect, onCleanup } from "solid-js";
import type { JSX } from "@solidjs/web";
import { type EasingName, resolveEasing } from "../motion";
import { type Line, classes, lineClass } from "./line";

export interface SegmentOption<T extends string> {
  value: T;
  label: JSX.Element;
  icon?: JSX.Element;
}

/**
 * 丸いトラックの中で、選択項目の塗りが、選んだ項目へ滑って移る切り替え。
 *
 * - `easing`（`motion` のイージング名、またはCSSの値）と `duration`（ms）で、滑り方を決める。
 *   `prefers-reduced-motion: reduce` では、滑らずに切り替わる。
 * - 最初に表示するとき、表示が隠れていた状態から現れるとき、大きさが変わるときは、
 *   滑らずに、その場へ置く。
 */
export default function SegmentedControl<T extends string>(props: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** 縁の線（既定は線なし） */
  line?: Line;
  /** 塗りが滑るときのイージング。既定は `standard` */
  easing?: EasingName | (string & {});
  /** 塗りが滑る長さ（ms）。既定は250 */
  duration?: number;
}) {
  let root!: HTMLDivElement;
  let thumb!: HTMLSpanElement;

  /** 選択中の項目の位置・大きさへ、塗りを合わせる。`animated` でなければ、滑らせずに置く */
  const place = (animated: boolean) => {
    const selected = root.querySelector<HTMLElement>(
      'button[aria-pressed="true"]',
    );
    if (!selected || selected.offsetWidth === 0) {
      // 隠れている（大きさが測れない）間は、塗りを出さない。ボタン自身の塗りで代わる
      delete root.dataset.thumb;
      delete root.dataset.animate;
      return;
    }
    const wasPlaced = "thumb" in root.dataset;
    const slide = animated && wasPlaced;
    if (!slide) delete root.dataset.animate;
    thumb.style.width = `${selected.offsetWidth}px`;
    thumb.style.height = `${selected.offsetHeight}px`;
    thumb.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`;
    root.dataset.thumb = "";
    if (!slide) {
      // 置いた位置を確定させてから、次の変化は滑らせる
      void thumb.offsetWidth;
      requestAnimationFrame(() => {
        if ("thumb" in root.dataset) root.dataset.animate = "";
      });
    } else {
      root.dataset.animate = "";
    }
  };

  createEffect(
    () => props.value,
    () => place(true),
  );
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => place(false));
    queueMicrotask(() => {
      observer.observe(root);
      for (const button of root.querySelectorAll("button")) {
        observer.observe(button);
      }
    });
    onCleanup(() => observer.disconnect());
  }

  return (
    <div
      ref={root}
      class={classes("segments", lineClass(props.line))}
      role="group"
      aria-label={props.ariaLabel}
      style={{
        "--segments-duration": `${props.duration ?? 250}ms`,
        "--segments-easing": resolveEasing(props.easing ?? "standard"),
      }}
    >
      <span ref={thumb} class="segments-thumb" aria-hidden="true" />
      {props.options.map((option) => (
        <button
          type="button"
          aria-pressed={props.value === option.value ? "true" : "false"}
          onClick={() => props.onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
