export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL 필요' });
        }

        const targetUrl = url.startsWith('http') ? url : `https://${url}`;

        // 1️⃣ 실제 웹사이트 HTML 다운로드
        const siteRes = await fetch(targetUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!siteRes.ok) {
            throw new Error(`HTTP ${siteRes.status}`);
        }

        const html = await siteRes.text();

        // 2️⃣ 메타데이터 추출
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const metaDescMatch = html.match(
            /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
        );
        const ogTitleMatch = html.match(
            /<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i
        );
        const ogDescMatch = html.match(
            /<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i
        );

        const title = (ogTitleMatch?.[1] || titleMatch?.[1] || '').trim();
        const description = (ogDescMatch?.[1] || metaDescMatch?.[1] || '').trim();
        const h1 = (h1Match?.[1] || '').trim();
        const domain = new URL(targetUrl).hostname;
        const brandName = domain.split('.')[0];

        // 3️⃣ 추출된 텍스트로 서비스 유형 감지
        const combinedText = `${title} ${description} ${h1}`.toLowerCase();
        const serviceType = detectServiceTypeFromContent(combinedText);

        // 4️⃣ 분석 결과 구성
        return res.status(200).json({
            brandName: title.split(' ')[0] || brandName.charAt(0).toUpperCase() + brandName.slice(1),
            website: targetUrl,
            serviceType: serviceType,
            service: description || h1 || '서비스 설명을 추출하지 못했습니다.',
            painPoint: generatePainPoint(serviceType, description),
            currentMessaging: title || h1 || '포지셔닝 메시지를 추출하지 못했습니다.',
            extractedData: {
                ogTitle: title,
                metaDescription: description,
                h1: h1
            }
        });

    } catch (error) {
        console.error('분석 오류:', error);
        return res.status(500).json({
            error: '분석 실패',
            detail: error.message,
            serviceType: 'default',
            service: '웹사이트에 접근할 수 없습니다.',
            painPoint: '나중에 다시 시도해주세요.',
            currentMessaging: '분석 불가'
        });
    }
}

/**
 * 추출된 콘텐츠 기반 서비스 유형 감지
 */
function detectServiceTypeFromContent(text) {
    if (/saas|software|workflow|dashboard|automation|compliance|platform|tool|api/.test(text)) return 'saas';
    if (/food|meal|restaurant|kitchen|label|ingredient|nutrition|recipe/.test(text)) return 'food';
    if (/beauty|skincare|wellness|cosmetic|makeup|hair/.test(text)) return 'lifestyle';
    if (/consulting|strategy|branding|agency|business|marketing/.test(text)) return 'consulting';
    if (/shop|store|ecommerce|commerce|product|buy|sell/.test(text)) return 'ecommerce';
    if (/design|creative|studio|portfolio|visual/.test(text)) return 'design';
    if (/health|fitness|exercise|gym|wellness|medical/.test(text)) return 'health';
    if (/course|learn|education|academy|training|school/.test(text)) return 'education';
    if (/finance|pay|payment|bank|invest|crypto|trading/.test(text)) return 'fintech';
    
    return 'default';
}

/**
 * 서비스 유형별 Pain Point 생성
 */
function generatePainPoint(serviceType, description) {
    const map = {
        saas: '팀의 업무 프로세스가 복잡하고, 다양한 도구들을 통합하기 어려워하고 있습니다.',
        food: '제품의 품질과 신뢰성을 명확히 입증하고, 경쟁사와의 차별화가 필요합니다.',
        lifestyle: '브랜드의 고유한 가치를 고객에게 명확히 전달하고, 감정적 연결을 만들기 어렵습니다.',
        consulting: '서비스의 실질적 가치를 잠재고객에게 설득하고, 신뢰 구축이 과제입니다.',
        ecommerce: '제품 발견성을 높이고, 고객의 구매 결정을 지원하는 정보가 부족합니다.',
        design: '포트폴리오나 작업물의 가치를 효과적으로 표현하고, 타겟 클라이언트에게 도달하기 어렵습니다.',
        health: '건강 정보의 신뢰성을 확보하고, 실제 행동 변화로 이어지게 하기가 어렵습니다.',
        education: '학습 효과를 입증하고, 수강생과의 지속적인 관계를 유지하기 어렵습니다.',
        fintech: '금융 서비스의 복잡성을 단순화하고, 사용자 신뢰를 확보하기 어렵습니다.',
        default: '웹사이트에서 핵심 메시지와 고객 가치 제안이 명확하지 않습니다.'
    };
    
    return map[serviceType] || map['default'];
}
