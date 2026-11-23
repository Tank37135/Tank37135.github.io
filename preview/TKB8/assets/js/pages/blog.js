import { createPostCard, emptyState } from "../components/cards.js";

export function renderBlog({ content, posts }) {
  const list = document.getElementById("blog-list");
  if (!list) return;

  const copy = content.copy;
  const items = [...posts.items].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  if (items.length) {
    list.replaceChildren(...items.map((post) => createPostCard(post, copy)));
  } else {
    list.replaceChildren(emptyState(copy["common.empty"], copy["blog.empty"]));
  }

  list.removeAttribute("aria-busy");
}
