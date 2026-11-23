import { el, chip } from "./dom.js";

export function flattenCopy(copy) {
  const flat = {};

  const walk = (value, prefix) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value)) {
        walk(child, prefix ? `${prefix}.${key}` : key);
      }
      return;
    }

    flat[prefix] = value;
  };

  walk(copy, "");
  return flat;
}

export function copyValue(content, key) {
  return flattenCopy(content.copy)[key];
}

export function applyCopy({ content }) {
  const copy = flattenCopy(content.copy);

  document.querySelectorAll("[data-copy]").forEach((node) => {
    const value = copy[node.dataset.copy];

    if (typeof value === "string" || typeof value === "number") {
      node.textContent = String(value);
    }
  });

  document.querySelectorAll("[data-copy-list]").forEach((node) => {
    const value = copy[node.dataset.copyList];

    if (!Array.isArray(value)) return;

    node.replaceChildren(
      ...value.map((text) => el("p", "", String(text)))
    );
  });

  document.querySelectorAll('[data-list="skills"]').forEach((node) => {
    const skills = content.skills || [];

    node.replaceChildren(
      ...skills.map((skill) => chip(skill.label, "chip--brand"))
    );
  });
}
