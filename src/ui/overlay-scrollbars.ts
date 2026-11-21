import "./overlay-scrollbars.css";

type Axis = "x" | "y";

function visibleBounds(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  let left = Math.max(0, bounds.left);
  let right = Math.min(window.innerWidth, bounds.right);
  let top = Math.max(0, bounds.top);
  let bottom = Math.min(window.innerHeight, bounds.bottom);
  for (
    let parent = element.parentElement;
    parent && parent !== document.body;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent);
    if (style.overflowX === "visible" && style.overflowY === "visible")
      continue;
    const rect = parent.getBoundingClientRect();
    if (style.overflowX !== "visible") {
      left = Math.max(left, rect.left);
      right = Math.min(right, rect.right);
    }
    if (style.overflowY !== "visible") {
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
  }
  return { left, right, top, bottom };
}

function makeBar(region: HTMLElement, axis: Axis) {
  const rail = document.createElement("div");
  const thumb = document.createElement("div");
  rail.className = "overlay-scroll-rail";
  rail.dataset.axis = axis;
  rail.setAttribute("aria-hidden", "true");
  rail.append(thumb);
  const host = region.closest("dialog") ?? document.body;
  host.append(rail);
  let range = 0;
  let travel = 0;
  let drag: { id: number; coordinate: number; scroll: number } | undefined;
  const vertical = axis === "y";
  const position = vertical ? "scrollTop" : "scrollLeft";
  const coordinate = (event: PointerEvent) =>
    vertical ? event.clientY : event.clientX;

  thumb.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    thumb.setPointerCapture(event.pointerId);
    drag = {
      id: event.pointerId,
      coordinate: coordinate(event),
      scroll: region[position],
    };
    rail.dataset.dragging = "";
  });
  thumb.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId || !travel) return;
    region[position] =
      drag.scroll + ((coordinate(event) - drag.coordinate) * range) / travel;
  });
  thumb.addEventListener("lostpointercapture", () => {
    drag = undefined;
    delete rail.dataset.dragging;
  });
  thumb.addEventListener(
    "wheel",
    (event) => {
      // The thumb lives outside its scroll area so it stays above sticky rows and masks.
      event.preventDefault();
      const step =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? region.clientHeight
            : 1;
      region.scrollBy(event.deltaX * step, event.deltaY * step);
    },
    { passive: false },
  );

  return {
    update(
      bounds: ReturnType<typeof visibleBounds>,
      style: CSSStyleDeclaration,
    ) {
      const client = vertical ? region.clientHeight : region.clientWidth;
      const content = vertical ? region.scrollHeight : region.scrollWidth;
      const length = vertical
        ? bounds.bottom - bounds.top
        : bounds.right - bounds.left;
      range = content - client;
      rail.hidden =
        range < 1 ||
        client === 0 ||
        length <= 0 ||
        bounds.right <= bounds.left ||
        bounds.bottom <= bounds.top ||
        !["auto", "scroll"].includes(
          vertical ? style.overflowY : style.overflowX,
        );
      // バーが出ている向きを、領域に印として付ける(バーの分の余白は、出ているときだけ空ける)
      region.toggleAttribute(
        vertical ? "data-overlay-y" : "data-overlay-x",
        !rail.hidden,
      );
      if (rail.hidden) return;
      const size = Math.min(length, Math.max(22, (length * client) / content));
      travel = length - size;
      const offset = Math.max(
        0,
        Math.min(travel, (travel * region[position]) / range),
      );
      rail.style.left = `${vertical ? bounds.right : bounds.left}px`;
      rail.style.top = `${vertical ? bounds.top : bounds.bottom}px`;
      rail.style.setProperty("--rail-length", `${length}px`);
      rail.style.setProperty("--thumb-length", `${size}px`);
      rail.style.setProperty("--thumb-offset", `${offset}px`);
    },
    remove: () => {
      region.removeAttribute(vertical ? "data-overlay-y" : "data-overlay-x");
      rail.remove();
    },
  };
}

/**
 * Install overlay scrollbars on matching regions. Use data-scroll-area to opt in
 * and data-scroll-inset on content that needs room beside a vertical scrollbar.
 * Returns a cleanup function.
 */
export function installOverlayScrollbars(
  root: HTMLElement,
  regions = "[data-scroll-area]",
): () => void {
  const entries = new Map<HTMLElement, ReturnType<typeof makeBar>[]>();
  const observed = new Set<Element>();
  let frame = 0;
  let dirty = true;
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  const scan = () => {
    const elements = [...root.querySelectorAll<HTMLElement>(regions)];
    if (root.matches(regions)) elements.unshift(root);
    const current = new Set(elements);
    for (const [element, bars] of entries) {
      if (current.has(element)) continue;
      for (const bar of bars) bar.remove();
      element.removeAttribute("data-overlay-scroll");
      entries.delete(element);
    }
    const next = new Set<Element>();
    for (const element of elements) {
      if (!entries.has(element)) {
        element.dataset.overlayScroll = "";
        entries.set(element, [makeBar(element, "y"), makeBar(element, "x")]);
      }
      next.add(element);
      for (const child of element.children) {
        if (!child.classList.contains("overlay-scroll-rail")) next.add(child);
      }
    }
    for (const element of observed) {
      if (next.has(element)) continue;
      resize.unobserve(element);
      observed.delete(element);
    }
    for (const element of next) {
      if (observed.has(element)) continue;
      resize.observe(element);
      observed.add(element);
    }
  };
  function update() {
    frame = 0;
    if (dirty) {
      dirty = false;
      scan();
    }
    for (const [region, bars] of entries) {
      const bounds = visibleBounds(region);
      const style = getComputedStyle(region);
      for (const bar of bars) bar.update(bounds, style);
    }
  }

  const observer = new MutationObserver((records) => {
    if (
      records.every(
        (record) =>
          record.type === "childList" &&
          [...record.addedNodes, ...record.removedNodes].every(
            (node) =>
              node instanceof Element &&
              node.classList.contains("overlay-scroll-rail"),
          ),
      )
    )
      return;
    dirty = true;
    schedule();
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "open"],
  });
  document.addEventListener("scroll", schedule, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", schedule);
  update();
  return () => {
    observer.disconnect();
    resize.disconnect();
    document.removeEventListener("scroll", schedule, true);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
    for (const [region, bars] of entries) {
      for (const bar of bars) bar.remove();
      region.removeAttribute("data-overlay-scroll");
    }
    entries.clear();
    observed.clear();
  };
}
