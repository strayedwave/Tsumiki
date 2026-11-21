import "./Badge.css";
import type { JSX } from "@solidjs/web";

export default function Badge(props: { children: JSX.Element }) {
  return <span class="ui-badge">{props.children}</span>;
}
