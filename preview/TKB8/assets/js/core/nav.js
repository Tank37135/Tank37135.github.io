export function initNav() {
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("site-menu");

  if (!toggle || !menu) return;

  const closeButton = menu.querySelector("[data-menu-close]");
  const labelOpen = toggle.dataset.labelOpen || "打开导航菜单";
  const labelClose = toggle.dataset.labelClose || "关闭导航菜单";
  const desktop = window.matchMedia("(min-width: 1024px)");

  let lastFocused = null;

  const isOpen = () => menu.classList.contains("is-open");

  function onKeydown(event) {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = Array.from(
      menu.querySelectorAll("a[href], button:not([disabled])")
    ).filter((node) => node.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open() {
    if (isOpen()) return;

    lastFocused = document.activeElement;
    menu.removeAttribute("inert");
    menu.removeAttribute("aria-hidden");
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", labelClose);
    document.body.classList.add("is-locked");

    document.addEventListener("keydown", onKeydown);

    window.setTimeout(() => {
      const target = closeButton || menu.querySelector("a[href]");
      if (target) target.focus();
    }, 60);
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen()) return;

    menu.classList.remove("is-open");
    menu.setAttribute("inert", "");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", labelOpen);
    document.body.classList.remove("is-locked");

    document.removeEventListener("keydown", onKeydown);

    if (restoreFocus && lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  }

  toggle.addEventListener("click", () => {
    if (isOpen()) close();
    else open();
  });

  closeButton?.addEventListener("click", () => close());

  menu.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => close({ restoreFocus: false }));
  });

  desktop.addEventListener("change", (event) => {
    if (event.matches) close({ restoreFocus: false });
  });
}
