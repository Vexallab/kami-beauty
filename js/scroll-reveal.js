// Текст по словам

(function () {
  "use strict";
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wrapWords(el) {
    const text = el.textContent;
    el.textContent = "";
    text.split(/(\s+)/).forEach((chunk) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        el.appendChild(document.createTextNode(chunk));
        return;
      }
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = chunk;
      el.appendChild(span);
    });
  }

  function initScrollReveal(container) {
    const textEl = container.querySelector(".scroll-reveal-text");
    if (!textEl) return;
    wrapWords(textEl);
    const words = container.querySelectorAll(".word");
    if (!words.length) return;

    if (prefersReducedMotion) {
      gsap.set(container, { rotate: 0 });
      gsap.set(words, { opacity: 1, filter: "none" });
      return;
    }

    const baseOpacity = parseFloat(container.dataset.baseOpacity || "0.1");
    const baseRotation = parseFloat(container.dataset.baseRotation || "3");
    const blurStrength = parseFloat(container.dataset.blurStrength || "4");
    const enableBlur = container.dataset.enableBlur !== "false";
    const rotationEnd = container.dataset.rotationEnd || "bottom bottom";
    const wordAnimationEnd = container.dataset.wordAnimationEnd || "bottom bottom";

    gsap.fromTo(
      container,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: { trigger: container, start: "top bottom", end: rotationEnd, scrub: true },
      }
    );

    gsap.fromTo(
      words,
      { opacity: baseOpacity },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: { trigger: container, start: "top bottom-=20%", end: wordAnimationEnd, scrub: true },
      }
    );

    if (enableBlur) {
      gsap.fromTo(
        words,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: { trigger: container, start: "top bottom-=20%", end: wordAnimationEnd, scrub: true },
        }
      );
    }
  }

  function boot() {
    document.querySelectorAll(".scroll-reveal").forEach(initScrollReveal);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
