import "./line.css";

/**
 * 部品の縁に引く線。各部品の `line` で指定する（既定は `none` = 線なし）。
 * 線は枠の内側に重ねて描くので、大きさは変わらない。色は CSS 変数 `--line-color`
 * （既定は `--divider`）。
 *
 * - `top` / `bottom` / `both`（上下）
 * - `start` / `end`（行の先頭側・末尾側。隣の部品との境目に使う）
 */
export type Line = "none" | "top" | "bottom" | "both" | "start" | "end";

/** `line` を、部品の外側の要素に付けるクラスにする */
export const lineClass = (line?: Line): string =>
  line && line !== "none" ? `line-${line}` : "";

/** クラス名を、空を除いて結合する */
export const classes = (...names: (string | undefined | false)[]): string =>
  names.filter(Boolean).join(" ");
