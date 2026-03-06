export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brandUrl, email, pain } = req.body;
    if (!brandUrl || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key not configured');
    }

    const systemPrompt = `당신은 글로벌 브랜드 컨설팅 펌의 시니어 전략가입니다.
입력된 브랜드 정보를 분석하여 4가지 축으로 날카롭게 진단하세요:

1. POSITIONING (포지셔닝): 브랜드가 시장 어디에 위치하는가?
   - X축: 기능(0) ↔ 감성(100)
   - Y축: 매스마켓(0) ↔ 프리미엄(100)
   - 경쟁사 분석 포함

2. MESSAGE CLARITY (메시지 일관성): 메시지가 명확한가?
   - 점수(0-100)와 핵심 키워드
   - 일관성 결함 지적

3. CONTENT STRUCTURE (콘텐츠 구조): 콘텐츠가 전략적인가?
   - 제품 중심(%) / 라이프스타일(%) / 스토리(%)
   - 부족한 부분 진단

4. FUNNEL STATUS (퍼널 효율): 구매 경로가 명확한가?
   - CTA 명확도, 구매 동선 효율
   - 시스템 누수 지점 지적

JSON 응답 형식만 반환하세요. 전문적이고 날카로운 어조를 유지하세요.`;

    const userPrompt = `
브랜드 URL: ${brandUrl}
고객의 주요 고민: ${pain}

이 브랜드의 4축 분석을 진행하고 다음 JSON만 반환하세요:
{
  "positioning": {
    "x": 숫자(0-100),
    "y": 숫자(0-100),
    "insight": "문장"
  },
  "messageClarity": {
    "score": 숫자(0-100),
    "keywords": ["키워드1", "키워드2"],
    "issue": "문제점"
  },
  "contentStructure": {
    "product": 숫자,
    "lifestyle": 숫자,
    "story": 숫자,
    "diagnosis": "진단"
  },
  "funnelStatus": {
    "score": 숫자(0-100),
    "leaks": ["누수지점1", "누수지점2"],
    "systemAlert": "경고"
  },
  "overallScore": 숫자(0-100)
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    let analysis;
    try {
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      analysis = getDefaultAnalysis();
    }

    return res.status(200).json({ 
      success: true, 
      analysis,
      brandUrl,
      email
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

function getDefaultAnalysis() {
  return {
    positioning: { x: 65, y: 45, insight: "프리미엄 지향이나 실제 메시지는 대중적 시장에 머물러 있습니다" },
    messageClarity: { score: 62, keywords: ["제품", "가성비", "편의성"], issue: "메시지가 분산되어 있어 브랜드 정체성이 모호합니다" },
    contentStructure: { product: 58, lifestyle: 28, story: 14, diagnosis: "팬덤을 형성할 스토리 근육이 부족합니다" },
    funnelStatus: { score: 55, leaks: ["CTA 부재", "구매 동선 복잡"], systemAlert: "월 마케팅 예산의 30-40%가 누수되고 있습니다" },
    overallScore: 58
  };
}
