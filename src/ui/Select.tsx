import "./Select.css";
import {
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
} from "solid-js";
import type { FieldLabelProps } from "./FormField";
import type { JSX } from "@solidjs/web";
import { type Line, classes, lineClass } from "./line";

type Option = { value: string; label: string; description: string };
type Props = FieldLabelProps & {
  value: string;
  disabled?: boolean;
  options: readonly Option[];
  /** 開く向きを示す表示（矢印など）。アイコンは呼び出し側が渡す */
  indicator: JSX.Element;
  /** 縁の線（既定は線なし） */
  line?: Line;
  popupBoundary?: string;
  onChange: (value: string) => void;
};

/**
 * 選択肢ごとに説明が付く、独自のセレクト（コンボボックス）。
 * 矢印キー・Home/End で選べ、ホバーやフォーカスで説明を読み上げる。
 */
export default function Select(props: Props) {
  const id = createUniqueId();
  let root!: HTMLDivElement;
  let trigger!: HTMLButtonElement;
  const [open, setOpen] = createSignal(false);
  const [active, setActive] = createSignal(0);
  const [described, setDescribed] = createSignal<number | null>(null);
  const [triggerHovered, setTriggerHovered] = createSignal(false);
  const [opensUp, setOpensUp] = createSignal(false);
  createEffect(
    () => [open(), triggerHovered(), described()] as const,
    ([isOpen, isHovered]) => {
      const boundary = props.popupBoundary && root.closest(props.popupBoundary);
      if (!boundary || (!isOpen && !isHovered)) return;
      const updatePosition = () => {
        const popup = root.querySelector(
          ".color-mode-popup, .color-mode-help-closed",
        );
        if (!popup) return;
        const bounds = boundary.getBoundingClientRect();
        const anchor = root.getBoundingClientRect();
        const help = popup.querySelector(".color-mode-help");
        const height =
          popup.getBoundingClientRect().height +
          (help ? help.getBoundingClientRect().height + 6 : 0);
        const below = bounds.bottom - anchor.bottom;
        const above = anchor.top - bounds.top;
        setOpensUp(below < height + 8 && above > below);
      };
      const frame = requestAnimationFrame(updatePosition);
      const observer = new ResizeObserver(updatePosition);
      observer.observe(boundary);
      boundary.addEventListener("scroll", updatePosition);
      onCleanup(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        boundary.removeEventListener("scroll", updatePosition);
      });
    },
  );
  const selected = () =>
    Math.max(
      0,
      props.options.findIndex((option) => option.value === props.value),
    );
  const close = () => {
    setOpen(false);
    setDescribed(null);
    setTriggerHovered(false);
  };
  const outside = (event: PointerEvent) => {
    if (open() && !root.contains(event.target as Node)) close();
  };
  document.addEventListener("pointerdown", outside);
  onCleanup(() => document.removeEventListener("pointerdown", outside));
  createEffect(
    () => props.disabled,
    (disabled) => {
      if (disabled) close();
    },
  );
  const choose = (index: number) => {
    const option = props.options[index];
    if (!option) return;
    props.onChange(option.value);
    close();
    trigger.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      close();
      return;
    }
    if (
      !["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(
        event.key,
      )
    )
      return;
    if (event.key === "Escape" && !open()) return;
    if (props.options.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!open()) {
      setActive(selected());
      setDescribed(selected());
      setOpen(true);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      choose(active());
      return;
    }
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? props.options.length - 1
          : (active() +
              (event.key === "ArrowDown" ? 1 : -1) +
              props.options.length) %
            props.options.length;
    setActive(next);
    setDescribed(next);
  };
  return (
    <div
      class={classes(
        "color-mode-select",
        props.field && "color-mode-select--field",
        lineClass(props.line),
        opensUp() && "opens-up",
      )}
      ref={root}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          close();
      }}
    >
      {!props.field && <span>{props.label}</span>}
      <button
        ref={trigger}
        type="button"
        role="combobox"
        id={props.field?.id}
        aria-label={props.field ? undefined : props.label}
        aria-labelledby={props.field?.["aria-labelledby"]}
        aria-invalid={props.field?.["aria-invalid"]}
        aria-required={props.field?.required ? "true" : undefined}
        aria-haspopup="listbox"
        aria-expanded={open() ? "true" : "false"}
        aria-controls={open() ? `${id}-list` : undefined}
        aria-activedescendant={open() ? `${id}-${active()}` : undefined}
        aria-describedby={
          [
            props.field?.["aria-describedby"],
            !open() &&
              triggerHovered() &&
              props.options.length > 0 &&
              `${id}-help`,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        disabled={props.disabled}
        onKeyDown={onKeyDown}
        onPointerEnter={(event) => {
          if (!event.buttons && !props.disabled) setTriggerHovered(true);
        }}
        onPointerMove={(event) => {
          if (!event.buttons && !props.disabled && !open()) {
            setTriggerHovered(true);
          }
        }}
        onPointerLeave={() => setTriggerHovered(false)}
        onPointerDown={() => {
          setTriggerHovered(false);
          setDescribed(null);
        }}
        onClick={() => {
          if (open()) close();
          else if (props.options.length > 0) {
            setActive(selected());
            setDescribed(null);
            setOpen(true);
          }
        }}
      >
        <span>{props.options[selected()]?.label}</span>
        {props.indicator}
      </button>
      {open() && (
        <div class="color-mode-popup" onPointerLeave={() => setDescribed(null)}>
          <div
            id={`${id}-list`}
            role="listbox"
            aria-label={props.field ? undefined : props.label}
            aria-labelledby={props.field?.["aria-labelledby"]}
          >
            {props.options.map((option, index) => (
              <button
                type="button"
                role="option"
                id={`${id}-${index}`}
                aria-selected={option.value === props.value ? "true" : "false"}
                aria-description={option.description}
                aria-describedby={
                  described() === index ? `${id}-help` : undefined
                }
                class={index === active() ? "active" : undefined}
                tabindex={-1}
                onPointerMove={(event) => {
                  if (event.buttons) return;
                  setActive(index);
                  setDescribed(index);
                }}
                onPointerEnter={(event) => {
                  if (event.buttons) return;
                  setActive(index);
                  setDescribed(index);
                }}
                onPointerDown={() => setDescribed(null)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {described() !== null && (
            <div class="color-mode-help" role="tooltip" id={`${id}-help`}>
              {props.options[described()!]?.description}
            </div>
          )}
        </div>
      )}
      {!open() &&
        triggerHovered() &&
        !props.disabled &&
        props.options.length > 0 && (
          <div
            class="color-mode-help color-mode-help-closed"
            role="tooltip"
            id={`${id}-help`}
          >
            {props.options[selected()]?.description}
          </div>
        )}
    </div>
  );
}
