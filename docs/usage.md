# 利用ガイド

## ワークスペースに追加する

Tsumiki をアプリと同じ pnpm ワークスペースに配置し、`pnpm-workspace.yaml` の `packages` に Tsumiki のディレクトリを含めます。アプリの `package.json` に `"@strayedwave/tsumiki": "workspace:*"` を追加して `pnpm install` を実行します。利用側のビルドで TypeScript、Solid 2 の JSX、CSS の import を処理できるようにしてください。

## 部品を組み合わせる

`Heading` と `Disclosure` の `actions` には、右側に置くボタンやドロップダウンを渡せます。複数置く場合はフラグメントでまとめます。値を選ぶ部品では、選択状態を呼び出し側で管理します。

```tsx
import { createSignal } from "solid-js";
import { Heading, NumberSlider } from "@strayedwave/tsumiki";

export function DisplaySettings() {
  const [scale, setScale] = createSignal(1);

  return (
    <section>
      <Heading title="表示設定" />
      <NumberSlider
        label="表示倍率"
        value={scale()}
        min={0.5}
        max={2}
        step={0.25}
        onInput={setScale}
      />
    </section>
  );
}
```

- `NumberSlider` は手入力を範囲内の最も近い刻みに丸め、欄から離れたときに補正後の値を表示します。
- `Tabs` は `orientation="horizontal"` または `"vertical"` で向きを指定でき、矢印キーの方向も対応します。
- `FormField` はラベル・説明・エラーを入力欄に関連付けます。入力の検証とエラー文は呼び出し側で管理します。

## テーマとダイアログ

ダークテーマが既定です。`<html data-theme="light">` でライトテーマに切り替えられます。色や余白は CSS 変数で調整できます。

ガラス調のダイアログを表示するには、開いている間だけ `Modal` を描画し、`variant="glass"` を指定します。`labelledBy` に見出しの ID を渡し、`onDismiss` で開閉状態を更新します。

## スクロール領域に余白を取る

スクロールする要素に `data-scroll-area` を付け、描画後に `installOverlayScrollbars(root)` を呼びます。縦のスクロールバーと重なり得るコンテンツに `data-scroll-inset` を付けると、バーが表示される間だけ末尾側に余白が入ります。

```tsx
<div data-scroll-area="" style={{ "max-height": "16rem", overflow: "auto" }}>
  <div data-scroll-inset="">
    <DisplaySettings />
  </div>
</div>
```

`root` はスクロール領域自身、またはそれを含む要素です。画面を破棄するときは、`installOverlayScrollbars` の戻り値の関数を呼んで解除します。
