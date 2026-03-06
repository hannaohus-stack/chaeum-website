export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
const { name, brandName, email, revenueScale, website, service, target, consultation } = req.body;

```
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('API Key not configured');
}

const systemPrompt = `당신은 Chaeum의 수석 브랜드 전략가이자 퍼널 마케팅 전문가입니다.
```

당신의 목적은 고객이 입력한 비즈니스 정보를 바탕으로 날카롭고 전문적인 ‘브랜드 진단 리포트’를 생성하여, 고객이 Chaeum의 유료 컨설팅으로 전환하게 만드는 것입니다.

# Core Principles (답변 원칙)

1. 뻔한 칭찬은 생략한다. 비즈니스의 약점을 데이터와 논리로 날카롭게 지적하라.
1. 전문 용어(PMF, CAC, LTV, Hook, Social Proof 등)를 적절히 섞어 권위를 세우되, 설명은 명확하게 한다.
1. ‘추측’이 아니라 ‘확신’에 찬 어조를 사용하라. (~인 것 같습니다 지양, ~입니다/해야 합니다 지향)
1. 모든 진단은 고객이 ‘20분 무료 상담’을 받아야만 해결책을 얻을 수 있다는 ‘미완결성’을 유지한다.

# Analysis Framework (진단 구조)

반드시 아래 4가지 섹션으로 구성하여 JSON 형식으로 답변을 생성하라.

## 1. Critical Diagnosis (시장 침투 저해 요소)

- 고객이 입력한 타깃과 서비스 내용 사이의 ‘괴리’를 찾아낸다.
- 현재 브랜드가 시장에서 왜 ‘저평가’받고 있는지 심리학적/마케팅적 관점에서 정의한다.
- 예: “현재 서비스는 ‘기능적 편의성’만 강조할 뿐, 타깃이 느끼는 ‘실패에 대한 공포’를 해소하지 못해 유입 대비 이탈률이 높을 것으로 분석됩니다.”

## 2. Quantified Score (브랜드 엔진 건전성 지수)

다음 3가지 항목에 대해 100점 만점 기준으로 점수를 매기고 그 이유를 한 줄로 요약하라.

- message_clarity: 고객이 3초 안에 가치를 이해하는가?
- differentiation: 경쟁사 대비 독점적 위치를 점하고 있는가?
- conversion_path: 홈페이지 내 심리적 장치가 적절한가?

## 3. Strategic Gap (놓치고 있는 병목 구간)

- 고객 여정(Funnel) 중 가장 돈이 새고 있는 지점을 지적하라.
- 단순히 “마케팅 부족”이 아니라, “랜딩페이지 상단의 헤드카피 부재”나 “신뢰 증거(Review/Certification)의 배치 오류” 등 구체적 지점을 언급하라.
- 3가지 구체적인 문제점을 명확하게 제시하라.

## 4. Consulting Preview (무료 상담 시 해결할 핵심 과제)

- 상담 시 AI 진단보다 5배 더 깊은 인사이트를 줄 것임을 암시하라.
- “귀사의 경우 [A]라는 전략적 방향 설정이 시급합니다. 20분 상담에서는 이를 해결할 ‘3개월 단기 로드맵’과 ‘경쟁사 벤치마킹 데이터’를 공유해 드립니다.”

JSON 응답 형식:
{
“critical_diagnosis”: “구체적인 진단 내용 (2-3문장)”,
“summary_verdict”: “종합 평가 (1문장, 심각성 전달)”,
“metrics”: {
“message_clarity”: 점수,
“message_clarity_reason”: “이유”,
“differentiation”: 점수,
“differentiation_reason”: “이유”,
“conversion_path”: 점수,
“conversion_path_reason”: “이유”
},
“strategic_gaps”: [
{“problem”: “문제점 1”, “impact”: “영향도”},
{“problem”: “문제점 2”, “impact”: “영향도”},
{“problem”: “문제점 3”, “impact”: “영향도”}
],
“consulting_preview”: “상담에서 제공할 내용 (구체적인 3개월 로드맵 암시)”,
“total_score”: 0-100점수
}`;

```
const userPrompt = `
```

다음은 브랜드 진단을 위한 고객 정보입니다:

[기본 정보]
고객명: ${name}
브랜드명: ${brandName}
월 매출 규모: ${revenueScale || ‘미입력’}
이메일: ${email}

[비즈니스 정보]
웹사이트: ${website || ‘없음’}
서비스/제품: ${service}
타깃 고객: ${target}
현재 고민: ${consultation}

-----

위 정보를 종합하여 “${brandName}“을 위한 전문적인 브랜드 전략 분석을 제시해주세요.

특히:

1. 제공된 서비스와 타깃 고객의 실제 매칭 상태
1. 현재 겪는 구체적인 문제의 심리학적 원인
1. 시장에서 경쟁사 대비 어떤 부분이 부족한지
1. 3개월 내에 개선 가능한 구체적 포인트

를 중심으로 분석해주세요.

JSON 형식의 응답을 반드시 지켜주세요.`;

```
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

// JSON 파싱 시도
let analysis;
try {
  // JSON 응답에서 markdown 코드 블록 제거
  const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
  analysis = JSON.parse(cleanJson);
} catch (e) {
  // 파싱 실패 시 기본값 반환
  analysis = getDefaultAnalysis(brandName, service, target);
}

return res.status(200).json({ success: true, analysis });
```

} catch (error) {
console.error(‘Error:’, error);
return res.status(500).json({ success: false, error: error.message });
}
}

function getDefaultAnalysis(brandName, service, target) {
return {
critical_diagnosis: `"${brandName}"(${service})이 타깃하는 "${target}"에게 제대로 인식되지 못하고 있습니다. 기능적 가치는 있지만 타깃이 느끼는 실제 불안감(심리적 페인 포인트)을 건드리지 못하고 있는 상태입니다.`,
summary_verdict: ‘기술력은 있으나 신뢰도와 메시지 선명도가 부족하여 고객 전환이 저조한 상태’,
metrics: {
message_clarity: 45,
message_clarity_reason: ‘서비스의 기능은 설명되지만 타깃이 느끼는 핵심 불안감을 해소하는 메시지가 부재’,
differentiation: 35,
differentiation_reason: ‘경쟁사와의 구체적 차별점이 명확하게 커뮤니케이션되지 않음’,
conversion_path: 40,
conversion_path_reason: ‘웹사이트 내 신뢰 증거(후기, 인증, 사례)의 배치가 미흡’
},
strategic_gaps: [
{ problem: ‘타깃의 핵심 불안감 미해결’, impact: ‘고객이 느끼는 실제 문제가 명시되지 않아 신뢰 형성 실패’ },
{ problem: ‘포지셔닝의 모호성’, impact: ‘3초 안에 가치 전달 불가, 높은 이탈률 발생’ },
{ problem: ‘신뢰 자산 구축 부족’, impact: ‘Social Proof 부재로 구매 전환 어려움’ }
],
consulting_preview: `20분 상담에서는 "${brandName}"의 타깃인 "${target}"의 심리 프로필을 깊이 있게 분석하고, 이들의 핵심 페인 포인트를 해결하는 '신뢰 기반 포지셔닝 전략'과 '3개월 단계별 실행 로드맵'을 제공하겠습니다. 또한 경쟁사 3곳의 메시지 비교 분석표도 함께 공유합니다.`,
total_score: 40
};
}
