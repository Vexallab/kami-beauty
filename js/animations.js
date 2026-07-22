// Анимации GSAP

(function () {
  "use strict";

  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Проявление при скролле */
  const revealTargets = gsap.utils.toArray(".reveal");
  if (revealTargets.length) {
    if (prefersReducedMotion) {
      gsap.set(revealTargets, { autoAlpha: 1 });
    } else {
      gsap.set(revealTargets, { autoAlpha: 0, y: 28 });
      revealTargets.forEach((el) => {
        const step = parseFloat(getComputedStyle(el).getPropertyValue("--i")) || 0;
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.8, delay: step * 0.09, ease: "power2.out" }),
        });
      });
    }
  }

  /* Анимация хиро-блока */
  const heroCopy = document.querySelector(".hero-copy");
  if (heroCopy && !prefersReducedMotion) {
    const statEls = gsap.utils.toArray(".hero-stats strong");

    function countUp(el) {
      const text = el.textContent.trim();
      const match = text.match(/^([\d.,]+)(.*)$/);
      if (!match) return;
      const suffix = match[2];
      const decimals = (match[1].split(/[.,]/)[1] || "").length;
      const target = parseFloat(match[1].replace(",", "."));
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => (el.textContent = counter.val.toFixed(decimals) + suffix),
      });
    }

    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".hero-copy .eyebrow", { autoAlpha: 0, y: 14, duration: 0.6 })
      .from(".hero-copy h1", { autoAlpha: 0, y: 28, duration: 0.8 }, "-=0.35")
      .from(".hero-copy p", { autoAlpha: 0, y: 20, duration: 0.7 }, "-=0.45")
      .from(".hero-actions .btn", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.12 }, "-=0.4")
      .from(".hero-stats > div", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, "-=0.35")
      .from(".hero-stage", { autoAlpha: 0, scale: 0.92, duration: 0.9, ease: "power2.out" }, "-=0.9")
      .add(() => statEls.forEach(countUp), "-=0.3");
  }

  /* Счётчик чисел */
  const countUpEls = document.querySelectorAll("[data-countup]");
  countUpEls.forEach((el) => {
    const to = parseFloat(el.dataset.to);
    const from = parseFloat(el.dataset.from || "0");
    const duration = parseFloat(el.dataset.duration || "2");
    const separator = el.dataset.separator || "";

    const decimalPlaces = (n) => {
      const str = String(n);
      return str.includes(".") ? str.split(".")[1].length : 0;
    };
    const decimals = Math.max(decimalPlaces(from), decimalPlaces(to));

    function format(n) {
      const formatted = n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return separator ? formatted.replace(/,/g, separator) : formatted;
    }

    if (prefersReducedMotion) {
      el.textContent = format(to);
      return;
    }

    el.textContent = format(from);
    const counter = { val: from };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(counter, {
          val: to,
          duration,
          ease: "power2.out",
          onUpdate: () => (el.textContent = format(counter.val)),
        }),
    });
  });

  /* Наклон карточек */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    function attachTilt(selector, max, scale) {
      document.querySelectorAll(selector).forEach((card) => {
        card.style.transformPerspective = "700px";
        const quickX = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3.out" });
        const quickY = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3.out" });
        const quickScale = gsap.quickTo(card, "scale", { duration: 0.4, ease: "power3.out" });

        card.addEventListener("pointermove", (e) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          quickX(px * max);
          quickY(-py * max);
          quickScale(scale);
        });
        card.addEventListener("pointerleave", () => {
          quickX(0);
          quickY(0);
          quickScale(1);
        });
      });
    }

    attachTilt(".service-card", 6, 1.015);
    attachTilt(".review-card", 5, 1.01);
    // без .portfolio-item
  }
})();
