import "./Toast.css";
import type { JSX } from "@solidjs/web";
import IconButton from "./IconButton";

/**
 * 通知。起きた画面の中に出す。アイコンは呼び出し側が渡す。
 * `icon` は見出しの先頭、`closeIcon` は閉じるボタンの中身。
 */
export default function Toast(props: {
  icon: JSX.Element;
  message: string;
  closeLabel: string;
  closeIcon: JSX.Element;
  onClose: () => void;
}) {
  return (
    <div class="toast" role="alert" data-notice>
      {props.icon}
      <span>{props.message}</span>
      <IconButton label={props.closeLabel} onClick={props.onClose}>
        {props.closeIcon}
      </IconButton>
    </div>
  );
}
