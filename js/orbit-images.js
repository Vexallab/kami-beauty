// Орбита видео

(function () {
  "use strict";

  function generateEllipsePath(cx, cy, rx, ry) {
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
  }
  function generateCirclePath(cx, cy, r) {
    return generateEllipsePath(cx, cy, r, r);
  }
  function generateSquarePath(cx, cy, size) {
    const h = size / 2;
    return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
  }
  function generateRectanglePath(cx, cy, w, h) {
    const hw = w / 2;
    const hh = h / 2;
    return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
  }
  function generateTrianglePath(cx, cy, size) {
    const height = (size * Math.sqrt(3)) / 2;
    const hs = size / 2;
    return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
  }
  function generateStarPath(cx, cy, outerR, innerR, points) {
    const step = Math.PI / points;
    let path = "";
    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path + " Z";
  }
  function generateHeartPath(cx, cy, size) {
    const s = size / 30;
    return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
  }
  function generateInfinityPath(cx, cy, w, h) {
    const hw = w / 2;
    const hh = h / 2;
    return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
  }
  function generateWavePath(cx, cy, w, amplitude, waves) {
    const pts = [];
    const segs = waves * 20;
    const hw = w / 2;
    for (let i = 0; i <= segs; i++) {
      const x = cx - hw + (w * i) / segs;
      const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
      pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    for (let i = segs; i >= 0; i--) {
      const x = cx - hw + (w * i) / segs;
      const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
      pts.push(`L ${x} ${y}`);
    }
    return pts.join(" ") + " Z";
  }

  const EASE_MAP = {
    linear: "linear",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  };

  function buildPath(container, cx, cy) {
    const shape = container.dataset.shape || "ellipse";
    const radiusX = parseFloat(container.dataset.radiusX || "700");
    const radiusY = parseFloat(container.dataset.radiusY || "170");
    const radius = parseFloat(container.dataset.radius || "300");
    const starPoints = parseFloat(container.dataset.starPoints || "5");
    const starInnerRatio = parseFloat(container.dataset.starInnerRatio || "0.5");

    switch (shape) {
      case "circle":
        return generateCirclePath(cx, cy, radius);
      case "ellipse":
        return generateEllipsePath(cx, cy, radiusX, radiusY);
      case "square":
        return generateSquarePath(cx, cy, radius * 2);
      case "rectangle":
        return generateRectanglePath(cx, cy, radiusX * 2, radiusY * 2);
      case "triangle":
        return generateTrianglePath(cx, cy, radius * 2);
      case "star":
        return generateStarPath(cx, cy, radius, radius * starInnerRatio, starPoints);
      case "heart":
        return generateHeartPath(cx, cy, radius * 2);
      case "infinity":
        return generateInfinityPath(cx, cy, radiusX * 2, radiusY * 2);
      case "wave":
        return generateWavePath(cx, cy, radiusX * 2, radiusY, 3);
      case "custom":
        return container.dataset.customPath || generateCirclePath(cx, cy, radius);
      default:
        return generateEllipsePath(cx, cy, radiusX, radiusY);
    }
  }

  function initOrbit(container) {
    const sources = Array.from(container.querySelectorAll(":scope > .orbit-source"));
    if (!sources.length) return;

    const baseWidth = parseFloat(container.dataset.baseWidth || "1400");
    const rotation = parseFloat(container.dataset.rotation || "-8");
    const duration = parseFloat(container.dataset.duration || "40");
    const itemSize = parseFloat(container.dataset.itemSize || "64");
    const direction = container.dataset.direction === "reverse" ? "reverse" : "normal";
    const fill = container.dataset.fill !== "false";
    const easing = EASE_MAP[container.dataset.easing] || "linear";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paused = container.dataset.paused === "true" || prefersReducedMotion;

    const cx = baseWidth / 2;
    const cy = baseWidth / 2;
    const path = buildPath(container, cx, cy);

    if (!(window.CSS && CSS.supports && CSS.supports("offset-path", `path("${path}")`))) {
      container.classList.add("no-offset-path");
    }

    const scalingContainer = document.createElement("div");
    scalingContainer.className = "orbit-scaling-container";
    scalingContainer.style.width = `${baseWidth}px`;
    scalingContainer.style.height = `${baseWidth}px`;

    const rotationWrapper = document.createElement("div");
    rotationWrapper.className = "orbit-rotation-wrapper";
    rotationWrapper.style.transform = `rotate(${rotation}deg)`;

    if (container.dataset.showPath === "true") {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "orbit-path-svg");
      svg.setAttribute("viewBox", `0 0 ${baseWidth} ${baseWidth}`);
      const pathEl = document.createElementNS(svgNS, "path");
      pathEl.setAttribute("d", path);
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke", container.dataset.pathColor || "rgba(0,0,0,0.1)");
      pathEl.setAttribute("stroke-width", container.dataset.pathWidth || "2");
      svg.appendChild(pathEl);
      rotationWrapper.appendChild(svg);
    }

    const total = sources.length;
    sources.forEach((video, index) => {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.classList.add("orbit-video");

      const item = document.createElement("div");
      item.className = "orbit-item";
      if (paused) item.classList.add("is-paused");
      item.style.width = `${itemSize}px`;
      item.style.height = `${itemSize}px`;
      item.style.offsetPath = `path("${path}")`;
      item.style.offsetRotate = "0deg";
      item.style.offsetAnchor = "center center";
      item.style.animationDuration = `${duration}s`;
      item.style.animationDirection = direction;
      item.style.animationTimingFunction = easing;

      const phase = fill ? index / total : 0;
      item.style.animationDelay = `${-phase * duration}s`;

      const inner = document.createElement("div");
      inner.style.width = "100%";
      inner.style.height = "100%";
      inner.style.transform = `rotate(${-rotation}deg)`;

      inner.appendChild(video);
      item.appendChild(inner);
      rotationWrapper.appendChild(item);
    });

    scalingContainer.appendChild(rotationWrapper);
    container.appendChild(scalingContainer);

    function relayout() {
      const scale = container.clientWidth / baseWidth;
      scalingContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    const ro = new ResizeObserver(relayout);
    ro.observe(container);
    relayout();

    // Ленивая загрузка видео
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (!el.src && el.dataset.src) el.src = el.dataset.src;
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      });
    });
    sources.forEach((video) => {
      // Заглушка при ошибке
      video.addEventListener("error", () => {
        video.classList.add("orbit-video--broken");
        const holder = video.parentElement;
        if (holder && video.poster) {
          holder.style.backgroundImage = `url("${video.poster}")`;
          holder.style.backgroundSize = "cover";
          holder.style.backgroundPosition = "center";
          holder.style.borderRadius = "14px";
        }
      });
      io.observe(video);
    });
  }

  function boot() {
    document.querySelectorAll("[data-orbit-images]").forEach(initOrbit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
