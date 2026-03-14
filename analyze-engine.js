const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function normalizeUrl(url = '') {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function extractBrandName(url = '', brandDescription = '') {
  if (url) {
    try {
      const hostname = new URL(normalizeUrl(url)).hostname.replace('www.', '');
      const name = hostname.split('.')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {}
  }
  if (brandDescription) return '입력 브랜드';
  return 'Brand';
}

function problemLabel(value = '') {
  const map = {
    messaging: '브랜드 메시지가 약함',
    traffic: '고객 유입이 부족함',
    conversion: '전환율이 낮음',
    positioning: '포지셔닝이 불명확함',
    growth: '장기 성장 구조가 없음'
  };
  return map[value] || '-';
}

function fallbackReport(input = {}) {
  const website = normalizeUrl(input.website || '');
  const brandName = extractBrandName(website, input.brandDescription);

  return {
    brandName,
    website,
    brandDescription: input.brandDescription || '',
    targetCustomer: input.targetCustomer || '',
    mainProduct: input.mainProduct || '',
    mainProblem: input.mainProblem || '',
    bottleneckKey: 'brand-funnel',
    bottleneckLabel: '브랜드 퍼널 구조 부재',
    shortSummary:
      '현재 브랜드는 제품 또는 서비스 자체보다, 그것이 유입과 구매, 반복매출로 어떻게 연결되는지가 충분히 구조화되지 않았을 가능성이 큽니다.',
    reportSummary:
      '이 브랜드는 제품 방향성은 보이지만, 돈이 흐르는 구조로 연결되는 퍼널 설계가 아직 약할 가능성이 있습니다.',
    structureAnalysis:
      '현재 구조는 브랜드 메시지, 오퍼, 랜딩, 전환 흐름이 하나의 시스템으로 연결되어 있지 않을 수 있습니다. 이 경우 브랜드가 아니라 운영과 대표자 개인 역량에 의존하게 됩니다.',
    futureRisk:
      '이 구조가 유지되면 광고 효율 저하, 가격 경쟁, 반복매출 부족, 대표자 의존 증가로 이어질 수 있습니다.',
    chaeumInsight:
      '채움은 브랜드를 예쁘게 만드는 회사가 아니라, 제품 → 고객 → 구매 → 반복매출로 이어지는 구조를 설계합니다.',
    recommendedAction:
      '지금 단계에서는 더 많은 마케팅보다 브랜드 메시지와 퍼널 구조를 먼저 정리해야 합니다.',
    recommendedService: '브랜드 구조 설계',
    recommendedSystem: '채움 구조 설계 템플릿',
    timestamp: new Date().toISOString()
  };
}

function cleanJsonText(text = '') {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const input = req.body || {};
  const website = normalizeUrl(input.website || '');
  const brandDescription = input.brandDescription || '';
  const targetCustomer = input.targetCustomer || '';
  const mainProduct = input.mainProduct || '';
  const mainProblem = input.mainProblem || '';
  const mainProblemLabel = input.mainProblemLabel || problemLabel(mainProblem);
  const brandName = extractBrandName(website, brandDescription);

  if (!website && !brandDescription) {
    return res.status(400).json({ error: '웹사이트 또는 브랜드 설명이 필요합니다.' });
  }

  const prompt = `
You are a senior brand strategist at CHAEUM.

CHAEUM does not sell vague branding advice.
CHAEUM sells revenue structure:
- brand structure
- funnel structure
- landing structure
- product planning
- meta > landing > conversion design
- website structure
- repeat revenue structure

Your task is to identify the most important structural bottleneck.

Think like a sharp consultant:
- not generic
- not motivational
- not decorative branding
- focus on what blocks money flow

Return ONLY valid JSON with this exact structure:

{
  "bottleneckKey": "",
  "bottleneckLabel": "",
  "shortSummary": "",
  "reportSummary": "",
  "structureAnalysis": "",
  "futureRisk": "",
  "chaeumInsight": "",
  "recommendedAction": "",
  "recommendedService": "",
  "recommendedSystem": ""
}

Rules:
- If product planning is missing, say product planning is needed first.
- If conversion is weak, point to landing / offer / CTA / funnel.
- If traffic is the issue, distinguish between true traffic problem and post-click structure problem.
- If branding is weak, translate it into positioning/message structure.
- Always recommend what CHAEUM should likely sell.

INPUT
Brand name: ${brandName}
Website: ${website || '없음'}
Brand description: ${brandDescription || '없음'}
Target customer: ${targetCustomer || '없음'}
Main product/service: ${mainProduct || '없음'}
Main problem selected by user: ${mainProblemLabel || '없음'}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in brand architecture, offer design, funnel strategy, and revenue structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    const cleaned = cleanJsonText(raw);
    const parsed = JSON.parse(cleaned);

    const fallback = fallbackReport(input);

    return res.status(200).json({
      brandName,
      website,
      brandDescription,
      targetCustomer,
      mainProduct,
      mainProblem,
      bottleneckKey: parsed.bottleneckKey || fallback.bottleneckKey,
      bottleneckLabel: parsed.bottleneckLabel || fallback.bottleneckLabel,
      shortSummary: parsed.shortSummary || fallback.shortSummary,
      reportSummary: parsed.reportSummary || fallback.reportSummary,
      structureAnalysis: parsed.structureAnalysis || fallback.structureAnalysis,
      futureRisk: parsed.futureRisk || fallback.futureRisk,
      chaeumInsight: parsed.chaeumInsight || fallback.chaeumInsight,
      recommendedAction: parsed.recommendedAction || fallback.recommendedAction,
      recommendedService: parsed.recommendedService || fallback.recommendedService,
      recommendedSystem: parsed.recommendedSystem || fallback.recommendedSystem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return res.status(200).json(fallbackReport(input));
  }
};
