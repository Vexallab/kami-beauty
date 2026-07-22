// Общая логика сайта

(function () {
  "use strict";

  /* Тень шапки */
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Вкладки цен */
  const priceTabs = document.querySelectorAll("[data-price-tab]");
  const priceGroups = document.querySelectorAll("[data-price-group]");
  if (priceTabs.length) {
    priceTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-price-tab");
        priceTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        priceGroups.forEach((g) =>
          g.classList.toggle("is-active", g.getAttribute("data-price-group") === target || target === "all")
        );
      });
    });
  }

  /* Маска телефона */
  const phoneInput = document.querySelector("#phone");
  if (phoneInput) {
    const formatPhone = (digits) => {
      let out = "+7";
      if (digits.length > 1) out += ` (${digits.slice(1, 4)}`;
      if (digits.length >= 4) out += ")";
      if (digits.length > 4) out += ` ${digits.slice(4, 7)}`;
      if (digits.length > 7) out += `-${digits.slice(7, 9)}`;
      if (digits.length > 9) out += `-${digits.slice(9, 11)}`;
      return out;
    };

    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "");
      if (!digits) {
        phoneInput.value = "";
        return;
      }
      if (digits.startsWith("8")) digits = "7" + digits.slice(1);
      if (!digits.startsWith("7")) digits = "7" + digits;
      digits = digits.slice(0, 11);
      phoneInput.value = formatPhone(digits);
    });

    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) phoneInput.value = "+7 ";
    });

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value.trim() === "+7") phoneInput.value = "";
    });
  }

  /* Проверка размера фото */
  const fileInput = document.querySelector("[data-file-input]");
  if (fileInput) {
    const hint = document.querySelector("[data-file-hint]");
    const defaultHint = hint ? hint.textContent : "";
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        fileInput.value = "";
        if (hint) {
          hint.textContent = "Файл больше 5 МБ — пришлите фото поменьше или отправьте его нам в WhatsApp/Telegram отдельно.";
          hint.classList.add("is-warning");
        }
      } else if (hint) {
        hint.textContent = defaultHint;
        hint.classList.remove("is-warning");
      }
    });
  }

  /* Форма записи */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const success = document.querySelector("[data-form-success]");
    const error = document.querySelector("[data-form-error]");
    const submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      if (error) error.classList.remove("is-visible");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || !data.ok) throw new Error("submit_failed");

        form.reset();
        if (success) success.classList.add("is-visible");
      } catch (err) {
        if (error) error.classList.add("is-visible");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        }
      }
    });
  }

  /* Год в футере */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Регистрация Service Worker */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
