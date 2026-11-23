import { el } from "../core/dom.js";
import { createWorkCard, emptyState } from "../components/cards.js";

const FILTERS = ["all", "web", "minecraft", "3d"];

export function renderWorks({ content, works }) {
  const grid = document.getElementById("works-grid");
  const filters = document.getElementById("works-filters");
  const count = document.getElementById("works-count");

  if (!grid) return;

  const copy = content.copy;
  const items = [...works.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  let active = "all";
  const hash = window.location.hash.replace("#", "");
  if (FILTERS.includes(hash)) active = hash;

  function draw() {
    const list =
      active === "all"
        ? items
        : items.filter((work) => (work.category || []).includes(active));

    if (list.length) {
      grid.replaceChildren(...list.map((work) => createWorkCard(work, copy)));
      grid.querySelectorAll(".work-tile").forEach((tile, index) => {
        tile.classList.add("is-filtered-in");
        tile.style.setProperty("--i", String(index));
      });
    } else {
      grid.replaceChildren(emptyState(copy["common.empty"], copy["works.empty"]));
    }

    grid.removeAttribute("aria-busy");

    if (count) {
      count.textContent = `${list.length} ${copy["works.countUnit"]}`;
    }

    filters?.querySelectorAll(".filter").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === active));
    });
  }

  if (filters) {
    filters.setAttribute("aria-label", copy["common.filters"]);

    const buttons = FILTERS.map((key) => {
      const button = el("button", "filter", copy[`works.filter.${key}`]);
      button.type = "button";
      button.dataset.filter = key;
      button.setAttribute("aria-pressed", String(key === active));

      button.addEventListener("click", () => {
        if (active === key) return;

        active = key;

        if (key === "all") {
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          window.history.replaceState(null, "", `#${key}`);
        }

        draw();
      });

      return button;
    });

    filters.replaceChildren(...buttons);
  }

  draw();
}
