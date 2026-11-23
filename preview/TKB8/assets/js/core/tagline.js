import { el } from "./dom.js";

function segment(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("zh-CN", { granularity: "word" });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }

  return Array.from(text);
}

export function initTagline() {
  const node = document.getElementById("tagline-text");
  if (!node) return;

  const text = node.dataset.raw || node.textContent;
  if (!text) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const words = [];

  node.replaceChildren();

  for (const part of segment(text)) {
    if (part === "\n") {
      node.append(document.createElement("br"));
      continue;
    }

    if (!part.trim()) {
      node.append(document.createTextNode(" "));
      continue;
    }

    const span = el("span", "tagline__word", part);
    node.append(span);
    words.push(span);
  }

  words.forEach((word, index) => {
    const tone = Math.min(
      4,
      Math.floor((index / Math.max(1, words.length)) * 4) + 1
    );
    word.classList.add(`tagline__word--tone-${tone}`);
  });

  if (reduced || !("IntersectionObserver" in window)) {
    words.forEach((word) => word.classList.add("is-lit"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-lit");
          observer.unobserve(entry.target);
          continue;
        }

        if (entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add("is-lit");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -35% 0px", threshold: 0.1 }
  );

  words.forEach((word) => observer.observe(word));
}
