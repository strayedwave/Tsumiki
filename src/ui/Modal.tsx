import "./Modal.css";
import { createEffect } from "solid-js";
import type { JSX } from "@solidjs/web";
import { classes } from "./line";

/**
 * Native modal isolation plus explicit Tab wrapping for the embedded WebView.
 * Use `variant="glass"` for a translucent surface that follows the color scheme.
 *
 * With `anchor`, the dialog is not a native modal: it opens inside an overlay
 * that starts `anchor()` px below the top of the window, so everything above
 * that line (the title bar and its drag region) stays usable and unblurred.
 */
export default function Modal(props: {
  role: "dialog" | "alertdialog";
  labelledBy: string;
  class?: string;
  variant?: "glass";
  anchor?: () => number;
  onDismiss: () => void;
  children: JSX.Element;
}) {
  const ref = { current: null as HTMLDialogElement | null };
  const overlay = { current: null as HTMLDivElement | null };
  const inline = props.anchor !== undefined;
  createEffect(
    () => undefined,
    () => {
      const dialog = ref.current!;
      const opener = document.activeElement;
      // Measured once, after the rest of the page is laid out.
      if (overlay.current) {
        overlay.current.style.top = `${Math.max(
          0,
          Math.ceil(props.anchor!()),
        )}px`;
      }
      if (inline) dialog.show();
      else dialog.showModal();
      const autofocus = dialog.querySelector<HTMLElement>(
        "[data-autofocus]:not(:disabled)",
      );
      if (autofocus) autofocus.focus();
      else if (!dialog.contains(document.activeElement)) dialog.focus();
      return () => {
        dialog.close();
        if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      };
    },
  );
  const dialog = (
    <dialog
      ref={(element) => (ref.current = element)}
      class={classes(
        "dialog",
        props.variant === "glass" && "dialog--glass",
        props.class,
      )}
      role={props.role}
      aria-modal="true"
      aria-labelledby={props.labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        props.onDismiss();
      }}
      onKeyDown={(event) => {
        if (event.defaultPrevented) return;
        if (inline && event.key === "Escape") {
          event.preventDefault();
          props.onDismiss();
          return;
        }
        if (event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const targets = [
          ...dialog.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]",
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const index = targets.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey
          ? index <= 0
            ? targets.length - 1
            : index - 1
          : (index + 1) % targets.length;
        event.preventDefault();
        (targets[next] ?? dialog).focus();
      }}
    >
      {props.children}
    </dialog>
  );
  if (!inline) return dialog;
  return (
    <div
      ref={(element) => (overlay.current = element)}
      class="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) props.onDismiss();
      }}
    >
      {dialog}
    </div>
  );
}
