import { copyValue } from "../core/copy.js";
import { el, formatDateLong } from "../core/dom.js";

export function renderLegal({ content }, kind) {
  const root = document.getElementById("legal-body");
  if (!root) return;

  const sections = copyValue(content, `${kind}.sections`) || [];
  const updated = document.getElementById("legal-updated");

  if (updated) {
    const page = content.pages[kind];
    updated.textContent = page?.updatedAt
      ? `${content.copy["common.updated"]}：${formatDateLong(page.updatedAt)}`
      : "";
  }

  root.replaceChildren(
    ...sections.map((section) => {
      const block = el("section", "legal__section");
      block.append(el("h2", "", section.title));

      (section.paragraphs || []).forEach((paragraph) => {
        block.append(el("p", "", paragraph));
      });

      return block;
    })
  );
}
