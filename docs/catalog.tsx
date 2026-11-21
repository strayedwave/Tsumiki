import { render, type JSX } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import * as UI from "@strayedwave/tsumiki";
import parameters from "./parameters.generated.json";
import "./catalog.css";

type Parameter = {
  name: string;
  optional: boolean;
  type: string;
  description: string;
};
const api: Record<string, Parameter[]> = parameters;

const groups = {
  表示と構成: [
    "Heading",
    "Badge",
    "Text",
    "Note",
    "SettingSection",
    "SettingRow",
    "InlineFrame",
    "InlineBreak",
    "IconList",
    "TitleBar",
    "WindowButton",
    "StatusBar",
  ],
  操作と入力: [
    "Button",
    "IconButton",
    "InlineButton",
    "RefreshButton",
    "Checkbox",
    "Switch",
    "TextField",
    "SearchField",
    "FormField",
    "Dropdown",
    "Select",
    "Tabs",
    "SegmentedControl",
    "Disclosure",
    "NumberSlider",
    "NumberSliderGroup",
    "StepSlider",
    "ColorWheel",
    "Swatch",
    "SwatchRow",
  ],
  ダイアログと通知: ["Modal", "ConfirmDialog", "ContextMenu", "Toast"],
} as const;

const names = new Set<string>(Object.values(groups).flat());
const options = [
  { value: "name", label: "名前順" },
  { value: "recent", label: "最近使った順" },
];
const descriptions = options.map((option) => ({
  ...option,
  description:
    option.value === "name"
      ? "名前の昇順に表示します。"
      : "最後に使った項目から表示します。",
}));
const icon = (symbol: string) => <span aria-hidden="true">{symbol}</span>;
const initialComponent = () =>
  names.has(location.hash.slice(1)) ? location.hash.slice(1) : "Heading";

function Catalog() {
  const [component, setComponent] = createSignal(initialComponent());
  const [theme, setTheme] = createSignal<"light" | "dark">("dark");
  const [choice, setChoice] = createSignal("name");
  const [enabled, setEnabled] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [value, setValue] = createSignal(1);
  const [scale, setScale] = createSignal(100);
  const [notice, setNotice] = createSignal("");
  const [dialog, setDialog] = createSignal(false);
  const [menu, setMenu] = createSignal<{ x: number; y: number }>();
  const [wheel, setWheel] = createSignal({
    hue: 205,
    saturation: 0.7,
    value: 0.8,
  });
  const chooseComponent = () => {
    setDialog(false);
    setMenu(undefined);
    setNotice("");
    setComponent(initialComponent());
  };
  window.addEventListener("hashchange", chooseComponent);
  onCleanup(() => window.removeEventListener("hashchange", chooseComponent));

  const refresh = () => setNotice("更新しました");
  const dropdown = () => (
    <UI.Dropdown
      label="並び順"
      options={options}
      value={choice()}
      onChange={setChoice}
    />
  );
  const button = (label = "更新") => (
    <UI.Button onClick={refresh}>{label}</UI.Button>
  );
  const slider = () => (
    <UI.NumberSlider
      label="表示倍率"
      value={value()}
      min={0.5}
      max={2}
      step={0.25}
      onInput={setValue}
    />
  );
  const section = () => (
    <UI.SettingSection title="表示">
      <UI.SettingRow label="並び順">{dropdown()}</UI.SettingRow>
    </UI.SettingSection>
  );
  const tabOptions = [
    { ...options[0], id: "tab-name", panelId: "panel-name" },
    { ...options[1], id: "tab-recent", panelId: "panel-recent" },
  ];
  const previews: Record<string, () => JSX.Element> = {
    Heading: () => (
      <UI.Heading
        title="スクリプト"
        description="登録済みのスクリプト"
        icon={icon("▤")}
        actions={
          <>
            {dropdown()}
            {button()}
          </>
        }
      />
    ),
    Badge: () => <UI.Badge>プレビュー</UI.Badge>,
    Text: () => <UI.Text muted>補足情報を表示します。</UI.Text>,
    Note: () => <UI.Note>表示倍率はいつでも変更できます。</UI.Note>,
    SettingSection: section,
    SettingRow: () => (
      <UI.SettingRow label="並び順" line="bottom">
        {dropdown()}
      </UI.SettingRow>
    ),
    InlineFrame: () => (
      <UI.InlineFrame>
        {button("追加")}
        {button("更新")}
      </UI.InlineFrame>
    ),
    InlineBreak: () => (
      <UI.InlineFrame>
        {button("1行目")}
        <UI.InlineBreak />
        {button("2行目")}
      </UI.InlineFrame>
    ),
    IconList: () => (
      <UI.IconList label="操作">
        <UI.IconButton label="更新" onClick={refresh}>
          {icon("↻")}
        </UI.IconButton>
      </UI.IconList>
    ),
    TitleBar: () => (
      <UI.TitleBar title="設定" icon={icon("▤")}>
        <UI.WindowButton kind="close" label="閉じる" onClick={refresh}>
          {icon("×")}
        </UI.WindowButton>
      </UI.TitleBar>
    ),
    WindowButton: () => (
      <UI.WindowButton
        kind="pin"
        label="固定"
        pressed={enabled()}
        onClick={() => setEnabled(!enabled())}
      >
        {icon("●")}
      </UI.WindowButton>
    ),
    StatusBar: () => <UI.StatusBar text="準備完了" />,
    Button: () => button(),
    IconButton: () => (
      <UI.IconButton label="更新" showTitle onClick={refresh}>
        {icon("↻")}
      </UI.IconButton>
    ),
    InlineButton: () => (
      <UI.InlineButton
        label="選択"
        selected={enabled()}
        onClick={() => setEnabled(!enabled())}
      >
        {icon("★")}
      </UI.InlineButton>
    ),
    RefreshButton: () => (
      <UI.RefreshButton
        label="更新"
        icon={icon("↻")}
        showTitle
        onClick={refresh}
      />
    ),
    Checkbox: () => (
      <UI.Checkbox checked={enabled()} onChange={setEnabled}>
        自動更新
      </UI.Checkbox>
    ),
    Switch: () => (
      <UI.Switch label="自動更新" checked={enabled()} onChange={setEnabled} />
    ),
    TextField: () => (
      <UI.TextField aria-label="名前" placeholder="名前を入力" />
    ),
    SearchField: () => (
      <UI.SearchField
        label="検索"
        icon={icon("⌕")}
        clearIcon={icon("×")}
        clearLabel="検索をクリア"
        value={query()}
        onChange={setQuery}
      />
    ),
    FormField: () => (
      <UI.FormField
        label="表示名"
        description="3文字以上で入力します。"
        required
        error={
          query() && query().length < 3
            ? "3文字以上で入力してください。"
            : undefined
        }
      >
        {(field) => (
          <UI.TextField
            {...field}
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
        )}
      </UI.FormField>
    ),
    Dropdown: dropdown,
    Select: () => (
      <UI.Select
        label="並び順"
        indicator={icon("⌄")}
        options={descriptions}
        value={choice()}
        onChange={setChoice}
      />
    ),
    Tabs: () => (
      <>
        <UI.Switch label="縦並び" checked={enabled()} onChange={setEnabled} />
        <div class={enabled() ? "tabs-example is-vertical" : "tabs-example"}>
          <UI.Tabs
            ariaLabel="並び順"
            orientation={enabled() ? "vertical" : "horizontal"}
            options={tabOptions}
            value={choice()}
            onChange={setChoice}
          />
          {tabOptions.map((option) => (
            <div
              role="tabpanel"
              id={option.panelId}
              aria-labelledby={option.id}
              hidden={choice() !== option.value}
              tabindex={0}
            >
              {option.label}を選択中
            </div>
          ))}
        </div>
      </>
    ),
    SegmentedControl: () => (
      <UI.SegmentedControl
        ariaLabel="並び順"
        options={options}
        value={choice()}
        onChange={setChoice}
      />
    ),
    Disclosure: () => (
      <UI.Disclosure
        label="表示設定"
        indicator={(open) => icon(open ? "▾" : "▸")}
        open={enabled()}
        onToggle={() => setEnabled(!enabled())}
        actions={button()}
      >
        {section()}
      </UI.Disclosure>
    ),
    NumberSlider: slider,
    NumberSliderGroup: () => (
      <UI.NumberSliderGroup ariaLabel="表示設定">
        {slider()}
        {slider()}
      </UI.NumberSliderGroup>
    ),
    StepSlider: () => (
      <UI.StepSlider
        label="拡大率"
        steps={[75, 100, 125, 200]}
        value={scale()}
        format={(step) => step + "%"}
        onInput={setScale}
        onCommit={setScale}
      />
    ),
    ColorWheel: () => (
      <div class="wheel-example">
        <UI.ColorWheel
          {...wheel()}
          planeLabel="彩度と明度"
          onHueChange={(hue) => setWheel({ ...wheel(), hue })}
          onPlaneChange={(saturation, value) =>
            setWheel({ ...wheel(), saturation, value })
          }
        />
      </div>
    ),
    Swatch: () => (
      <div class="swatch-example">
        <UI.Swatch
          label="青"
          selected={enabled()}
          onClick={() => setEnabled(!enabled())}
          style={{ background: "#6794ef" }}
        />
      </div>
    ),
    SwatchRow: () => (
      <UI.SwatchRow
        items={["#6794ef", "#b9a3f5", "#66bfa5"]}
        slots={4}
        itemProps={(color) => ({ label: color, style: { background: color } })}
        onSelect={(color) => setNotice(color)}
      />
    ),
    Modal: () => (
      <>
        <UI.Button onClick={() => setDialog(true)}>表示設定を開く</UI.Button>
        {dialog() && (
          <UI.Modal
            role="dialog"
            variant="glass"
            class="catalog-dialog"
            labelledBy="example-title"
            onDismiss={() => setDialog(false)}
          >
            <h2 id="example-title">表示設定</h2>
            {section()}
            <UI.Button onClick={() => setDialog(false)}>閉じる</UI.Button>
          </UI.Modal>
        )}
      </>
    ),
    ConfirmDialog: () => (
      <>
        <UI.Button onClick={() => setDialog(true)}>確認を開く</UI.Button>
        {dialog() && (
          <UI.ConfirmDialog
            title="設定を保存しますか？"
            body="表示設定に変更が適用されます。"
            cancelLabel="キャンセル"
            confirmLabel="保存"
            onCancel={() => setDialog(false)}
            onConfirm={() => {
              setDialog(false);
              setNotice("保存しました");
            }}
          />
        )}
      </>
    ),
    ContextMenu: () => (
      <>
        <button
          class="menu-trigger"
          type="button"
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            setMenu({ x: box.left, y: box.bottom });
          }}
        >
          メニューを開く
        </button>
        {menu() && (
          <UI.ContextMenu
            {...menu()!}
            label="操作"
            items={[{ id: "refresh", label: "更新" }]}
            close={() => setMenu(undefined)}
            onSelect={refresh}
          />
        )}
      </>
    ),
    Toast: () => (
      <>
        <UI.Button onClick={() => setDialog(true)}>通知を表示</UI.Button>
        {dialog() && (
          <UI.Toast
            icon={icon("✓")}
            message="設定を保存しました"
            closeLabel="閉じる"
            closeIcon={icon("×")}
            onClose={() => setDialog(false)}
          />
        )}
      </>
    ),
  };

  return (
    <>
      <header class="catalog-header">
        <a class="brand" href="#Heading">
          Tsumiki <span>積み木</span>
        </a>
        <UI.SegmentedControl
          ariaLabel="テーマ"
          value={theme()}
          options={[
            { value: "light", label: "ライト" },
            { value: "dark", label: "ダーク" },
          ]}
          onChange={(next) => {
            setTheme(next);
            document.documentElement.dataset.theme = next;
          }}
        />
      </header>
      <div class="catalog-layout">
        <nav class="catalog-nav" aria-label="コンポーネント">
          {Object.entries(groups).map(([title, components]) => (
            <section>
              <h2>{title}</h2>
              {components.map((name) => (
                <a
                  href={`#${name}`}
                  aria-current={component() === name ? "page" : undefined}
                >
                  {name}
                </a>
              ))}
            </section>
          ))}
        </nav>
        <main class="catalog-main" aria-labelledby="component-title">
          <h1 id="component-title">{component()}</h1>
          <section aria-label="プレビュー" class="catalog-preview">
            {previews[component()]?.()}
            <div role="status" class="catalog-notice">
              {notice()}
            </div>
          </section>
          <section
            aria-labelledby="parameters-title"
            class="catalog-parameters"
          >
            <h2 id="parameters-title">パラメータ</h2>
            {api[component()]?.length ? (
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">名前</th>
                      <th scope="col">型</th>
                      <th scope="col">必須</th>
                      <th scope="col">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {api[component()].map((parameter) => (
                      <tr>
                        <td>
                          <code>{parameter.name}</code>
                        </td>
                        <td>
                          <code>{parameter.type}</code>
                        </td>
                        <td>{parameter.optional ? "任意" : "必須"}</td>
                        <td>{parameter.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>この部品に指定するパラメータはありません。</p>
            )}
            {component() === "TextField" && (
              <p>このほかに標準の input 属性も指定できます。</p>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

render(() => <Catalog />, document.getElementById("root")!);
