export default async function handler(req, res) {
  try {
    const RSS_URL = "https://chaeum-arch.tistory.com/rss";

    const response = await fetch(RSS_URL);

    const xml = await response.text();

    const items = parseItems(xml);

    res.status(200).json({
      ok: true,
      items: items.slice(0, 6)
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      items: []
    });
  }
}

function parseItems(xml) {

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;

  const items = [];

  let match;

  while ((match = itemRegex.exec(xml))) {

    const item = match[1];

    const title = extract(item, "title");
    const link = extract(item, "link");
    const description = extract(item, "description");
    const pubDate = extract(item, "pubDate");

    const cleanDesc = stripHtml(description).slice(0, 120);

    items.push({
      title,
      link,
      description: cleanDesc + "...",
      pubDate: formatDate(pubDate),
      category: "Insight"
    });
  }

  return items;
}

function extract(text, tag) {

  const regex = new RegExp(`<${tag}><!\$begin:math:display$CDATA\\\\\[\(\[\\\\s\\\\S\]\*\?\)\\$end:math:display$\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`);

  const match = text.match(regex);

  if (!match) return "";

  return (match[1] || match[2] || "").trim();
}

function stripHtml(html) {

  return html
    .replace(/<img[^>]*>/g, "")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateString) {

  const d = new Date(dateString);

  if (isNaN(d)) return "";

  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
