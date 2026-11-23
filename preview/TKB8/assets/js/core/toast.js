import { el, icon } from "./dom.js";

let toast = null;
let timer = 0;

function ensureToast() {
  if (toast && document.body.contains(toast)) {
    return toast;
  }

  toast = el("div", "toast");
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.append(icon("check"));

  const message = el("span", "");
  toast.append(message);
  document.body.append(toast);

  return toast;
}

export function showToast(message) {
  const node = ensureToast();
  node.querySelector("span").textContent = message;
  node.classList.add("is-visible");

  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    node.classList.remove("is-visible");
  }, 2400);
}
