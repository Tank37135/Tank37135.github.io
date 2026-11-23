import { el, icon } from "./dom.js";
import { siteUrl } from "./paths.js";
import { initThemeToggle } from "./theme.js";
import { copyText } from "./clipboard.js";
import { showToast } from "./toast.js";

function renderHeader(content) {
  const host = document.getElementById("site-header");
  if (!host) return;

  const { site, navigation, copy } = content;

  host.className = "site-header";

  const nav = el("nav", "nav");
  nav.setAttribute("aria-label", copy["common.mainNav"]);

  const brand = el("a", "nav__brand");
  brand.href = siteUrl("index.html");

  const logo = el("img", "nav__logo");
  logo.src = siteUrl(site.logo);
  logo.alt = "";
  logo.width = 28;
  logo.height = 28;
  logo.decoding = "async";

  brand.append(logo, el("span", "", site.title));

  const links = el("div", "nav__links");

  navigation.forEach((item) => {
    const link = el("a", "nav__link", item.label);
    link.href = siteUrl(item.href);

    if (document.body.dataset.section === item.id) {
      link.setAttribute("aria-current", "page");
    }

    links.append(link);
  });

  const actions = el("div", "nav__actions");

  const cta = el("a", "btn btn--primary nav__cta", copy["home.hero.cta"]);
  cta.href = siteUrl("category/works/");

  const themeButton = el("button", "icon-button nav__theme");
  themeButton.type = "button";
  themeButton.dataset.themeToggle = "";

  const toggle = el("button", "icon-button nav__toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "site-menu");
  toggle.setAttribute("aria-label", copy["common.openMenu"]);
  toggle.dataset.labelOpen = copy["common.openMenu"];
  toggle.dataset.labelClose = copy["common.closeMenu"];
  toggle.append(icon("menu"), icon("x"));

  actions.append(cta, themeButton, toggle);
  nav.append(brand, links, actions);
  host.replaceChildren(nav);

  initThemeToggle(themeButton, {
    toLight: copy["common.themeLight"],
    toDark: copy["common.themeDark"],
  });

  buildMobileMenu(content, toggle);
}

function buildMobileMenu(content, toggle) {
  const { site, navigation, footer, copy } = content;

  const menu = el("div", "mobile-menu");
  menu.id = "site-menu";
  menu.setAttribute("aria-hidden", "true");
  menu.setAttribute("inert", "");

  const head = el("div", "mobile-menu__head");
  head.append(el("span", "mobile-menu__title", copy["common.menuTitle"]));

  const closeButton = el("button", "icon-button");
  closeButton.type = "button";
  closeButton.dataset.menuClose = "";
  closeButton.setAttribute("aria-label", copy["common.closeMenu"]);
  closeButton.append(icon("x"));
  head.append(closeButton);

  const nav = el("nav", "mobile-menu__nav");
  nav.setAttribute("aria-label", copy["common.mobileNav"]);

  const links = el("div", "mobile-menu__links");

  navigation.forEach((item, index) => {
    const link = el("a", "mobile-menu__link", item.label);
    link.href = siteUrl(item.href);
    link.style.setProperty("--i", String(index));

    if (document.body.dataset.section === item.id) {
      link.setAttribute("aria-current", "page");
    }

    links.append(link);
  });

  const cta = el(
    "a",
    "btn btn--primary btn--block mobile-menu__cta",
    copy["home.hero.cta"]
  );
  cta.href = siteUrl("category/works/");

  nav.append(links, cta);

  const foot = el("div", "mobile-menu__foot");
  foot.append(
    el("span", "", site.tagline),
    el("span", "", footer.server)
  );

  menu.append(head, nav, foot);
  document.body.append(menu);

  toggle.setAttribute("aria-controls", menu.id);
}

function renderFooter(content) {
  const host = document.getElementById("site-footer");
  if (!host) return;

  const { site, footer, copy } = content;

  host.className = "site-footer";

  const container = el("div", "container");
  const grid = el("div", "footer__grid");

  const brand = el("div", "footer__brand");
  const brandLink = el("a", "footer__brand-link");
  brandLink.href = siteUrl("index.html");

  const logo = el("img", "footer__logo");
  logo.src = siteUrl(site.logo);
  logo.alt = "";
  logo.width = 32;
  logo.height = 32;
  logo.decoding = "async";

  brandLink.append(logo, el("span", "", site.title));
  brand.append(
    brandLink,
    el("p", "footer__blurb body-5", footer.blurb)
  );

  const columns = el("div", "footer__columns");

  footer.columns.forEach((column) => {
    const group = el("div", "footer__column");
    group.append(el("h3", "footer__column-title", column.title));

    const list = el("div", "footer__links");

    column.links.forEach((item) => {
      const link = el("a", "footer__link", item.label);
      link.href = siteUrl(item.href);
      list.append(link);
    });

    group.append(list);
    columns.append(group);
  });

  grid.append(brand, columns);

  const bottom = el("div", "footer__bottom");
  const meta = el("div", "footer__meta");

  meta.append(el("span", "caption-5", footer.note));

  const server = el("button", "footer__server");
  server.type = "button";
  server.setAttribute("aria-label", copy["common.copyServer"]);
  server.append(icon("copy", { size: "icon--sm" }), el("span", "", footer.server));

  server.addEventListener("click", async () => {
    try {
      await copyText(footer.server);
      showToast(copy["common.copied"]);
    } catch {
      showToast(copy["common.copyFailed"]);
    }
  });

  meta.append(server);
  bottom.append(el("span", "caption-5", footer.copyright), meta);

  container.append(
    el("h2", "visually-hidden", copy["common.footerNav"]),
    grid,
    bottom
  );
  host.replaceChildren(container);
}

function renderScrollProgress() {
  const bar = el("div", "scroll-progress");
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
}

function renderBackToTop(copy) {
  const button = el("button", "back-to-top");
  button.type = "button";
  button.setAttribute("aria-label", copy["common.backToTop"]);
  button.append(icon("arrow-up"));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  const update = () => {
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 240;
    button.classList.toggle(
      "is-visible",
      window.scrollY > 500 && !nearBottom
    );
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  update();
  document.body.append(button);
}

export function renderChrome(data) {
  renderHeader(data.content);
  renderFooter(data.content);
  renderScrollProgress();
  renderBackToTop(data.content.copy);
}
