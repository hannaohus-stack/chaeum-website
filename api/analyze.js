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

    if (combinedText.match(/saas|app|tool|platform|협업|도구/)) serviceType = 'saas';
    else if (combinedText.match(/shop|store|mall|쇼핑|판매/)) serviceType = 'ecommerce';
    else if (combinedText.match(/beauty|cosmetic|뷰티|화장품/)) serviceType = 'lifestyle';
    else if (combinedText.match(/food|cafe|음식|식품/)) serviceType = 'food';

    const analysis = {
      brandName: ogTitle || title || '알 수 없는 브랜드',
      service: ogDesc || metaDesc || h1 || '설명을 찾을 수 없습니다.',
      currentMessaging: h1 || title || '메인 메시지를 분석 중입니다.',
      painPoint: `해당 분야에서 겪는 불편함을 해결하고 싶어합니다.`,
      serviceType: serviceType
    };

    return res.status(200).json(analysis);

  } catch (error) {
    console.error('분석 오류:', error.message);
    return res.status(500).json({ 
      error: '웹사이트를 분석할 수 없습니다.',
      details: error.message 
    });
  }
}
