export function initReveal(root = document) {
  const items = Array.from(root.querySelectorAll(".reveal:not(.is-visible)"));
  if (!items.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          continue;
        }

        /* If the page jumped past an element, reveal it rather than leave
           content invisible above the viewport. */
        if (entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
  );

  items.forEach((item) => observer.observe(item));
}
