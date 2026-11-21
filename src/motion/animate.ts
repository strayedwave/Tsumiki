import { type EasingName, resolveEasing } from "./easing";

/**
 * ボタンなどの、小さな動き（Web Animations API）。DOMだけで動く（Solid以外からも使える）。
 * Solid用の結び付けは `useAnimate.ts`。
 *
 * - `spin`: 回転（2D）
 * - `flip`: 3D回転（`axis` で軸を決める）
 * - `slide`: 一定の間隔で、`direction` へ滑って出ていき、反対側から戻ってくる（ループ向き）
 * - `rise`: ふわっと浮き上がる。透明度を0から1にしながら、`direction` へ滑って、正位置に収まる
 * - `pulse`: 透明度が、`opacity`（既定0.5）と1の間を往復する、やわらかい明滅（`easing` が効く）
 * - `blink`: 透明度が、1と0で、段差のまま切り替わる点滅（イージングなし）
 * - `scale`: 大きさが、`scale`（既定0＝0%）から `peak`（既定4＝400%）まで大きくなり、
 *   そのあと、また0%から100%まで大きくなって収まる。大きくなるにつれて、透明度が下がる（`peakOpacity`）
 * - `fill`: アイコンが、`angle` の向きに、ゆっくり塗りつぶされる（`hold` で塗ったまま残せる）。
 *   アイコンはSVGで、塗れる形（閉じた図形）のものに限る
 * - `keyframes`: 自分で書いたキーフレームを使う（`preset` より優先）
 *
 * どの動きも、`duration`（ms）で長さを、`easing`（`blink` を除く）で緩急を決める。
 */
export type Direction = "up" | "down" | "left" | "right";
export type AnimatePreset =
  | "spin"
  | "flip"
  | "slide"
  | "rise"
  | "pulse"
  | "blink"
  | "scale"
  | "fill";
/**
 * 動きを始める契機。
 * - `click`: 押したとき1回（既定）
 * - `hover`: ポインターが乗ったとき1回
 * - `mount`: 表示されたとき1回
 * - `selected`: `selected` が変わったとき1回
 * - `busy`: `busy` の間、繰り返す（終わるときは、いまの1周を終えてから止まる）
 * - `loop`: 表示されている間、ずっと繰り返す
 */
export type AnimateTrigger =
  | "click"
  | "hover"
  | "mount"
  | "selected"
  | "busy"
  | "loop";

export interface AnimateSpec {
  preset?: AnimatePreset;
  keyframes?: Keyframe[];
  /** 既定は `click` */
  trigger?: AnimateTrigger;
  /** 動かす対象。`icon` は、ボタンの最初の子要素（アイコン）。既定は `icon` */
  target?: "icon" | "button";
  /** `slide` / `rise` の向き（動いていく向き）。既定は、`slide` が `right`、`rise` が `up` */
  direction?: Direction;
  /** `flip` の軸。`y` は左右方向に、`x` は上下方向に回る。既定は `y` */
  axis?: "x" | "y";
  /** 動く距離（px）。`rise` の既定は8。`slide` の既定は、対象が外へ出きる距離 */
  distance?: number;
  /** `pulse` の、いちばん薄いときの透明度（0〜1）。既定は0.5 */
  opacity?: number;
  /**
   * `fill` の、塗りが広がっていく向き（度）。CSSのグラデーションの角度と同じで、
   * 0 が下から上、90 が左から右、180 が上から下。既定は0
   */
  angle?: number;
  /** `fill` で、塗り終わったあとも、塗ったままにする（次に動かすか、止めるまで）。繰り返すときは無視 */
  hold?: boolean;
  /** `scale` の、始まりの倍率。既定は0（0%） */
  scale?: number;
  /** `scale` の、いちばん大きくなるときの倍率。既定は4（400%） */
  peak?: number;
  /** `scale` の、いちばん大きいときの透明度（0〜1）。既定は0（透明）。1にすると薄くならない */
  peakOpacity?: number;
  /** 1回の動きのあと、次が始まるまでの間（ms）。繰り返すときの「一定の間隔」 */
  interval?: number;
  /** `easings` の名前、またはCSSのイージング文字列 */
  easing?: EasingName | (string & {});
  /** 1回の動きの長さ（ms） */
  duration?: number;
  /** 繰り返す回数。既定は、`busy` / `loop` が無限、ほかは1 */
  iterations?: number;
}

const DEFAULT_DURATION: Record<AnimatePreset, number> = {
  spin: 1000,
  flip: 800,
  slide: 800,
  rise: 400,
  pulse: 1200,
  blink: 1000,
  scale: 1000,
  fill: 2000,
};
const FLIP_PERSPECTIVE_PX = 200;

const move = (x: number, y: number) => `translate(${x}px, ${y}px)`;

function vector(direction: Direction, distance: number): [number, number] {
  switch (direction) {
    case "up":
      return [0, -distance];
    case "down":
      return [0, distance];
    case "left":
      return [-distance, 0];
    case "right":
      return [distance, 0];
  }
}

/** 動きの前後のキーフレームから、「動く → 間（interval）」の1周分を作る */
function cycle(
  from: Keyframe,
  to: Keyframe,
  duration: number,
  interval: number,
  easing: string,
) {
  const pause = Math.max(0, interval);
  const period = duration + pause;
  const frames: Keyframe[] = [
    { ...from, offset: 0, easing },
    { ...to, offset: duration / period },
  ];
  if (pause > 0) frames.push({ ...to, offset: 1 });
  return { frames, period };
}

export interface Geometry {
  /** ボタンの、動く向きの長さ（px） */
  hostSize: number;
  /** 動かす対象の、動く向きの長さ（px） */
  targetSize: number;
  /** 対象がボタン自身か */
  targetIsHost: boolean;
}

export function buildAnimation(spec: AnimateSpec, geometry: Geometry) {
  const interval = spec.interval ?? 0;
  if (spec.keyframes) {
    return {
      frames: spec.keyframes,
      period: spec.duration ?? 600,
      easing: resolveEasing(spec.easing ?? "standard"),
    };
  }
  const preset = spec.preset ?? "spin";
  const duration = spec.duration ?? DEFAULT_DURATION[preset];
  const infinite = spec.trigger === "busy" || spec.trigger === "loop";
  if (preset === "spin" || preset === "flip") {
    const easing = resolveEasing(
      spec.easing ?? (infinite ? "linear" : "standard"),
    );
    const rotate =
      preset === "spin"
        ? (degrees: number) => `rotate(${degrees}deg)`
        : (degrees: number) =>
            `perspective(${FLIP_PERSPECTIVE_PX}px) rotate${(spec.axis ?? "y").toUpperCase()}(${degrees}deg)`;
    return {
      ...cycle(
        { transform: rotate(0) },
        { transform: rotate(360) },
        duration,
        interval,
        easing,
      ),
      easing: "linear",
    };
  }
  if (preset === "pulse") {
    const low = spec.opacity ?? 0.5;
    const easing = resolveEasing(spec.easing ?? "easeInOut");
    const period = duration + Math.max(0, interval);
    const half = duration / period / 2;
    const frames: Keyframe[] = [
      { opacity: low, offset: 0, easing },
      { opacity: 1, offset: half, easing },
      { opacity: low, offset: half * 2 },
    ];
    if (period > duration) frames.push({ opacity: low, offset: 1 });
    return { frames, period, easing: "linear" };
  }
  if (preset === "fill") {
    return {
      ...cycle(
        { "--ui-fill-p": "0%" },
        { "--ui-fill-p": `${FILL_END}%` },
        duration,
        interval,
        resolveEasing(spec.easing ?? "easeInOut"),
      ),
      easing: "linear",
    };
  }
  if (preset === "scale") {
    // 0%から `peak`（既定400%）まで大きくなる。そのあと、また0%から、100%まで大きくなって収まる。
    // どちらの段も、勢いよく広がって、ゆっくり止まる（`easing` を渡すと、両方に使う）
    const period = duration + Math.max(0, interval);
    const peakAt = (duration * 0.5) / period;
    const start = `scale(${spec.scale ?? 0})`;
    const easing = resolveEasing(spec.easing ?? "easeOut");
    // 大きくなるにつれて薄くなり（`peakOpacity`）、後半は、はっきり見える
    const frames: Keyframe[] = [
      { transform: start, opacity: 1, offset: 0, easing },
      {
        transform: `scale(${spec.peak ?? 4})`,
        opacity: spec.peakOpacity ?? 0,
        offset: peakAt,
      },
      { transform: start, opacity: 1, offset: peakAt, easing },
      { transform: "scale(1)", opacity: 1, offset: duration / period },
    ];
    if (period > duration) {
      frames.push({ transform: "scale(1)", opacity: 1, offset: 1 });
    }
    return { frames, period, easing: "linear" };
  }
  if (preset === "blink") {
    // 付いている間(on)と消えている間(off)を、段差で切り替える。間は、付いている側に足す
    const period = duration + Math.max(0, interval);
    const on = (Math.max(0, interval) + duration / 2) / period;
    const step = "steps(1, end)";
    const frames: Keyframe[] = [
      { opacity: 1, offset: 0, easing: step },
      { opacity: 0, offset: on, easing: step },
      { opacity: 1, offset: 1 },
    ];
    return { frames, period, easing: "linear" };
  }
  if (preset === "rise") {
    const distance = spec.distance ?? 8;
    const [x, y] = vector(spec.direction ?? "up", distance);
    return {
      ...cycle(
        { opacity: 0, transform: move(-x, -y) },
        { opacity: 1, transform: move(0, 0) },
        duration,
        interval,
        resolveEasing(spec.easing ?? "standard"),
      ),
      easing: "linear",
    };
  }
  // slide: 出ていく向きへ動き、反対側から戻ってくる。出て行くとき（加速）と戻るとき（減速）で、
  // イージングを分ける（`easing` を渡したときは、両方に使う）
  const reach =
    spec.distance ??
    (geometry.targetIsHost
      ? geometry.hostSize
      : (geometry.hostSize + geometry.targetSize) / 2);
  const [x, y] = vector(spec.direction ?? "right", reach);
  const pause = Math.max(0, interval);
  const period = duration + pause;
  const half = duration / period / 2;
  const out = resolveEasing(spec.easing ?? "easeIn");
  const back = resolveEasing(spec.easing ?? "easeOut");
  const frames: Keyframe[] = [
    { transform: move(0, 0), offset: 0, easing: out },
    { transform: move(x, y), offset: half },
    { transform: move(-x, -y), offset: half, easing: back },
    { transform: move(0, 0), offset: duration / period },
  ];
  if (pause > 0) frames.push({ transform: move(0, 0), offset: 1 });
  return { frames, period, easing: "linear" };
}

export interface Animator {
  /** 動きを始める。`loop` を true にすると、`iterations` に関わらず繰り返す */
  start(loop: boolean): void;
  /** 止める。`graceful` なら、繰り返しの、いまの1周を終えてから止まる */
  stop(graceful?: boolean): void;
  dispose(): void;
}

const prefersReducedMotion = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;


/** 塗りの広がりの終わり（%）。縁をぼかす分（FILL_SOFT）だけ、100%を越えて動かす */
const FILL_SOFT = 12;
const FILL_END = 100 + FILL_SOFT;

/**
 * 塗りつぶし（`fill`）用の重ね。アイコンのSVGを複製して、その上に重ねる。
 * 複製には、塗りと縁の描き方（`animate.css` の `.ui-fill-overlay`）と、広がりを決める
 * マスク（角度と、進み具合 `--ui-fill-p`）が付く。元のアイコンは、いじらない。
 */
function createFillOverlay(host: HTMLElement, icon: Element, angle: number) {
  const overlay = icon.cloneNode(true) as SVGElement;
  overlay.classList.add("ui-fill-overlay");
  overlay.setAttribute("aria-hidden", "true");
  overlay.removeAttribute("id");
  const hostRect = host.getBoundingClientRect();
  const rect = icon.getBoundingClientRect();
  overlay.style.left = `${rect.left - hostRect.left - host.clientLeft}px`;
  overlay.style.top = `${rect.top - hostRect.top - host.clientTop}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.setProperty("--ui-fill-angle", `${angle}deg`);
  let restorePosition: (() => void) | undefined;
  if (getComputedStyle(host).position === "static") {
    host.style.position = "relative";
    restorePosition = () => {
      host.style.position = "";
    };
  }
  host.append(overlay);
  return {
    element: overlay,
    remove() {
      overlay.remove();
      restorePosition?.();
    },
  };
}

/** `host`（ボタン）の中の対象を、`getSpec()` の指定で動かす。指定は、動きを始める時点の値を使う */
export function createAnimator(
  host: HTMLElement,
  getSpec: () => AnimateSpec | undefined,
): Animator {
  let current: Animation | undefined;
  /** 動きが終わったときに、元へ戻す処理（隠したはみ出し、重ねた複製など） */
  let release: (() => void) | undefined;
  /** `hold` で、塗ったまま残している重ね。次に始めるか、止めるまで残る */
  let held: (() => void) | undefined;

  const clear = () => {
    release?.();
    release = undefined;
    held?.();
    held = undefined;
  };

  const stop = (graceful = false) => {
    const animation = current;
    if (animation && graceful && animation.effect) {
      const timing = animation.effect.getComputedTiming();
      if (timing.iterations === Number.POSITIVE_INFINITY) {
        // いまの周は、最後まで動かす
        animation.effect.updateTiming({
          iterations: Math.floor(timing.currentIteration ?? 0) + 1,
        });
        return;
      }
    }
    current = undefined;
    clear();
    animation?.cancel();
  };

  return {
    start(loop) {
      stop();
      const spec = getSpec();
      if (!spec || prefersReducedMotion()) return;
      const asButton = spec.target === "button";
      // アイコンはSVG（HTMLElementではない）のこともあるので、Element で受ける
      const icon: Element = host.firstElementChild ?? host;
      let target: Element = asButton ? host : icon;
      const horizontal = spec.direction === "left" || spec.direction === "right";
      const targetRect = target.getBoundingClientRect();
      const { frames, period, easing } = buildAnimation(spec, {
        hostSize: horizontal ? host.clientWidth : host.clientHeight,
        targetSize: horizontal ? targetRect.width : targetRect.height,
        targetIsHost: target === host,
      });
      const infinite = loop;
      let overlayElement: SVGElement | undefined;
      if (spec.preset === "fill") {
        // 塗りは、アイコンの上に重ねた複製を動かす（アイコンがない／SVGでないときは何もしない）
        if (icon === host || !(icon instanceof SVGElement)) return;
        const overlay = createFillOverlay(host, icon, spec.angle ?? 0);
        overlayElement = overlay.element;
        target = overlay.element;
        release = overlay.remove;
      } else if (spec.preset === "slide" && target !== host) {
        // アイコンが、ボタンの外へ出ていく間は、はみ出した分を隠す
        const previous = host.style.overflow;
        host.style.overflow = "hidden";
        release = () => {
          host.style.overflow = previous;
        };
      }
      const animation = target.animate(frames, {
        duration: period,
        easing,
        iterations: infinite ? Number.POSITIVE_INFINITY : (spec.iterations ?? 1),
      });
      current = animation;
      animation.onfinish = () => {
        if (current !== animation) return;
        current = undefined;
        if (spec.hold && overlayElement) {
          // 塗り終わった状態のまま残す（次に始めるか、止めるまで）
          overlayElement.style.setProperty("--ui-fill-p", `${FILL_END}%`);
          held = release;
          release = undefined;
          return;
        }
        clear();
      };
      animation.oncancel = () => {
        if (current !== animation) return;
        current = undefined;
        clear();
      };
    },
    stop,
    dispose: () => stop(),
  };
}
