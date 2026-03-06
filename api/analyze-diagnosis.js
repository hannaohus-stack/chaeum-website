export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, brandName, email, revenueScale, website, service, target, consultation } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key not configured');
    }

    const systemPrompt = `당신은 Chaeum의 수석 브랜드 전략가이자 퍼널 마케팅 전문가입니다.
당신의 목적은 고객이 입력한 비즈니스 정보를 바탕으로 날카롭고 전문적인 '브랜드 진단 리포트'를 생성하여, 고객이 Chaeum의 유료 컨설팅으로 전환하게 만드는 것입니다.

# Core Principles
1. 뻔한 칭찬은 생략한다. 약점을 데이터로 날카롭게 지적하라.
2. 전문 용어(PMF, CAC, LTV)를 적절히 섞어 권위를 세우되, 설명은 명확하게 한다.
3. 확신에 찬 어조를 사용하라.
4. 모든 진단은 '20분 무료 상담'에서만 해결 가능하다는 미완결성을 유지한다.

# Analysis Framework
JSON 형식으로 답변하라:
{
  "critical_diagnosis": "구체적인 진단",
  "summary_verdict": "종합 평가",
  "metrics": {
    "message_clarity": 점수,
    "message_clarity_reason": "이유",
    "differentiation": 점수,
    "differentiation_reason": "이유",
    "conversion_path": 점수,
    "conversion_path_reason": "이유"
  },
  "strategic_gaps": [
    {"problem": "문제점 1", "impact": "영향도"},
    {"problem": "문제점 2", "impact": "영향도"},
    {"problem": "문제점 3", "impact": "영향도"}
  ],
  "consulting_preview": "상담 내용",
  "total_score": 0-100
}`;

    const userPrompt = `
[고객 정보]
브랜드명: ${brandName}
서비스: ${service}
타깃: ${target}
고민: ${consultation}
웹사이트: ${website || '없음'}

"${brandName}"을 위한 전문적인 브랜드 전략 분석을 제시해주세요.
JSON 형식의 응답을 반드시 지켜주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    let analysis;
    try {
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      analysis = getDefaultAnalysis(brandName, service, target);
    }

    return res.status(200).json({ success: true, analysis });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

function getDefaultAnalysis(brandName, service, target) {
  return {
    critical_diagnosis: `"${brandName}"이 타깃하는 "${target}"에게 제대로 인식되지 못하고 있습니다. 기능적 가치는 있지만 타깃이 느끼는 실제 불안감을 건드리지 못하는 상태입니다.`,
    summary_verdict: '신뢰도와 메시지 선명도 부족으로 고객 전환이 저조함',
    metrics: {
      message_clarity: 45,
      message_clarity_reason: '타깃의 핵심 불안감을 해소하는 메시지 부재',
      differentiation: 35,
      differentiation_reason: '경쟁사와의 구체적 차별점 미명시',
      conversion_path: 40,
      conversion_path_reason: '신뢰 증거(후기, 인증) 배치 미흡'
    },
    strategic_gaps: [
      { problem: '타깃의 핵심 불안감 미해결', impact: '신뢰 형성 실패' },
      { problem: '포지셔닝의 모호성', impact: '높은 이탈률 발생' },
      { problem: '신뢰 자산 구축 부족', impact: '구매 전환 어려움' }
    ],
    consulting_preview: `20분 상담에서는 "${target}"의 심리 프로필 분석, 포지셔닝 전략, 3개월 로드맵을 제공하겠습니다.`,
    total_score: 40
  };
}
