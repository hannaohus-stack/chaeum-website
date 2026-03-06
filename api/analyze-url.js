/**
 * Vercel Serverless Function
 * Node.js 백엔드에서 URL 분석
 * 
 * 사용법: POST /api/analyze-url
 * Body: { url: "https://example.com" }
 */

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL이 필요합니다' });
        }

        // URL 분석 실행
        const analysis = await analyzeURL(url);
        
        return res.status(200).json(analysis);

    } catch (error) {
        console.error('분석 오류:', error);
        return res.status(500).json({ 
            error: '분석 중 오류가 발생했습니다',
            message: error.message 
        });
    }
}

/**
 * 핵심 분석 함수
 */
async function analyzeURL(url) {
    try {
        // 인스타그램 확인
        if (url.includes('instagram.com')) {
            return analyzeInstagram(url);
        }

        // 웹사이트 분석
        return await analyzeWebsite(url);

    } catch (error) {
        console.error('URL 분석 실패:', error);
        // 폴백: 도메인 기반 분석
        return getFallbackAnalysis(url);
    }
}

/**
 * 인스타그램 분석
 */
function analyzeInstagram(url) {
    try {
        const handle = url.split('/').filter(p => p)[3];
        
        return {
            success: true,
            brandName: `@${handle || 'Instagram'}`,
            service: `인스타그램: @${handle}\n라이프스타일/뷰티/패션 관련 브랜드로 추정됩니다.`,
            painPoint: '인스타그램 팔로우는 있으나 실제 구매 전환이 낮은 상태로 보입니다.',
            currentMessaging: `@${handle}의 인스타그램 프로필`,
            serviceType: 'lifestyle',
            confidence: 0.7,
            source: 'instagram'
        };
    } catch (error) {
        return getFallbackAnalysis(url);
    }
}

/**
 * 웹사이트 분석
 * axios + cheerio로 HTML 파싱
 */
async function analyzeWebsite(url) {
    try {
        // axios 동적 import (Vercel에서 기본 제공)
        const axios = require('axios');
        const cheerio = require('cheerio');

        // 타임아웃 설정
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // 메타 데이터 추출
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDescription = $('meta[property="og:description"]').attr('content');
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');

        // h1, h2 추출
        const h1 = $('h1').first().text().trim();
        const h2 = $('h2').first().text().trim();

        // 페이지 텍스트 분석
        const bodyText = $('body').text().toLowerCase().substring(0, 3000);

        // 서비스 유형 감지
        const serviceType = detectServiceType(bodyText, title, ogDescription);

        // 도메인 파싱
        const domain = new URL(url).hostname;
        const domainName = domain.split('.')[0];

        return {
            success: true,
            brandName: ogTitle || title || formatBrandName(domainName),
            service: ogDescription || description || `${domain} 서비스`,
            painPoint: inferPainPoint(serviceType),
            currentMessaging: h1 || h2 || `${domain}의 메인 메시지`,
            serviceType: serviceType,
            confidence: 0.85,
            source: 'website',
            metadata: {
                domain,
                h1,
                h2,
                title,
                description
            }
        };

    } catch (error) {
        console.error('웹사이트 분석 오류:', error.message);
        return getFallbackAnalysis(url);
    }
}

/**
 * 서비스 유형 감지
 */
function detectServiceType(text, title = '', description = '') {
    const combined = `${text} ${title} ${description}`.toLowerCase();

    const patterns = {
        saas: /saas|app|tool|soft|tech|platform|cloud|api|crm|erp|collab|product|solution/,
        lifestyle: /beauty|cosmetic|skincare|makeup|spa|salon|lifestyle|fashion|design|brand|aesthetic/,
        food: /food|cafe|restaurant|recipe|bakery|drink|wine|coffee|organic|kitchen|meal/,
        design: /design|studio|agency|creative|art|portfolio|visual|graphic/,
        fintech: /fintech|payment|invest|crypto|bank|finance|trade|stock|wallet/,
        health: /health|fitness|wellness|yoga|gym|exercise|nutrition|diet/,
        ecommerce: /shop|store|mall|ecommerce|product|marketplace|retail|buy|sell/,
        education: /course|learn|class|school|training|academy|online|teach/,
        consulting: /consulting|strategy|business|enterprise|solution|expert/
    };

    // 각 패턴의 매칭 점수 계산
    let maxScore = 0;
    let detectedType = 'lifestyle';

    for (const [type, pattern] of Object.entries(patterns)) {
        const matches = (combined.match(pattern) || []).length;
        if (matches > maxScore) {
            maxScore = matches;
            detectedType = type;
        }
    }

    return detectedType;
}

/**
 * 페인포인트 추론
 */
function inferPainPoint(serviceType) {
    const painPoints = {
        saas: '팀의 협업 효율을 높이고 싶으나, 적절한 솔루션을 찾기 어렵습니다.',
        lifestyle: '자신의 라이프스타일을 표현하고 싶으나, 브랜드 정체성이 명확하지 않습니다.',
        food: '건강하고 신뢰할 수 있는 식품을 찾고 싶으나, 차별화된 선택지가 부족합니다.',
        design: '자신의 미학을 표현하고 싶으나, 이를 고객에게 전달하기 어렵습니다.',
        fintech: '금융 거래를 더 쉽게 하고 싶으나, 신뢰와 이해가 부족합니다.',
        health: '건강해지고 싶으나, 혼자서는 동기부여를 유지하기 어렵습니다.',
        ecommerce: '좋은 제품을 찾고 싶으나, 어디서 구매할지 결정하기 어렵습니다.',
        education: '새로운 기술을 배우고 싶으나, 체계적인 학습 경로가 부족합니다.',
        consulting: '비즈니스 문제를 해결하고 싶으나, 전문 파트너를 찾기 어렵습니다.'
    };

    return painPoints[serviceType] || '고객의 핵심 니즈를 파악하세요.';
}

/**
 * 브랜드명 포맷팅
 */
function formatBrandName(name) {
    if (/[가-힣]/.test(name)) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * 폴백 분석 (모든 시도 실패 시)
 */
function getFallbackAnalysis(url) {
    try {
        const domain = new URL(url).hostname;
        const domainName = domain.split('.')[0];
        const serviceType = 'lifestyle'; // 기본값

        return {
            success: false,
            brandName: formatBrandName(domainName),
            service: `${domain} 서비스를 분석 중입니다.`,
            painPoint: '타깃 고객의 핵심 니즈를 파악하세요.',
            currentMessaging: '브랜드의 현재 메시지를 입력해주세요.',
            serviceType: serviceType,
            confidence: 0.3,
            source: 'fallback',
            message: 'URL 분석에 실패했습니다. 수동으로 정보를 입력해주세요.'
        };
    } catch (error) {
        return {
            success: false,
            brandName: 'Unknown Brand',
            service: '서비스를 분석 중입니다.',
            painPoint: '타깃 고객의 니즈를 파악하세요.',
            currentMessaging: '브랜드 메시지를 입력해주세요.',
            serviceType: 'lifestyle',
            confidence: 0.1,
            source: 'error',
            message: '심각한 오류가 발생했습니다. 수동 입력으로 진행하세요.'
        };
    }
}
