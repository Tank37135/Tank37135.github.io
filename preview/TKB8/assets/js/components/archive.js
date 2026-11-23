export function buildArchive(history, posts, works, tools) {
  const entries = [];

  (history.items || []).forEach((item) => {
    entries.push({
      title: item.title,
      summary: item.summary,
      date: item.date,
      href: item.href || null,
    });
  });

  (posts.items || []).forEach((post) => {
    entries.push({
      title: post.title,
      summary: post.excerpt,
      date: post.publishedAt,
      href: `article.html?post=${encodeURIComponent(post.slug)}`,
    });
  });

  (works.items || []).forEach((work) => {
    entries.push({
      title: work.title,
      summary: work.summary,
      date: work.updatedAt,
      href: work.href || null,
    });
  });

  (tools.items || []).forEach((tool) => {
    entries.push({
      title: tool.title,
      summary: tool.summary,
      date: tool.updatedAt,
      href: tool.href,
    });
  });

  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}
