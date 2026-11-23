import { renderHome } from "./home.js";
import { renderWorks } from "./works.js";
import { renderTools } from "./tools.js";
import { renderBlog } from "./blog.js";
import { renderArchive } from "./archive.js";
import { renderArticle } from "./article.js";
import { renderAbout } from "./about.js";
import { renderLegal } from "./legal.js";

const MODULES = {
  home: renderHome,
  works: renderWorks,
  tools: renderTools,
  blog: renderBlog,
  archive: renderArchive,
  article: renderArticle,
  about: renderAbout,
  privacy: (data) => renderLegal(data, "privacy"),
  terms: (data) => renderLegal(data, "terms"),
};

export function getPageModule(page) {
  return MODULES[page] || null;
}
