import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL이 필요합니다.' });
  }

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content');
    const title = $('title').text();
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');
    const h1 = $('h1').first().text();

    const combinedText = `${title} ${ogDesc} ${metaDesc} ${h1}`.toLowerCase();
    let serviceType = 'lifestyle';

    if (combinedText.match(/saas|app|tool|platform/)) serviceType = 'saas';
    else if (combinedText.match(/beauty|cosmetic/)) serviceType = 'lifestyle';
    else if (combinedText.match(/food|cafe/)) serviceType = 'food';

    return res.status(200).json({
      brandName: ogTitle || title || '브랜드',
      service: ogDesc || metaDesc || '서비스 설명',
      currentMessaging: h1 || title || '메시지',
      painPoint: '타깃 고객의 주요 고민',
      serviceType: serviceType
    });

  } catch (error) {
    console.error('분석 오류:', error.message);
    return res.status(500).json({ 
      error: '분석 실패',
      details: error.message 
    });
  }
}
