import { el } from "./dom.js";

export function renderBootError(error) {
  const main = document.getElementById("main");
  if (!main) return;

  const box = el("div", "boot-error");
  box.setAttribute("role", "alert");

  box.append(
    el("h1", "boot-error__title", "内容没能加载"),
    el(
      "p",
      "boot-error__text",
      "请检查网络连接，或确认站点是通过本地服务器打开的。"
    ),
    el("p", "boot-error__detail", error && error.message ? error.message : "未知错误")
  );

  const actions = el("div", "boot-error__actions");
  const retry = el("button", "btn btn--primary", "重新加载");
  retry.type = "button";
  retry.addEventListener("click", () => window.location.reload());
  actions.append(retry);
  box.append(actions);

  main.replaceChildren(box);
}
