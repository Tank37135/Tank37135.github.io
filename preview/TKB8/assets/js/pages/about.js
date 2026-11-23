import { copyValue } from "../core/copy.js";
import { el } from "../core/dom.js";

export function renderAbout({ content }) {
  const grid = document.getElementById("about-now-grid");
  if (!grid) return;

  const items = copyValue(content, "about.now.items") || [];

  grid.replaceChildren(
    ...items.map((item) => {
      const row = el("article", "now-card");
      row.append(
        el("h3", "now-card__title", item.title),
        el("p", "now-card__text", item.text)
      );
      return row;
    })
  );
}
