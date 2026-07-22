// Сетка-мазонри галерей

(function () {
  "use strict";
  if (typeof gsap === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GAP = 14;
  const BREAKPOINTS = [
    { minWidth: 980, columns: 4 },
    { minWidth: 700, columns: 3 },
    { minWidth: 480, columns: 2 },
  ];

  function columnsForViewport() {
    for (const bp of BREAKPOINTS) {
      if (window.innerWidth >= bp.minWidth) return bp.columns;
    }
    return 1;
  }

  function getInitialPosition(container, item, animateFrom) {
    const rect = container.getBoundingClientRect();
    let direction = animateFrom;
    if (direction === "random") {
      const dirs = ["top", "bottom", "left", "right"];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return { x: rect.width / 2 - item.w / 2, y: rect.height / 2 - item.h / 2 };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  }

  function whenVisible(el, cb) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          io.disconnect();
          cb();
        }
      });
    }, { threshold: 0.1 });
    io.observe(el);
  }

  function createMasonry(container, entries, options) {
    const {
      ease = "power3.out",
      duration = 0.6,
      stagger = 0.05,
      animateFrom = "bottom",
      scaleOnHover = true,
      hoverScale = 0.95,
      blurToFocus = true,
      gap = GAP,
    } = options || {};

    let hasMounted = false;
    let activeEntries = entries;
    let pendingEntries = null;

    entries.forEach((entry) => {
      const el = entry.el;
      el.style.position = "absolute";
      el.style.top = "0";
      el.style.left = "0";

      if (scaleOnHover && !prefersReducedMotion) {
        el.addEventListener("pointerenter", () =>
          gsap.to(el, { scale: hoverScale, duration: 0.3, ease: "power2.out" })
        );
        el.addEventListener("pointerleave", () => gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }));
      }
      // Ссылка открывает фото
    });

    function computeGrid(list) {
      const width = container.clientWidth;
      const columns = columnsForViewport();
      const colHeights = new Array(columns).fill(0);
      const colWidth = width / columns;

      return list.map((entry) => {
        const col = colHeights.indexOf(Math.min(...colHeights));
        const rawHeight = colWidth * entry.aspect;
        const item = {
          ...entry,
          x: colWidth * col + gap / 2,
          y: colHeights[col] + gap / 2,
          w: colWidth - gap,
          h: rawHeight - gap,
        };
        colHeights[col] += rawHeight;
        return item;
      });
    }

    function layout(list, animateEntrance) {
      if (!container.clientWidth) return;
      const grid = computeGrid(list);
      const maxHeight = grid.length ? Math.max(...grid.map((i) => i.y + i.h)) + gap / 2 : 0;
      container.style.height = maxHeight + "px";

      const visibleIds = new Set(grid.map((i) => i.id));
      entries.forEach((entry) => {
        if (!visibleIds.has(entry.id)) {
          entry.el.style.pointerEvents = "none";
          gsap.to(entry.el, { opacity: 0, duration: 0.3, ease: "power2.out" });
        }
      });

      grid.forEach((item, index) => {
        const el = item.el;
        el.style.pointerEvents = "auto";
        const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

        if (prefersReducedMotion) {
          gsap.set(el, Object.assign({ opacity: 1, filter: "none" }, animProps));
          return;
        }

        if (animateEntrance) {
          const initialPos = getInitialPosition(container, item, animateFrom);
          const fromState = Object.assign(
            { opacity: 0, x: initialPos.x, y: initialPos.y, width: item.w, height: item.h },
            blurToFocus ? { filter: "blur(10px)" } : {}
          );
          const toState = Object.assign(
            { opacity: 1 },
            animProps,
            blurToFocus ? { filter: "blur(0px)" } : {},
            { duration: 0.8, ease: "power3.out", delay: index * stagger }
          );
          gsap.fromTo(el, fromState, toState);
        } else {
          gsap.to(el, Object.assign({ opacity: 1, duration, ease, overwrite: "auto" }, animProps));
        }
      });
    }

    function relayout(list, animateEntrance) {
      activeEntries = list;
      layout(list, animateEntrance);
    }

    const urls = entries.map((e) => e.imgEl && e.imgEl.src).filter(Boolean);
    Promise.all(
      urls.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = img.onerror = resolve;
          })
      )
    ).then(() => {
      whenVisible(container, () => {
        relayout(pendingEntries || activeEntries, true);
        hasMounted = true;
      });
    });

    let lastWidth = 0;
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      if (w === lastWidth) return;
      lastWidth = w;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => hasMounted && layout(activeEntries, false), 120);
    });
    ro.observe(container);

    return {
      setActive(list) {
        if (!hasMounted) {
          pendingEntries = list;
          return;
        }
        relayout(list, false);
      },
    };
  }

  function buildEntries(container, selector) {
    return Array.from(container.querySelectorAll(selector))
      .map((el, i) => {
        const img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (!img) return null;
        const w = parseFloat(img.getAttribute("width")) || 1;
        const h = parseFloat(img.getAttribute("height")) || 1;
        return {
          id: String(i),
          el,
          imgEl: img,
          aspect: h / w,
          category: el.getAttribute("data-portfolio-item") || null,
        };
      })
      .filter(Boolean);
  }

  function initStudioGallery() {
    const container = document.querySelector(".studio-gallery");
    if (!container) return;
    const entries = buildEntries(container, "a");
    createMasonry(container, entries, {
      animateFrom: "bottom",
      stagger: 0.06,
      hoverScale: 0.97,
    });
  }

  function initPortfolioGrid() {
    const container = document.querySelector(".portfolio-grid");
    if (!container) return;
    const entries = buildEntries(container, ".portfolio-item");
    const masonry = createMasonry(container, entries, {
      animateFrom: "bottom",
      stagger: 0.04,
      hoverScale: 0.96,
    });

    const filterButtons = document.querySelectorAll("[data-portfolio-filter]");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-portfolio-filter");
        filterButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
        const visible = entries.filter((e) => target === "all" || e.category === target);
        masonry.setActive(visible);
      });
    });
  }

  function boot() {
    initStudioGallery();
    initPortfolioGrid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
