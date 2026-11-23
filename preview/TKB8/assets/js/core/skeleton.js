import { el } from "./dom.js";

function skeletonTile() {
  const tile = el("div", "skeleton-tile");
  tile.setAttribute("aria-hidden", "true");

  const body = el("div", "skeleton-tile__body");
  body.append(
    el("div", "skeleton skeleton--line skeleton--short"),
    el("div", "skeleton skeleton--title"),
    el("div", "skeleton skeleton--line"),
    el("div", "skeleton skeleton--line skeleton--short")
  );

  tile.append(el("div", "skeleton skeleton--media"), body);
  return tile;
}

function skeletonTimeline() {
  const item = el("li", "timeline__item timeline__item--skeleton");
  item.setAttribute("aria-hidden", "true");

  const marker = el("span", "timeline__marker");
  marker.append(el("span", "timeline__dot timeline__dot--skeleton"));

  const body = el("div", "timeline__body");
  body.append(
    el("div", "skeleton skeleton--title"),
    el("div", "skeleton skeleton--line"),
    el("div", "skeleton skeleton--line skeleton--short")
  );

  item.append(
    el("div", "skeleton skeleton--line skeleton--short"),
    marker,
    body
  );
  return item;
}

function skeletonRow() {
  const row = el("div", "skeleton-row");
  row.setAttribute("aria-hidden", "true");

  const body = el("div", "skeleton-tile__body");
  body.append(
    el("div", "skeleton skeleton--title"),
    el("div", "skeleton skeleton--line"),
    el("div", "skeleton skeleton--line skeleton--short")
  );

  row.append(
    el("div", "skeleton skeleton--line skeleton--short"),
    body,
    el("div", "skeleton skeleton--line skeleton--short")
  );
  return row;
}

export function renderSkeletons(root = document) {
  root.querySelectorAll("[data-skeleton]").forEach((node) => {
    const [kind, rawCount] = node.dataset.skeleton.split(":");
    const count = Number(rawCount) || 3;
    const make =
      kind === "post"
        ? skeletonRow
        : kind === "archive"
          ? skeletonTimeline
          : skeletonTile;

    node.replaceChildren(...Array.from({ length: count }, make));
  });
}
