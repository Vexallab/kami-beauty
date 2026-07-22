// Навигация-пилюли

(function () {
  "use strict";
  if (typeof gsap === "undefined") return;

  const ease = "power3.out";

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  function markActive(pillNav) {
    // Точное совпадение
    const here = currentPage();
    pillNav.querySelectorAll("[data-pill], [data-pill-mobile-link]").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === here);
    });
  }

  function layoutHoverCircles(nav) {
    const pills = nav.querySelectorAll("[data-pill]");
    const timelines = new Map();

    pills.forEach((pill) => {
      const circle = pill.querySelector(".hover-circle");
      if (!circle) return;

      const rect = pill.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) return;

      const R = (w * w / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = D + "px";
      circle.style.height = D + "px";
      circle.style.bottom = -delta + "px";

      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

      const label = pill.querySelector(".pill-label");
      const hoverLabel = pill.querySelector(".pill-label-hover");
      if (label) gsap.set(label, { y: 0 });
      if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

      const tl = gsap.timeline({ paused: true });
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
      if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
      if (hoverLabel) {
        gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
      }
      timelines.set(pill, tl);
    });

    return timelines;
  }

  function initPillNav(nav) {
    markActive(nav.closest(".pill-nav-container") || nav);

    let timelines = layoutHoverCircles(nav);
    const activeTweens = new Map();

    nav.querySelectorAll("[data-pill]").forEach((pill) => {
      pill.addEventListener("pointerenter", () => {
        const tl = timelines.get(pill);
        if (!tl) return;
        activeTweens.get(pill)?.kill();
        activeTweens.set(pill, tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" }));
      });
      pill.addEventListener("pointerleave", () => {
        const tl = timelines.get(pill);
        if (!tl) return;
        activeTweens.get(pill)?.kill();
        activeTweens.set(pill, tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" }));
      });
    });

    const relayout = () => {
      timelines = layoutHoverCircles(nav);
    };
    window.addEventListener("resize", relayout);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(relayout).catch(() => {});
    }

    const logo = nav.querySelector("[data-pill-logo]");
    const logoImg = nav.querySelector("[data-pill-logo-img]");
    if (logo && logoImg) {
      let logoTween;
      logo.addEventListener("pointerenter", () => {
        logoTween?.kill();
        gsap.set(logoImg, { rotate: 0 });
        logoTween = gsap.to(logoImg, { rotate: 360, duration: 0.5, ease, overwrite: "auto" });
      });
    }

    const items = nav.querySelector("[data-pill-items]");
    if (items) {
      gsap.set(items, { width: 0, overflow: "hidden" });
      gsap.to(items, { width: "auto", duration: 0.6, ease, delay: 0.1 });
    }
    if (logoImg) {
      gsap.set(logoImg, { scale: 0 });
      gsap.to(logoImg, { scale: 1, duration: 0.6, ease });
    }
  }

  function initMobileMenu(container) {
    const hamburger = container.querySelector("[data-pill-hamburger]");
    const menu = container.querySelector("[data-pill-mobile-menu]");
    if (!hamburger || !menu) return;

    gsap.set(menu, { visibility: "hidden", opacity: 0, y: 10 });
    let isOpen = false;

    hamburger.addEventListener("click", () => {
      isOpen = !isOpen;
      hamburger.setAttribute("aria-expanded", String(isOpen));

      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (isOpen) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: "top center" }
        );
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      }
    });

    menu.querySelectorAll("[data-pill-mobile-link]").forEach((link) => {
      link.addEventListener("click", () => {
        isOpen = false;
        hamburger.setAttribute("aria-expanded", "false");
        const lines = hamburger.querySelectorAll(".hamburger-line");
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.2, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.2, ease });
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      });
    });
  }

  function boot() {
    const container = document.querySelector(".pill-nav-container");
    if (!container) return;
    const nav = container.querySelector(".pill-nav");
    if (nav) initPillNav(nav);
    initMobileMenu(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
