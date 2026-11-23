import { el, icon, formatDateShort } from "../core/dom.js";
import { siteUrl } from "../core/paths.js";
import { buildArchive } from "../components/archive.js";
import {
  createWorkCard,
  createToolCard,
  createPostCard,
} from "../components/cards.js";

function byOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0);
}

function byPublishedDesc(a, b) {
  return new Date(b.publishedAt) - new Date(a.publishedAt);
}

function renderProjectMap(content) {
  const list = document.getElementById("project-map");
  if (!list) return;

  const items = content.projectMap || [];

  list.replaceChildren(
    ...items.map((item) => {
      const link = el("a", "project-map__item");
      link.href = siteUrl(item.href);

      const body = el("span", "project-map__body");
      body.append(
        el("span", "project-map__name", item.title),
        el("span", "project-map__meta", item.meta)
      );

      link.append(
        el("span", "project-map__dot"),
        body,
        icon("arrow-up-right")
      );

      return link;
    })
  );
}

function renderTaglineArchive(data) {
  const list = document.getElementById("home-archive");
  if (!list) return;

  const copy = data.content.copy;
  const entries = buildArchive(data.history, data.posts, data.works, data.tools);

  list.replaceChildren(
    ...entries.slice(0, 3).map((entry) => {
      const node = el(entry.href ? "a" : "div", "tagline-archive__item");

      if (entry.href) {
        node.href = siteUrl(entry.href);
      }

      node.append(
        el("span", "tagline-archive__title", entry.title),
        el("span", "tagline-archive__date", formatDateShort(entry.date).slice(5))
      );

      return node;
    })
  );

  const count = document.getElementById("home-archive-count");
  if (count) {
    count.textContent = `${entries.length} ${copy["archive.countUnit"]}`;
  }
}

function initHeroParallax() {
  const wrapper = document.querySelector(".hero__visual");
  const card = wrapper?.querySelector(".app-frame");

  if (!wrapper || !card) return;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!fine || reduced) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = 0;

  const tick = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    card.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

    if (
      Math.abs(targetX - currentX) > 0.02 ||
      Math.abs(targetY - currentY) > 0.02
    ) {
      raf = window.requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  };

  const run = () => {
    if (!raf) raf = window.requestAnimationFrame(tick);
  };

  card.style.willChange = "transform";

  wrapper.addEventListener("pointermove", (event) => {
    const rect = wrapper.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;

    targetX = x * 8;
    targetY = y * 8;
    run();
  });

  wrapper.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    run();
  });
}

function renderWorks(content, works) {
  const grid = document.getElementById("home-works");
  if (!grid) return;

  const copy = content.copy;
  const all = [...works.items].sort(byOrder);
  const featured = all.filter((work) => work.featured);
  const list = (featured.length ? featured : all).slice(0, 3);

  grid.replaceChildren(...list.map((work) => createWorkCard(work, copy)));
  grid.removeAttribute("aria-busy");
}

function renderTools(content, tools) {
  const grid = document.getElementById("home-tools");
  if (!grid) return;

  const copy = content.copy;
  const list = [...tools.items].sort(byOrder).slice(0, 2);

  grid.replaceChildren(...list.map((tool) => createToolCard(tool, copy)));
  grid.removeAttribute("aria-busy");
}

function renderPosts(content, posts) {
  const list = document.getElementById("home-posts");
  if (!list) return;

  const copy = content.copy;
  const items = [...posts.items].sort(byPublishedDesc).slice(0, 3);

  list.replaceChildren(...items.map((post) => createPostCard(post, copy)));
  list.removeAttribute("aria-busy");
}

export function renderHome(data) {
  renderProjectMap(data.content);
  renderTaglineArchive(data);
  renderWorks(data.content, data.works);
  renderTools(data.content, data.tools);
  renderPosts(data.content, data.posts);
  initHeroParallax();
}
