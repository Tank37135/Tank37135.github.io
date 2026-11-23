import { el, icon, chip, timeElement } from "../core/dom.js";
import { siteUrl } from "../core/paths.js";

export function createWorkCard(work, copy) {
  const node = el(
    work.href ? "a" : "article",
    `work-tile${work.href ? "" : " work-tile--static"}`
  );

  if (work.href) {
    node.href = siteUrl(work.href);
  }

  const media = el("div", "work-tile__media");

  if (work.image) {
    const image = el("img");
    image.src = siteUrl(work.image);
    image.alt = work.imageAlt || work.title;
    image.width = 1440;
    image.height = 900;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    media.classList.add("work-tile__media--type");
    media.append(
      el("span", "work-tile__index", String(work.order || 0).padStart(2, "0")),
      (() => {
        const line = el("div", "work-tile__type");
        line.append(
          el("span", "", work.categoryLabel),
          el("span", "", work.year)
        );
        return line;
      })()
    );
  }

  const body = el("div", "work-tile__body");

  const meta = el("div", "work-tile__meta");
  meta.append(
    el("span", "", work.categoryLabel),
    el("span", "", work.year)
  );

  const foot = el("div", "work-tile__foot");
  const tags = el("div", "work-tile__tags");
  (work.tags || []).forEach((tag) => tags.append(chip(tag)));

  foot.append(tags);

  if (work.href) {
    foot.append(icon("arrow-up-right", { className: "work-tile__arrow" }));
  }

  if (work.image) {
    body.append(meta);
  }

  body.append(
    el("h3", "work-tile__title", work.title),
    el("p", "work-tile__text", work.summary),
    foot
  );

  node.append(media, body);
  return node;
}

export function createToolCard(tool, copy) {
  const node = el("a", "tool-tile");
  node.href = siteUrl(tool.href);

  const media = el("div", "tool-tile__media");

  if (tool.image) {
    const image = el("img");
    image.src = siteUrl(tool.image);
    image.alt = tool.imageAlt || tool.title;
    image.width = 1280;
    image.height = 800;
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    const glyph = el("span", "icon icon--xl");
    glyph.style.setProperty("--icon", `url("${siteUrl(tool.icon)}")`);
    glyph.setAttribute("aria-hidden", "true");
    media.append(glyph);
    media.classList.add("tool-tile__media--icon");
  }

  const body = el("div", "tool-tile__body");

  const meta = el("div", "tool-tile__meta");
  meta.append(
    chip(tool.statusLabel || copy["tools.status.online"], "chip--status")
  );

  const foot = el("div", "tool-tile__foot");
  const tags = el("div", "tool-tile__tags");
  (tool.tags || []).forEach((tag) => tags.append(chip(tag)));
  foot.append(tags, icon("arrow-right", { className: "tool-tile__arrow" }));

  body.append(
    meta,
    el("h3", "tool-tile__title", tool.title),
    el("p", "tool-tile__text", tool.summary),
    foot
  );

  node.append(media, body);
  return node;
}

export function createPostCard(post, copy) {
  const node = el("a", "post-row");
  node.href = siteUrl(`article.html?post=${encodeURIComponent(post.slug)}`);

  const date = timeElement(
    post.publishedAt,
    copy["common.published"],
    "post-row__date"
  );

  const body = el("div", "post-row__body");
  body.append(
    el("h3", "post-row__title", post.title),
    el("p", "post-row__excerpt", post.excerpt)
  );

  const tags = el("div", "post-row__tags");
  (post.tags || []).forEach((tag) => tags.append(chip(tag)));
  body.append(tags);

  const side = el("div", "post-row__side");
  side.append(
    el("span", "post-row__meta", `${post.readingTime} ${copy["common.minRead"]}`),
    icon("arrow-up-right", { className: "post-row__arrow" })
  );

  node.append(date, body, side);
  return node;
}

export function emptyState(title, text) {
  const box = el("div", "empty-state");
  box.append(el("h3", "empty-state__title", title));

  if (text) {
    box.append(el("p", "empty-state__text", text));
  }

  return box;
}
