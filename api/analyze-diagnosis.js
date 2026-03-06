export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, brandName, consultation, revenueScale } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key not configured');
    }

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
            content: '당신은 CHAEUM의 브랜드 전략가입니다. 고객의 고민을 분석하여 다음 4가지로 답변하세요:\n\n**1. 핵심 문제 진단:**\n**2. 전략적 병목 구간:**\n**3. 채움이 제안하는 방향:**\n**4. 20분 무료 상담 가이드:'
          },
          {
            role: 'user',
            content: `브랜드: ${brandName}\n고민: ${consultation}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const diagnosis = data.choices[0].message.content;

    return res.status(200).json({ success: true, diagnosis });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
