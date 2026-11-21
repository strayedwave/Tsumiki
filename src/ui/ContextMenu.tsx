import "./ContextMenu.css";
import { classes } from "./line";
import { createEffect, createSignal } from "solid-js";
import { Portal } from "@solidjs/web";

export interface MenuItem {
  id: string;
  label: string;
}

/**
 * 右クリックメニュー。画面の端に収まるよう位置を補正し、矢印キーで項目を移る。
 * 外側のクリック・リサイズ・ウィンドウの非アクティブ化・Escape・Tab で閉じ、
 * 閉じたあとは、開く前にフォーカスのあった要素へ戻す。
 * `x` `y` は画面上の座標。ルートの `zoom` で表示倍率を変えている場合は、補正する。
 */
export default function ContextMenu(props: {
  label: string;
  items: readonly MenuItem[];
  x: number;
  y: number;
  class?: string;
  close: () => void;
  onSelect: (id: string) => void;
}) {
  const menu = { current: null as HTMLDivElement | null };
  const zoom = Number(getComputedStyle(document.documentElement).zoom) || 1;
  const [position, setPosition] = createSignal({ left: props.x, top: props.y });
  createEffect(
    () => [props.x, props.y, props.close, zoom],
    () => {
      const element = menu.current!;
      const opener = document.activeElement;
      const bounds = element.getBoundingClientRect();
      setPosition({
        left:
          Math.max(4, Math.min(props.x, window.innerWidth - bounds.width - 4)) /
          zoom,
        top:
          Math.max(
            4,
            Math.min(props.y, window.innerHeight - bounds.height - 4),
          ) / zoom,
      });
      (element.querySelector<HTMLButtonElement>("button") ?? element).focus();
      const outside = (event: PointerEvent) => {
        if (!element.contains(event.target as Node)) props.close();
      };
      const dismiss = () => props.close();
      document.addEventListener("pointerdown", outside, true);
      window.addEventListener("resize", dismiss);
      window.addEventListener("blur", dismiss);
      return () => {
        document.removeEventListener("pointerdown", outside, true);
        window.removeEventListener("resize", dismiss);
        window.removeEventListener("blur", dismiss);
        if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      };
    },
  );
  return (
    <Portal mount={document.body}>
      <div
        ref={(element) => (menu.current = element)}
        role="menu"
        tabindex={-1}
        aria-label={props.label}
        class={classes("gui-context-menu", props.class)}
        style={{
          left: `${position().left}px`,
          top: `${position().top}px`,
          "max-width": `${(window.innerWidth - 8) / zoom}px`,
        }}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          const buttons = [...menu.current!.querySelectorAll("button")];
          const current = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (["Escape", "Tab"].includes(event.key)) {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
            }
            props.close();
          } else if (
            ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
          ) {
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : (current +
                      (event.key === "ArrowUp" ? -1 : 1) +
                      buttons.length) %
                    buttons.length;
            buttons[next]?.focus();
          }
        }}
      >
        {props.items.map((item) => (
          <button
            type="button"
            role="menuitem"
            tabindex={-1}
            onClick={() => {
              props.close();
              props.onSelect(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Portal>
  );
}
