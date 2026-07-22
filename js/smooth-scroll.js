// Плавный скролл

(function () {
  "use strict";
  if (typeof Lenis === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Отступ из CSS
  const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset")) || 104;
  const lenis = new Lenis({
    anchors: { offset },
  });

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    });
  }
})();
