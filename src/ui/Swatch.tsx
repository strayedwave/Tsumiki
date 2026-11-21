import "./Swatch.css";
import type { JSX } from "@solidjs/web";

/** `Swatch` に渡す、マスごとの指定（`SwatchRow` の `itemProps` も、この形を返す） */
export interface SwatchProps {
  label: string;
  /** 選択中（`aria-pressed`）。選択中は、アクセント色の枠が出る */
  selected?: boolean;
  /** 空きマス（押せない） */
  empty?: boolean;
  disabled?: boolean;
  class?: string;
  /** 中身の見た目は、使う側が決める（塗りの色など）。部品は塗らない */
  style?: JSX.CSSProperties;
  onClick?: () => void;
  /** マスの中に描くもの（「なし」の斜線など） */
  children?: JSX.Element;
  /** 色の並びの1マスであることを示す（`data-swatch-item`） */
  item?: boolean;
}

/**
 * 色見本の1マス（ボタン）。部品が持つのは枠（大きさ・区切り・選択の枠）まで。
 * 中身は描かない。`style` か `children` で、使う側が描く。
 */
export function Swatch(props: SwatchProps) {
  return (
    <button
      type="button"
      class={["swatch", props.empty ? "swatch-empty" : "", props.class]
        .filter(Boolean)
        .join(" ")}
      aria-label={props.label}
      title={props.label}
      aria-pressed={
        props.selected === undefined
          ? undefined
          : props.selected
            ? "true"
            : "false"
      }
      disabled={props.empty || props.disabled}
      style={props.style}
      data-swatch-item={props.item ? "" : undefined}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  );
}

export interface SwatchInsert {
  /** この番号の色の直前に差し込む（`slots` 以上なら、色の並びの後ろ） */
  at: number;
  element: JSX.Element;
}

/**
 * 色見本を並べる。正方形のマスを、1pxの線で区切る。部品が持つのは枠まで。
 * 中身（塗り）は、`itemProps` が返す `style` などで、使う側が決める。
 *
 * - `items` の各要素が1マス。`slots` に満たない分は、空きマスで埋める。
 * - `before` は先頭、`after` は末尾に、任意の要素（`Swatch` など）を置く。
 * - `insert` は、色の並びの途中に要素を差し込む。`at` は差し込み先の色の番号で、
 *   その色の直前に入る。差し込んだ要素も1マスとして数える。
 *   `insert` の要素は、`items` が変わるたびに作り直される
 *   （`before` と `after` は作り直されない）。
 * - 行と列: `columns`（列数）と `rows`（行数）で並べ方を決める。
 *   どちらも省略すると、マスの総数（色・空き・差し込み・前後）を1行に並べる。
 *   `rows` だけなら、その行数に収まる列数にする。両方を渡すと、その形に並べ、
 *   あふれた分は次の行へ続く。
 * - 差し込む要素にも、マスの大きさが付く（`.swatch-row > *`）。
 */
export default function SwatchRow<T>(props: {
  items: readonly (T | undefined)[];
  slots?: number;
  /** 色ごとのマスの指定（ラベル・塗りの `style` など） */
  itemProps: (item: T, index: number) => SwatchProps;
  emptyLabel?: (index: number) => string;
  disabled?: boolean;
  onSelect?: (item: T, index: number) => void;
  before?: JSX.Element;
  after?: JSX.Element;
  insert?: readonly SwatchInsert[];
  columns?: number;
  rows?: number;
  class?: string;
}) {
  const total = () => props.slots ?? props.items.length;
  const count = () =>
    total() +
    (props.insert?.length ?? 0) +
    (props.before === undefined ? 0 : 1) +
    (props.after === undefined ? 0 : 1);
  const columns = () =>
    props.columns ?? (props.rows ? Math.ceil(count() / props.rows) : count());
  const cells = () => {
    const out: JSX.Element[] = [];
    const inserts = props.insert ?? [];
    for (let index = 0; index < total(); index++) {
      for (const slot of inserts) if (slot.at === index) out.push(slot.element);
      const item = props.items[index];
      out.push(
        item === undefined ? (
          <Swatch empty label={props.emptyLabel?.(index) ?? ""} />
        ) : (
          <Swatch
            {...props.itemProps(item, index)}
            item
            disabled={props.disabled}
            onClick={() => props.onSelect?.(item, index)}
          />
        ),
      );
    }
    for (const slot of inserts) if (slot.at >= total()) out.push(slot.element);
    return out;
  };
  return (
    <div
      class={
        [
          "swatch-row",
          props.class,
        ]
          .filter(Boolean)
          .join(" ")
      }
      data-columns={columns()}
      style={{
        "--swatch-columns": String(columns()),
        "grid-template-rows":
          props.rows && props.columns ? `repeat(${props.rows}, auto)` : undefined,
      }}
    >
      {props.before}
      {cells()}
      {props.after}
    </div>
  );
}
