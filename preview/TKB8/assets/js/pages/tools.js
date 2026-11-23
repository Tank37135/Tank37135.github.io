import { createToolCard } from "../components/cards.js";

export function renderTools({ content, tools }) {
  const grid = document.getElementById("tools-grid");
  if (!grid) return;

  const copy = content.copy;
  const items = [...tools.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  grid.replaceChildren(...items.map((tool) => createToolCard(tool, copy)));
  grid.removeAttribute("aria-busy");
}
