import { el, icon, formatDateShort } from "../core/dom.js";
import { siteUrl } from "../core/paths.js";
import { buildArchive } from "../components/archive.js";

function createItem(entry) {
  const item = el("li", "timeline__item");

  const date = el("time", "timeline__date", formatDateShort(entry.date));
  date.dateTime = entry.date;

  const marker = el("span", "timeline__marker");
  marker.append(el("span", "timeline__dot"));

  const body = el("div", "timeline__body");
  const title = el("h3", "timeline__title");

  if (entry.href) {
    const link = el("a", "timeline__link");
    link.href = siteUrl(entry.href);
    link.append(
      el("span", "", entry.title),
      icon("arrow-up-right", { className: "timeline__arrow" })
    );
    title.append(link);
  } else {
    title.append(el("span", "", entry.title));
  }

  body.append(title, el("p", "timeline__summary", entry.summary));
  item.append(date, marker, body);

  return item;
}

export function renderArchive({ content, history, posts, works, tools }) {
  const list = document.getElementById("archive-timeline");
  if (!list) return;

  const entries = buildArchive(history, posts, works, tools);

  if (entries.length) {
    list.replaceChildren(...entries.map(createItem));
  } else {
    list.replaceChildren(
      el("li", "timeline__empty", content.copy["archive.empty"])
    );
  }

  list.removeAttribute("aria-busy");
}
