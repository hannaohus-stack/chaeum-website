export default async function handler(req, res) {
  try {
    const RSS_URL = 'https://chaeum-arch.tistory.com/rss';

    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CHAEUMBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    const items = parseRssItems(xml).slice(0, 6);

    return res.status(200).json({
      ok: true,
      blogUrl: 'https://chaeum-arch.tistory.com',
      items
    });
  } catch (error) {
    console.error('blog-feed error:', error);

    return res.status(500).json({
      ok: false,
      blogUrl: 'https://chaeum-arch.tistory.com',
      items: [],
      error: '블로그 피드를 불러오지 못했습니다.'
    });
  }
}

function parseRssItems(xml) {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return itemMatches.map(match => {
    const itemXml = match[1];

    const title = decodeHtmlEntities(extractTag(itemXml, 'title'));
    const link = decodeHtmlEntities(extractTag(itemXml, 'link'));
    const descriptionRaw = extractTag(itemXml, 'description');
    const pubDateRaw = extractTag(itemXml, 'pubDate');
    const category = decodeHtmlEntities(extractTag(itemXml, 'category'));

    const description = cleanDescription(descriptionRaw);
    const pubDate = formatDate(pubDateRaw);
    const thumbnail = extractThumbnail(descriptionRaw);

    return {
      title: title || '제목 없음',
      link: link || '#',
      description: description || '채움의 브랜드 전략 인사이트를 확인해보세요.',
      pubDate: pubDate || '',
      category: category || 'Insight',
      thumbnail: thumbnail || ''
    };
  }).filter(item => item.link && item.title);
}

function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const cdataRegex = new RegExp(`<${tagName}><!\$begin:math:display$CDATA\\\\\[\(\[\\\\s\\\\S\]\*\?\)\\$end:math:display$\\]><\\/${tagName}>`, 'i');

  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractThumbnail(descriptionHtml) {
  const imgMatch = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : '';
}

function cleanDescription(html) {
  if (!html) return '';

  const stripped = html
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const decoded = decodeHtmlEntities(stripped);

  if (decoded.length > 110) {
    return decoded.slice(0, 110).trim() + '...';
  }

  return decoded;
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
