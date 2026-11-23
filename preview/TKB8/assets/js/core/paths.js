/* Resolve the site root from this module's own URL, so the site works
   both at a domain root and inside a sub directory. */
export const SITE_ROOT = new URL("../../../", import.meta.url);

export function siteUrl(path = "") {
  return new URL(path, SITE_ROOT).href;
}
