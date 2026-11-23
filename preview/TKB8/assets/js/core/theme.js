import { icon } from "./dom.js";

const STORAGE_KEY = "tank37135-theme";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION = 760;

function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function store(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* Storage can be unavailable. The theme still applies for this page. */
  }
}

export function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function initTheme() {
  const stored = readStored();
  if (stored) {
    document.documentElement.dataset.theme = stored;
    return;
  }

  if (!document.documentElement.dataset.theme) {
    document.documentElement.dataset.theme = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches
      ? "light"
      : "dark";
  }
}

function ensureThemeRing() {
  let ring = document.querySelector(".theme-ring");

  if (!ring) {
    ring = document.createElement("div");
    ring.className = "theme-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.append(ring);
  }

  ring.removeAttribute("popover");

  if (!ring.querySelector(".theme-ring__edge")) {
    const edge = document.createElement("div");
    edge.className = "theme-ring__edge";
    ring.append(edge);
  }

  return ring;
}

function clearRing(ring) {
  ring.style.removeProperty("view-transition-name");
  ring.style.opacity = "0";
}

export function initThemeToggle(button, labels) {
  if (!button) return;

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTransition = null;
  let switchToken = 0;

  const render = () => {
    const isDark = currentTheme() === "dark";
    const label = isDark ? labels.toLight : labels.toDark;

    button.replaceChildren(icon(isDark ? "sun" : "moon"));
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", isDark ? "#0b0a14" : "#f1f9fe");
    }
  };

  const applyTheme = (next) => {
    document.documentElement.dataset.theme = next;
    store(next);
    render();
    document.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: next } })
    );
  };

  const switchTheme = (next) => {
    const token = ++switchToken;

    if (!document.startViewTransition || reducedQuery.matches) {
      if (activeTransition) {
        try {
          activeTransition.skipTransition();
        } catch {
          /* Already finished. */
        }
        activeTransition = null;
      }

      const currentRing = document.querySelector(".theme-ring");
      if (currentRing) clearRing(currentRing);
      applyTheme(next);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const ring = ensureThemeRing();
    const edge = ring.querySelector(".theme-ring__edge");
    const root = document.documentElement;

    root.style.setProperty("--theme-ring-x", `${x}px`);
    root.style.setProperty("--theme-ring-y", `${y}px`);

    edge.style.left = `${x - radius}px`;
    edge.style.top = `${y - radius}px`;
    edge.style.width = `${radius * 2}px`;
    edge.style.height = `${radius * 2}px`;

    if (activeTransition) {
      try {
        activeTransition.skipTransition();
      } catch {
        /* Already finished. */
      }
      activeTransition = null;
    }

    clearRing(ring);

    let transition;

    try {
      transition = document.startViewTransition(() => {
        ring.style.setProperty("view-transition-name", "theme-ring");
        ring.style.opacity = "1";
        applyTheme(next);
      });
    } catch {
      clearRing(ring);
      applyTheme(next);
      return;
    }

    activeTransition = transition;

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: DURATION,
            easing: EASE,
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});

    transition.finished
      .catch(() => {})
      .finally(() => {
        if (token !== switchToken) return;
        activeTransition = null;
        clearRing(ring);
      });
  };

  button.addEventListener("click", () => {
    switchTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  render();
}
