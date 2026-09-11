(() => {
  document.querySelectorAll(".accordion__btn").forEach((btn) => {
    const item = btn.closest(".accordion__item");
    const panel = item?.querySelector(".accordion__panel");
    if (!item || !panel) return;

    const sync = (open) => {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
    };

    sync(btn.getAttribute("aria-expanded") === "true");
    btn.addEventListener("click", () => sync(panel.hidden));
  });

  document.querySelectorAll(".ba").forEach((ba) => {
    const range = ba.querySelector(".ba__range");
    const top = ba.querySelector(".ba__top");
    const handle = ba.querySelector(".ba__handle");
    if (!range || !top || !handle) return;

    const apply = (value) => {
      const v = Number(value);
      top.style.width = `${v}%`;
      handle.style.left = `${v}%`;
    };

    range.addEventListener("input", () => apply(range.value));
    apply(range.value || 50);
  });

  const burger = document.querySelector(".burger");
  const mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-scroll-top]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
})();
