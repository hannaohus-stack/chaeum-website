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

    const items = parseRssItems(xml);

    return res.status(200).json({
      ok: true,
      debug: {
        rssUrl: RSS_URL,
        xmlLength: xml.length,
        itemCount: items.length
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

function parseRssItems(xml) {
  const itemBlocks = xml.split('<item>').slice(1);
  const items = [];

  for (const block of itemBlocks) {
    const itemXml = block.split('</item>')[0];
    if (!itemXml) continue;

    const title = decodeHtml(extractTag(itemXml, 'title'));
    const link = decodeHtml(extractTag(itemXml, 'link'));
    const descriptionRaw = extractTag(itemXml, 'description');
    const pubDateRaw = extractTag(itemXml, 'pubDate');
    const category = decodeHtml(extractTag(itemXml, 'category')) || 'Insight';

    if (!title || !link) continue;

    items.push({
      title,
      link,
      description: cleanDescription(descriptionRaw),
      pubDate: formatDate(pubDateRaw),
      category
    });
  }

  return items;
}

function extractTag(xml, tagName) {
  const openCdata = `<${tagName}><![CDATA[`;
  const closeCdata = `]]></${tagName}>`;
  const openTag = `<${tagName}>`;
  const closeTag = `</${tagName}>`;

  if (xml.includes(openCdata)) {
    const start = xml.indexOf(openCdata) + openCdata.length;
    const end = xml.indexOf(closeCdata, start);
    if (end !== -1) {
      return xml.slice(start, end).trim();
    }
  }

  if (xml.includes(openTag)) {
    const start = xml.indexOf(openTag) + openTag.length;
    const end = xml.indexOf(closeTag, start);
    if (end !== -1) {
      return xml.slice(start, end).trim();
    }
  }

  return '';
}

function cleanDescription(html) {
  if (!html) {
    return '채움의 브랜드 전략 인사이트를 확인해보세요.';
  }

  const stripped = html
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const decoded = decodeHtml(stripped);

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

function decodeHtml(str) {
  return String(str || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
