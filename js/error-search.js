// Поиск на 404

(function () {
  "use strict";

  const PAGES = [
    { title: "Главная", url: "index.html", keywords: "главная дом студия о нас" },
    { title: "Услуги и цены", url: "prices.html", keywords: "услуги цены прайс стоимость маникюр педикюр наращивание дизайн гель-лак брови ресницы" },
    { title: "Портфолио", url: "portfolio.html", keywords: "портфолио работы фото галерея примеры" },
    { title: "Отзывы", url: "reviews.html", keywords: "отзывы оценки рейтинг клиенты" },
    { title: "Контакты", url: "contacts.html", keywords: "контакты адрес телефон метро карта" },
    { title: "Записаться", url: "contacts.html#booking", keywords: "запись записаться форма онлайн-запись бронь" },
    { title: "Политика конфиденциальности", url: "privacy.html", keywords: "политика конфиденциальность данные" },
  ];

  function boot() {
    const form = document.querySelector("[data-error-search]");
    if (!form) return;
    const input = form.querySelector("input");
    const hint = document.querySelector("[data-error-search-hint]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim().toLowerCase();
      if (!query) return;

      const match = PAGES.find((p) => (p.title + " " + p.keywords).toLowerCase().includes(query));
      if (match) {
        window.location.href = match.url;
        return;
      }
      if (hint) {
        hint.textContent = `Ничего не нашлось по запросу «${input.value.trim()}» — попробуйте один из разделов ниже.`;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
