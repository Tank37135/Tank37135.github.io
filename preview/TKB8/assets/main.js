/* Single script entry point.
   Loads data, renders shared chrome and copy, then mounts the page module. */

import { initTheme } from "./js/core/theme.js";
import { loadSiteData } from "./js/core/data.js";
import { renderChrome } from "./js/core/chrome.js";
import { applyCopy } from "./js/core/copy.js";
import { initNav } from "./js/core/nav.js";
import { initTagline } from "./js/core/tagline.js";
import { renderBootError } from "./js/core/error.js";
import { renderSkeletons } from "./js/core/skeleton.js";
import { getPageModule } from "./js/pages/index.js";

document.documentElement.classList.add("js");
initTheme();
renderSkeletons();

async function boot() {
  const page = document.body.dataset.page || "home";

  try {
    const data = await loadSiteData();

    renderChrome(data);
    applyCopy(data);

    const renderPage = getPageModule(page);
    if (renderPage) {
      await renderPage(data);
    }

    initNav();
    initTagline();
  } catch (error) {
    console.error("[Tank37135]", error);

    if (!document.body.hasAttribute("data-static")) {
      renderBootError(error);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
