const FILES = {
  content: "content.json",
  works: "works.json",
  tools: "tools.json",
  posts: "posts.json",
  history: "history.json",
};

const cache = new Map();

async function fetchJson(name) {
  if (cache.has(name)) {
    return cache.get(name);
  }

  const file = FILES[name];
  const url = new URL(`../../${file}`, import.meta.url);
  const response = await fetch(url, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`assets/${file} 加载失败（HTTP ${response.status}）`);
  }

  const json = await response.json();
  cache.set(name, json);
  return json;
}

export async function loadSiteData() {
  const [content, works, tools, posts, history] = await Promise.all([
    fetchJson("content"),
    fetchJson("works"),
    fetchJson("tools"),
    fetchJson("posts"),
    fetchJson("history"),
  ]);

  return { content, works, tools, posts, history };
}
