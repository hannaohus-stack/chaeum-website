export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
const { name, brandName, consultation, revenueScale, website, service, target } = req.body;

```
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('API Key not configured');
}

const systemPrompt = `당신은 CHAEUM의 자문단 전략가입니다. 10년 이상의 브랜드 컨설팅 경험을 가지고 있으며, 스타트업부터 대기업까지 다양한 브랜드 전략을 수립한 전문가입니다.
```

고객의 비즈니스 정보를 분석하여 다음 4가지 섹션으로 구체적이고 실행 가능한 전략을 제시하세요:

**1. 핵심 문제 진단:**

- 제공된 정보를 바탕으로 정확한 병목을 파악
- 타겟 고객의 니즈와의 미스매칭 분석
- 시장에서의 실제 위치 파악

**2. 전략적 병목 구간:**

- 3가지 이상의 구체적이고 실행 가능한 개선 영역 제시
- 각 병목이 왜 중요한지 설명

**3. 채움이 제안하는 방향:**

- 1단계: 즉시 실행 가능한 액션
- 2단계: 3개월 단위 목표
- 3단계: 6-12개월 전략
- 4단계: 성과 측정 방법

**4. 20분 무료 상담 가이드:**

- 상담에서 구체적으로 논의할 주제들
- 고객이 준비해야 할 정보
- 기대 효과

분석은 전문적이면서도 이해하기 쉬운 용어를 사용하세요.`;

```
const userPrompt = `
```

[비즈니스 정보]
브랜드명: ${brandName}
월 매출 규모: ${revenueScale || ‘미입력’}
웹사이트: ${website || ‘없음’}

[서비스/제품]
${service}

[타겟 고객]
${target}

[현재 고민]
${consultation}

-----

위 정보를 종합하여 ${brandName}을 위한 전문적인 브랜드 전략 분석을 제시해주세요.
특히 제공된 서비스와 타겟 고객의 매칭, 현재 겪는 구체적인 문제의 원인을 파악하고,
실제로 3개월 내에 구현 가능한 구체적인 솔루션을 제안해주세요.`;

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
    temperature: 0.7,
    max_tokens: 1500,
  }),
});

if (!response.ok) {
  throw new Error('OpenAI API error');
}

const data = await response.json();
const diagnosis = data.choices[0].message.content;

return res.status(200).json({ success: true, diagnosis });
```

} catch (error) {
console.error(‘Error:’, error);
return res.status(500).json({ success: false, error: error.message });
}
}
