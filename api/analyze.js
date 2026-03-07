export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL 필요' });
    }

    const targetUrl = normalizeUrl(url);
    const html = await fetchWebsiteHtml(targetUrl);

    const extracted = extractWebsiteSignals(html, targetUrl);
    const scores = calculateScores(extracted);
    const bottleneck = detectBottleneck(scores);
    const strongestAsset = detectStrongestAsset(scores);

    const response = {
      brandName: extracted.brandName,
      website: targetUrl,
      serviceType: extracted.serviceType,
      stage: calculateStage(scores),
      scores,
      bottleneck,
      bottleneckLabel: mapBottleneckLabel(bottleneck),
      strongestAsset: mapStrongestAssetLabel(strongestAsset),
      summary: generateSummary(scores, bottleneck),
      chaeumInsight: generateChaeumInsight(bottleneck, extracted, scores),
      funnelDiagnosis: generateFunnelDiagnosis(extracted, scores),
      extractedData: {
        title: extracted.title,
        metaDescription: extracted.metaDescription,
        h1: extracted.h1,
        h2List: extracted.h2List.slice(0, 6),
        buttons: extracted.buttons.slice(0, 10),
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('분석 오류:', error);

    return res.status(500).json({
      error: '분석 실패',
      detail: error.message || '알 수 없는 오류',
      brandName: 'Brand',
      website: '',
      serviceType: 'other',
      stage: 'Early',
      scores: {
        brandClarity: 0,
        messageStrength: 0,
        trustStructure: 0,
        conversionStructure: 0,
        growthReadiness: 0
      },
      bottleneck: 'brandClarity',
      bottleneckLabel: '브랜드 선명도 부족',
      strongestAsset: '확인 불가',
      summary: '기술적 문제로 분석을 완료하지 못했습니다.',
      chaeumInsight: '현재 자동 분석 결과를 생성하지 못했습니다.',
      funnelDiagnosis: {
        awareness: '분석 불가',
        trust: '분석 불가',
        conversion: '분석 불가',
        keyIssue: '분석 불가'
      },
      extractedData: {
        title: '',
        metaDescription: '',
        h1: '',
        h2List: [],
        buttons: []
      }
    });
  }
}

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

async function fetchWebsiteHtml(targetUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    if (!html || html.length < 200) {
      throw new Error('HTML 추출 실패');
    }

    return html;
  } finally {
    clearTimeout(timeout);
  }
}

function extractWebsiteSignals(html, targetUrl) {
  const title = matchOne(html, /<title[^>]*>(.*?)<\/title>/is);
  const metaDescription =
    matchOne(html, /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["'][^>]*>/is, 1) ||
    matchOne(html, /<meta[^>]+content=["'](.*?)["'][^>]+name=["']description["'][^>]*>/is, 1);

  const h1 = matchOne(html, /<h1[^>]*>(.*?)<\/h1>/is);
  const h2List = matchAll(html, /<h2[^>]*>(.*?)<\/h2>/gis);

  const buttonTexts = [
    ...matchAll(html, /<button[^>]*>(.*?)<\/button>/gis),
    ...matchAll(html, /<a[^>]*>(.*?)<\/a>/gis)
  ]
    .map(cleanText)
    .filter(Boolean)
    .filter(text => text.length <= 50);

  const navText = extractNavText(html);
  const bodyText = cleanText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );

  const combined = [
    title,
    metaDescription,
    h1,
    h2List.join(' '),
    navText,
    buttonTexts.join(' '),
    bodyText.slice(0, 8000)
  ].join(' ').toLowerCase();

  const brandName = inferBrandName(targetUrl, title);
  const serviceType = detectServiceType(combined);

  return {
    brandName,
    serviceType,
    title,
    metaDescription,
    h1,
    h2List,
    buttons: buttonTexts,
    navText,
    bodyText,
    combinedText: combined,

    hasTargetAudience: /for |help|designed for|ideal for|브랜드|고객|사장님|창업자|팀|운영자|사용자/.test(combined),
    hasValueProposition: /solution|benefit|value|growth|improve|better|simplify|clarity|전략|성장|해결|개선|차별화|브랜딩|자동화|단축|효율/.test(combined),
    hasCTA: /문의|상담|신청|예약|구매|시작|contact|book|schedule|request|demo|start|get started|apply/.test(buttonTexts.join(' ').toLowerCase()),
    hasTrustSignal: /review|testimonial|case study|client|partner|featured|후기|사례|고객사|브랜드와 함께|works|trusted by/.test(combined),
    hasContentHub: /blog|journal|insight|article|news|콘텐츠|인사이트|블로그/.test(combined),
    hasPricingInfo: /pricing|plan|membership|subscription|요금|플랜|멤버십|구독/.test(combined),
    hasStory: /about|story|philosophy|mission|vision|소개|철학|스토리|미션|비전/.test(combined),
    hasConversionPath: /buy|shop|purchase|checkout|문의|상담|예약|구매|신청|demo|contact/.test(combined),
    hasRetentionSignal: /membership|community|newsletter|subscribe|club|멤버십|구독|커뮤니티|뉴스레터|회원/.test(combined),
    hasSocialProof: /instagram|youtube|threads|newsletter|press|media|언론|리뷰|후기/.test(combined),

    h1Length: h1.length,
    h2Count: h2List.length,
    buttonCount: buttonTexts.length
  };
}

function calculateScores(extracted) {
  let brandClarity = 0;
  let messageStrength = 0;
  let trustStructure = 0;
  let conversionStructure = 0;
  let growthReadiness = 0;

  // Brand Clarity
  if (extracted.title) brandClarity += 10;
  if (extracted.h1) brandClarity += 15;
  if (extracted.hasTargetAudience) brandClarity += 20;
  if (extracted.hasValueProposition) brandClarity += 25;
  if (extracted.hasStory) brandClarity += 10;
  if (extracted.h1Length >= 8 && extracted.h1Length <= 120) brandClarity += 10;
  if (extracted.h2Count >= 2) brandClarity += 10;

  // Message Strength
  if (extracted.metaDescription) messageStrength += 15;
  if (extracted.h1) messageStrength += 15;
  if (extracted.h2Count >= 2) messageStrength += 10;
  if (extracted.hasValueProposition) messageStrength += 25;
  if (extracted.hasTargetAudience) messageStrength += 15;
  if (extracted.buttonCount >= 2) messageStrength += 10;
  if (extracted.title && extracted.metaDescription) messageStrength += 10;

  // Trust Structure
  if (extracted.hasTrustSignal) trustStructure += 35;
  if (extracted.hasStory) trustStructure += 15;
  if (extracted.hasContentHub) trustStructure += 10;
  if (extracted.hasSocialProof) trustStructure += 10;
  if (extracted.h2Count >= 3) trustStructure += 10;
  if (/about|team|story|vision|mission|소개|철학|브랜드/.test(extracted.navText.toLowerCase())) {
    trustStructure += 10;
  }

  // Conversion Structure
  if (extracted.hasCTA) conversionStructure += 25;
  if (extracted.hasConversionPath) conversionStructure += 25;
  if (extracted.hasPricingInfo) conversionStructure += 10;
  if (extracted.buttonCount >= 3) conversionStructure += 10;
  if (/contact|book|schedule|request|문의|상담|예약|신청/.test(extracted.buttons.join(' ').toLowerCase())) {
    conversionStructure += 15;
  }
  if (/buy|shop|purchase|구매|주문/.test(extracted.buttons.join(' ').toLowerCase())) {
    conversionStructure += 15;
  }

  // Growth Readiness
  if (extracted.hasRetentionSignal) growthReadiness += 25;
  if (extracted.hasContentHub) growthReadiness += 15;
  if (extracted.hasPricingInfo) growthReadiness += 10;
  if (extracted.hasConversionPath) growthReadiness += 10;
  if (extracted.hasTrustSignal) growthReadiness += 10;
  if (extracted.hasSocialProof) growthReadiness += 10;
  if (/newsletter|community|membership|subscribe|구독|멤버십|회원/.test(extracted.combinedText)) {
    growthReadiness += 20;
  }

  return {
    brandClarity: clamp(brandClarity),
    messageStrength: clamp(messageStrength),
    trustStructure: clamp(trustStructure),
    conversionStructure: clamp(conversionStructure),
    growthReadiness: clamp(growthReadiness)
  };
}

function detectBottleneck(scores) {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
}

function detectStrongestAsset(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function calculateStage(scores) {
  const avg =
    (scores.brandClarity +
      scores.messageStrength +
      scores.trustStructure +
      scores.conversionStructure +
      scores.growthReadiness) / 5;

  if (avg >= 80) return 'Scalable';
  if (avg >= 65) return 'Structured';
  if (avg >= 45) return 'Emerging';
  return 'Early';
}

function mapBottleneckLabel(key) {
  const map = {
    brandClarity: '브랜드 선명도 부족',
    messageStrength: '메시지 전달력 부족',
    trustStructure: '신뢰 설계 부족',
    conversionStructure: '전환 구조 부족',
    growthReadiness: '성장 준비도 부족'
  };
  return map[key] || '핵심 병목 분석 중';
}

function mapStrongestAssetLabel(key) {
  const map = {
    brandClarity: '브랜드 방향성',
    messageStrength: '메시지 구조',
    trustStructure: '신뢰 자산',
    conversionStructure: '행동 유도 구조',
    growthReadiness: '확장 가능성'
  };
  return map[key] || '기초 구조';
}

function generateSummary(scores, bottleneck) {
  const avg =
    (scores.brandClarity +
      scores.messageStrength +
      scores.trustStructure +
      scores.conversionStructure +
      scores.growthReadiness) / 5;

  const base =
    avg >= 70
      ? '현재 브랜드는 기본적인 구조와 방향성은 갖추고 있으나, 성장 효율을 높이기 위해서는 병목 구간에 대한 정교한 조정이 필요한 상태입니다.'
      : avg >= 50
      ? '현재 브랜드는 성장 가능성은 충분하지만, 구조적 완성도가 아직 고르지 않아 일부 구간에서 효율 손실이 발생하고 있는 상태입니다.'
      : '현재 브랜드는 기본적인 방향성은 존재하지만, 실질적인 성장으로 이어지기 위해서는 구조와 메시지, 전환 흐름 전반에 대한 재정비가 필요한 상태입니다.';

  const detailMap = {
    brandClarity: '특히 브랜드 선명도가 낮은 경우, 고객은 이 브랜드를 한 문장으로 이해하지 못해 초기 인식 단계에서 이탈할 가능성이 높습니다.',
    messageStrength: '특히 메시지 전달력이 낮은 경우, 고객은 브랜드의 가치와 차별점을 체감하지 못해 관심이 행동으로 이어지지 않을 가능성이 높습니다.',
    trustStructure: '특히 신뢰 설계가 약한 경우, 브랜드의 첫인상은 나쁘지 않더라도 실제 선택 단계에서 충분한 확신을 주지 못할 수 있습니다.',
    conversionStructure: '특히 전환 구조가 약한 경우, 유입이 존재하더라도 문의, 상담, 구매로 이어지는 핵심 흐름이 끊기게 됩니다.',
    growthReadiness: '특히 성장 준비도가 낮은 경우, 단기 유입은 만들 수 있어도 장기적인 반복 매출과 운영 안정성 확보가 어렵습니다.'
  };

  return `${base} ${detailMap[bottleneck] || ''}`.trim();
}

function generateChaeumInsight(bottleneck, extracted, scores) {
  const insights = {
    brandClarity: `채움 관점에서 현재 이 브랜드의 가장 큰 문제는 감각이나 분위기의 부족이 아니라, 시장 안에서 어떻게 해석되어야 하는지가 충분히 선명하지 않다는 점입니다. 고객이 첫 화면에서 “이 브랜드는 누구를 위한 무엇인지”를 즉시 이해하지 못하면, 이후의 콘텐츠나 전환 장치가 존재하더라도 전체 효율은 낮아질 수밖에 없습니다. 지금 단계에서는 표현을 늘리기보다 포지셔닝 문장, 핵심 고객 정의, 대표 가치 제안을 먼저 정리하는 것이 우선입니다.`,

    messageStrength: `채움 관점에서 이 브랜드는 기본적인 구조는 갖추고 있지만, 고객이 실제로 이해하고 반응할 수 있는 메시지 언어로 충분히 정리되어 있지 않습니다. 현재 문구가 브랜드 내부 시각이나 기능 설명에 머물러 있다면, 고객은 ‘좋아 보인다’고 느껴도 ‘왜 지금 선택해야 하는지’까지는 연결되지 않습니다. 따라서 메시지 구조를 고객 문제, 해결 방식, 기대 결과의 흐름으로 다시 설계하고, 메인 카피와 서브 카피의 역할을 분명히 나누는 작업이 필요합니다.`,

    trustStructure: `채움 관점에서 현재 가장 보완이 필요한 부분은 첫인상보다 신뢰 자산의 축적 구조입니다. 브랜드 소개, 철학, 사례, 후기, 작동 방식, 결과에 대한 설명이 충분히 보이지 않으면 방문자는 호감은 가질 수 있어도 결정을 내리지는 않습니다. 특히 서비스형 브랜드일수록 신뢰는 감각이 아니라 구조로 설계되어야 합니다. 지금 단계에서는 브랜드의 말이 아니라 근거가 보이도록, 사례와 증거 중심의 설명 자산을 추가하는 것이 중요합니다.`,

    conversionStructure: `채움 관점에서 이 브랜드는 브랜드 자체의 인상보다도, 방문 이후 행동으로 이어지는 흐름 설계가 더 시급한 상태입니다. 사용자가 유입된 뒤 무엇을 읽고, 어떤 확신을 얻고, 어떤 행동을 해야 하는지가 명확하지 않으면 좋은 메시지도 실제 전환으로 연결되지 않습니다. 즉 문제는 콘텐츠의 양이 아니라 경로의 명확성입니다. CTA의 위치, 제안 방식, 문의 또는 상담 유도 흐름을 단계별로 다시 설계해야 전환 효율을 높일 수 있습니다.`,

    growthReadiness: `채움 관점에서 현재 이 브랜드는 단기 유입이나 일회성 관심보다, 장기적으로 운영 가능한 성장 구조가 아직 충분히 준비되지 않은 상태로 보입니다. 브랜드가 건강하게 성장하려면 단순 방문과 구매를 넘어서 재방문, 재구매, 관계 유지, 반복 접점이 설계되어 있어야 합니다. 지금처럼 락인 구조가 약하면 매번 새 고객을 다시 데려와야 하므로 비용이 커집니다. 따라서 멤버십, 뉴스레터, 커뮤니티, 후속 제안 구조처럼 장기적 연결 장치를 붙이는 것이 필요합니다.`
  };

  return insights[bottleneck] || `채움 관점에서 현재 이 브랜드는 외형보다 구조 해석이 먼저 필요한 단계로 보입니다. 브랜드가 무엇을 말하고 있는지는 보이지만, 그것이 어떻게 신뢰와 전환, 장기 성장으로 이어지는지는 아직 충분히 정리되어 있지 않습니다. 따라서 지금 단계에서는 디자인 확장보다 브랜드 구조, 메시지 흐름, 전환 경로를 우선적으로 재정비하는 접근이 더 효과적입니다.`;
}

function generateFunnelDiagnosis(extracted, scores) {
  return {
    awareness: extracted.hasTargetAudience
      ? '누구를 위한 브랜드인지에 대한 단서는 일부 보입니다.'
      : '첫 화면에서 핵심 고객이 명확하게 드러나지 않습니다.',
    trust: extracted.hasTrustSignal || extracted.hasStory
      ? '신뢰와 설명 자산이 일부 확인됩니다.'
      : '후기, 사례, 소개, 철학 등 신뢰 장치가 부족합니다.',
    conversion: extracted.hasCTA
      ? '행동을 유도하는 요소는 있으나 더 구조적으로 연결될 필요가 있습니다.'
      : '문의, 예약, 구매 등 명확한 CTA가 약하거나 드러나지 않습니다.',
    keyIssue: detectBottleneck(scores)
  };
}

function detectServiceType(text) {
  if (/식품 라벨|표시사항|식품 신고|라벨 생성|nutrition label|food label|label automation/.test(text)) return 'food-tech';
  if (/saas|software|api|platform|workflow|dashboard|automation|tool/.test(text)) return 'saas';
  if (/consulting|strategy|branding|agency|marketing/.test(text)) return 'consulting';
  if (/beauty|skincare|wellness|cosmetic|hair/.test(text)) return 'lifestyle';
  if (/shop|store|buy|product|ecommerce|commerce/.test(text)) return 'ecommerce';
  if (/design|studio|creative|portfolio/.test(text)) return 'design';
  if (/education|course|academy|training|learn/.test(text)) return 'education';
  if (/health|fitness|medical|clinic|therapy/.test(text)) return 'health';
  if (/finance|payment|bank|invest|fintech/.test(text)) return 'fintech';
  if (/food|restaurant|meal|ingredient|nutrition|recipe|menu/.test(text)) return 'food';
  return 'other';
}

function inferBrandName(url, title) {
  if (title) {
    const cleaned = cleanText(title.split('|')[0].split('-')[0]).trim();
    if (cleaned) return cleaned;
  }
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.split('.')[0].toUpperCase();
  } catch {
    return 'Brand';
  }
}

function extractNavText(html) {
  const navBlocks = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
  return cleanText(navBlocks.join(' '));
}

function matchOne(text, regex, groupIndex = 1) {
  const match = text.match(regex);
  if (!match) return '';
  return cleanText(match[groupIndex] || '');
}

function matchAll(text, regex) {
  return [...text.matchAll(regex)]
    .map(match => cleanText(match[1] || match[2] || ''))
    .filter(Boolean);
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(num) {
  return Math.max(0, Math.min(100, Math.round(num)));
}
