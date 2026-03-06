// api/analyze-diagnosis.js
// Vercel Serverless Function - OpenAI를 이용한 실시간 AI 분석

export default async function handler(req, res) {
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, brandName, consultation, email, revenueScale } = req.body;

    // 입력값 검증
    if (!name || !brandName || !consultation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // API Key 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API Key is not configured'
      });
    }

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `당신은 CHAEUM(채움)의 고급 브랜드 전략가입니다. 고객의 고민을 분석하고 맞춤형 솔루션을 제시합니다.

다음 형식으로 분석을 작성하세요:

**1. 핵심 문제 진단:**
[고객의 실제 병목이 무엇인지 구체적으로]

**2. 전략적 병목 구간:**
[해결해야 할 3가지 주요 문제점]

**3. 채움이 제안하는 방향:**
[구체적인 해결 방안과 실행 계획]

**4. 20분 무료 상담 가이드:**
[상담에서 논의할 핵심 주제들]`
          },
          {
            role: 'user',
            content: `[고객 정보]
이름: ${name}
브랜드명: ${brandName}
매출 규모: ${revenueScale || '미입력'}

[고객의 고민]
${consultation}

이 고객을 위한 맞춤형 브랜드 전략을 분석해주세요.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

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

  } catch (error) {
    console.error('Analysis Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
