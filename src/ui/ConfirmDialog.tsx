import { createUniqueId } from "solid-js";
import Modal from "./Modal";

/**
 * 確認ダイアログ。取り消しと実行の2択。`danger` なら実行ボタンを赤で塗る。
 * 実行中（`pending`）は、閉じる・押すことを受け付けない。
 */
export default function ConfirmDialog(props: {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  anchor?: () => number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = createUniqueId();
  return (
    <Modal
      role="alertdialog"
      anchor={props.anchor}
      labelledBy={titleId}
      onDismiss={() => {
        if (!props.pending) props.onCancel();
      }}
    >
      <h2 id={titleId}>{props.title}</h2>
      <p>{props.body}</p>
      <div class="dialog-actions">
        <button
          type="button"
          data-autofocus
          disabled={props.pending}
          onClick={() => props.onCancel()}
        >
          {props.cancelLabel}
        </button>
        <button
          type="button"
          class={props.danger ? "danger" : "primary"}
          disabled={props.pending}
          onClick={() => props.onConfirm()}
        >
          {props.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
