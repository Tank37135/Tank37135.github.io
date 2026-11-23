export function el(tag, className = "", text = "") {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  if (text) {
    node.textContent = text;
  }

  return node;
}

export function icon(name, { size = "", className = "" } = {}) {
  const node = el("span", ["icon", `icon--${name}`, size, className].filter(Boolean).join(" "));
  node.setAttribute("aria-hidden", "true");
  return node;
}

export function clear(node) {
  node.replaceChildren();
}

export function setCopy(node, text) {
  if (typeof text === "string" || typeof text === "number") {
    node.textContent = String(text);
  }
}

export function formatDateShort(iso) {
  /* Keep the date exactly as recorded in the data, independent of the
     viewer's timezone (the ISO strings carry their own +08:00 offset). */
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (match) return `${match[1]}.${match[2]}.${match[3]}`;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatDateLong(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function timeElement(iso, label, className = "") {
  const node = el("time", className, formatDateShort(iso));
  node.dateTime = iso;
  node.setAttribute("aria-label", `${label} ${formatDateLong(iso)}`);
  return node;
}

export function chip(label, variant = "") {
  return el("span", ["chip", variant].filter(Boolean).join(" "), label);
}

export function externalAnchor(href, className, label) {
  const anchor = el("a", className, label);
  anchor.href = href;
  return anchor;
}
