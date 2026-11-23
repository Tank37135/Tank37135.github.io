import { el, icon, timeElement, chip, formatDateLong } from "../core/dom.js";
import { siteUrl } from "../core/paths.js";

function blockNode(block) {
  switch (block.type) {
    case "h2":
      return el("h2", "", block.text);

    case "list": {
      const list = el("ul");
      (block.items || []).forEach((item) => list.append(el("li", "", item)));
      return list;
    }

    case "quote":
      return el("blockquote", "", block.text);

    case "code": {
      const pre = el("pre");
      const code = el("code", "", block.text);
      if (block.lang) code.dataset.lang = block.lang;
      pre.append(code);
      return pre;
    }

    default:
      return el("p", "", block.text || "");
  }
}

function setMeta(name, value) {
  let node = document.querySelector(`meta[name="${name}"]`);

  if (!node) {
    node = document.querySelector(`meta[property="${name}"]`);
  }

  if (!node) {
    node = el("meta");
    if (name.startsWith("og:")) {
      node.setAttribute("property", name);
    } else {
      node.setAttribute("name", name);
    }
    document.head.append(node);
  }

  node.setAttribute("content", value);
}

function notFound(content) {
  const copy = content.copy;
  const box = el("div", "error-page");

  box.append(
    el("p", "error-page__code", copy["error.code"]),
    el("h1", "heading-2 error-page__title", copy["blog.notFound"]),
    el("p", "error-page__text", copy["blog.empty"])
  );

  const actions = el("div", "error-page__actions");

  const toBlog = el("a", "btn btn--primary", copy["blog.back"]);
  toBlog.href = siteUrl("category/blog/");

  const toHome = el("a", "btn btn--secondary", copy["common.backHome"]);
  toHome.href = siteUrl("index.html");

  actions.append(toBlog, toHome);
  box.append(actions);

  return box;
}

function navLink(post, label) {
  const link = el("a", "article__nav-link");
  link.href = siteUrl(`article.html?post=${encodeURIComponent(post.slug)}`);
  link.append(
    el("span", "article__nav-label", label),
    el("span", "article__nav-title", post.title)
  );
  return link;
}

export function renderArticle({ content, posts }) {
  const root = document.getElementById("article-root");
  if (!root) return;

  const copy = content.copy;
  const slug = new URLSearchParams(window.location.search).get("post");
  const sorted = [...posts.items].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  const post = sorted.find((item) => item.slug === slug);

  if (!post) {
    document.title = `${copy["blog.notFound"]} | Tank37135`;
    root.replaceChildren(notFound(content));
    root.removeAttribute("aria-busy");
    return;
  }

  document.title = `${post.title} | Tank37135`;
  setMeta("description", post.excerpt);
  setMeta("og:title", post.title);
  setMeta("og:description", post.excerpt);
  setMeta("og:url", window.location.href);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", window.location.href);

  const article = el("article", "article");

  const back = el("a", "article__back");
  back.href = siteUrl("category/blog/");
  back.append(icon("arrow-left"), el("span", "", copy["blog.back"]));

  const header = el("header");
  header.append(el("h1", "heading-2 article__title", post.title));

  const meta = el("div", "article__meta");
  meta.append(
    timeElement(post.publishedAt, copy["common.published"]),
    el("span", "", "·"),
    el("span", "", `${post.readingTime} ${copy["common.minRead"]}`),
    el("span", "", "·"),
    el("span", "", `${copy["common.updated"]} ${formatDateLong(post.updatedAt)}`)
  );
  header.append(meta);

  const tags = el("div", "article__tags");
  (post.tags || []).forEach((tag) => tags.append(chip(tag, "chip--brand")));
  header.append(tags);

  const body = el("div", "article__body");
  (post.body || []).forEach((block) => body.append(blockNode(block)));

  const index = sorted.indexOf(post);
  const newer = sorted[index - 1];
  const older = sorted[index + 1];

  const footer = el("footer", "article__footer");

  if (newer || older) {
    const nav = el("div", "article__nav");
    if (newer) nav.append(navLink(newer, copy["blog.prev"]));
    if (older) nav.append(navLink(older, copy["blog.next"]));
    footer.append(nav);
  }

  article.append(back, header, body, footer);
  root.replaceChildren(article);
  root.removeAttribute("aria-busy");
}
