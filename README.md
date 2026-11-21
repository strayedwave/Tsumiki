# Tsumiki（積み木）

Solid 2 向けの GUI ライブラリです。Assistrator で使用していた UI コンポーネントを切り出してまとめたもので、設定画面やデスクトップツール風の UI を手軽に組み立てられます。

- ボタン、入力欄、タブ、セレクトボックス、見出し、設定グループ
- ガラス調ダイアログ、カラーピッカー、スライダー
- ライト／ダークテーマ対応、アニメーション、オーバーレイスクロールバー

## 使い方

TypeScript と Solid JSX に対応した Solid 2 プロジェクトで利用できます。  
このリポジトリを同じ pnpm ワークスペース内に配置し、アプリ側の依存関係に `"@strayedwave/tsumiki": "workspace:*"` を追加してください。

※ アプリ側には `solid-js` と `@solidjs/web` の 2.x 系が必要です。

```tsx
import { Button, Heading } from "@strayedwave/tsumiki";

<Heading
  title="設定"
  actions={<Button onClick={save}>保存</Button>}
/>;
```

- ライトテーマを適用する場合は、`<html data-theme="light">` を指定してください。
- アニメーション関連の API は `@strayedwave/tsumiki/motion` からインポートできます。

[利用ガイド](./docs/usage.md) では、部品の組み合わせとスクロール領域の設定を紹介しています。

## ライセンス

[MIT](./LICENSE)
