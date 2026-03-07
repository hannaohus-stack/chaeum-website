export default async function handler(req, res) {
  const RSS_URL = 'https://chaeum-arch.tistory.com/rss';

  try {
    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CHAEUMBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    const items = itemMatches.map((match) => parseItem(match[1])).filter(Boolean);

    return res.status(200).json({
      ok: true,
      debug: {
        rssUrl: RSS_URL,
        xmlLength: xml.length,
        itemCount: itemMatches.length
      },
      items: items.slice(0, 6)
    });
  } catch (error) {
    console.error('blog-feed error:', error);

    return res.status(500).json({
      ok: false,
      error: error.message || '블로그 피드 처리 실패',
      items: []
    });
  }
}

function parseItem(itemXml) {
  const title = decodeHtmlEntities(extractTag(itemXml, 'title'));
  const link = decodeHtmlEntities(extractTag(itemXml, 'link'));
  const descriptionRaw = extractTag(itemXml, 'description');
  const pubDateRaw = extractTag(itemXml, 'pubDate');
  const category = decodeHtmlEntities(extractTag(itemXml, 'category')) || 'Insight';

  if (!title || !link) return null;

  return {
    title,
    link,
    description: cleanDescription(descriptionRaw),
    pubDate: formatDate(pubDateRaw),
    category
  };
}

function extractTag(xml, tagName) {
  // CDATA 우선
  const cdataRegex = new RegExp(
    `<${tagName}><!\$begin:math:display$CDATA\\\\\[\(\[\\\\s\\\\S\]\*\?\)\\$end:math:display$\\]><\\/${tagName}>`,
    'i'
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // 일반 태그
  const normalRegex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const normalMatch = xml.match(normalRegex);
  if (normalMatch) return normalMatch[1].trim();

  return '';
}

function cleanDescription(html) {
  if (!html) return '채움의 브랜드 전략 인사이트를 확인해보세요.';

  const stripped = html
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const decoded = decodeHtmlEntities(stripped);

  if (!decoded) {
    return '채움의 브랜드 전략 인사이트를 확인해보세요.';
  }

  return decoded.length > 120 ? decoded.slice(0, 120).trim() + '...' : decoded;
}

function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}. ${mm}. ${dd}`;
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
