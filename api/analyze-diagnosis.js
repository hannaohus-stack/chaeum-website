// api/analyze-diagnosis.js
// Vercel Serverless Function - OpenAI를 이용한 실시간 AI 분석

export default async function handler(req, res) {
// POST 요청만 허용
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
const { name, brandName, consultation, email, revenueScale } = req.body;

```
// 입력값 검증
if (!name || !brandName || !consultation) {
  return res.status(400).json({ error: 'Missing required fields' });
}

// OpenAI API 호출
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `당신은 CHAEUM(채움)의 고급 브랜드 전략가입니다.
```

고객의 고민을 깊이 있게 분석하고, 구체적이고 실행 가능한 솔루션을 제시합니다.

분석 시 항상 다음을 고려하세요:

- 고객의 실제 비즈니스 상황
- 브랜드의 강점과 약점
- 시장에서의 포지셔닝 차이
- 구체적인 실행 방안

응답은 반드시 아래 형식으로 작성하세요:
**1. 핵심 문제 진단:**
[구체적인 문제 분석]

**2. 전략적 병목 구간:**
[3가지 이상의 구체적인 문제점]

**3. 채움이 제안하는 방향:**
[구체적인 해결 방안 및 실행 계획]

**4. 20분 무료 상담 가이드:**
[상담에서 논의할 핵심 주제들]`}, { role: 'user', content:`
[고객 정보]
이름: ${name}
브랜드명: ${brandName}
매출 규모: ${revenueScale || ‘미입력’}
이메일: ${email}

[고객의 고민]
${consultation}

위 고객의 상황을 깊이 있게 분석하고, 맞춤형 브랜드 전략을 제시해주세요.
고객이 처한 실제 문제가 무엇인지 파악하고,
CHAEUM의 서비스(전략 설계/실행 관리)로 어떻게 해결할 수 있는지 설명해주세요.
`
}
],
temperature: 0.7,
max_tokens: 2000,
}),
});

```
if (!openaiResponse.ok) {
  const errorData = await openaiResponse.json();
  console.error('OpenAI API Error:', errorData);
  return res.status(openaiResponse.status).json({ 
    error: 'OpenAI API Error',
    details: errorData.error?.message || 'Unknown error'
  });
}

const data = await openaiResponse.json();
const diagnosis = data.choices[0].message.content;

// 성공 응답
return res.status(200).json({
  success: true,
  diagnosis: diagnosis,
  timestamp: new Date().toISOString()
});
```

} catch (error) {
console.error(‘Analysis Error:’, error);
return res.status(500).json({
error: ‘Internal server error’,
message: error.message
});
}
}
