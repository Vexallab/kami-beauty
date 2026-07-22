// Калькулятор цены

(function () {
  "use strict";

  const SERVICE_BASE = { manicure: 1800, extension: 3200, pedicure: 2500 };
  const COATING_ADDON = { manicure: 1000, extension: 0, pedicure: 1300 };
  const DESIGN_ADDON = { none: 0, french: 300, chrome: 400, art: 250, decor: 100, ombre: 500 };

  function formatRub(amount) {
    return `от ${amount.toLocaleString("ru-RU")} ₽`;
  }

  function boot() {
    const root = document.querySelector("[data-price-calc]");
    if (!root) return;

    const serviceEl = root.querySelector("[data-calc-service]");
    const designEl = root.querySelector("[data-calc-design]");
    const coatingEl = root.querySelector("[data-calc-coating]");
    const resultEl = root.querySelector("[data-calc-result]");
    if (!serviceEl || !designEl || !coatingEl || !resultEl) return;

    function recalc() {
      const service = serviceEl.value;
      let total = SERVICE_BASE[service] || 0;
      if (coatingEl.checked) total += COATING_ADDON[service] || 0;
      total += DESIGN_ADDON[designEl.value] || 0;
      resultEl.textContent = formatRub(total);
    }

    // Наращивание без покрытия
    function syncCoatingAvailability() {
      const isExtension = serviceEl.value === "extension";
      coatingEl.disabled = isExtension;
      if (isExtension) coatingEl.checked = false;
    }

    root.addEventListener("change", () => {
      syncCoatingAvailability();
      recalc();
    });

    syncCoatingAvailability();
    recalc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
