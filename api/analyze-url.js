/**
 * Vercel Serverless Function
 * POST /api/analyze-url
 */

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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

async function analyzeURL(url) {
    try {
        if (url.includes('instagram.com')) {
            return analyzeInstagram(url);
        }
        return await analyzeWebsite(url);
    } catch (error) {
        return getFallbackAnalysis(url);
    }
}

function analyzeInstagram(url) {
    try {
        const handle = url.split('/').filter(p => p)[3];
        return {
            success: true,
            brandName: `@${handle || 'Instagram'}`,
            service: `인스타그램: @${handle}`,
            painPoint: '인스타그램 팔로우는 있으나 실제 구매 전환이 낮습니다.',
            currentMessaging: `@${handle}의 인스타그램`,
            serviceType: 'lifestyle',
            confidence: 0.7,
            source: 'instagram'
        };
    } catch (error) {
        return getFallbackAnalysis(url);
    }
}

async function analyzeWebsite(url) {
    try {
        const axios = require('axios');
        const cheerio = require('cheerio');

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogDescription = $('meta[property="og:description"]').attr('content');
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');
        const h1 = $('h1').first().text().trim();
        const h2 = $('h2').first().text().trim();

        const bodyText = $('body').text().toLowerCase().substring(0, 3000);
        const serviceType = detectServiceType(bodyText, title, ogDescription);

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
            source: 'website'
        };

    } catch (error) {
        console.error('웹사이트 분석 오류:', error.message);
        return getFallbackAnalysis(url);
    }
}

function detectServiceType(text, title = '', description = '') {
    const combined = `${text} ${title} ${description}`.toLowerCase();

    const patterns = {
        saas: /saas|app|tool|soft|tech|platform|cloud|api|crm|erp|collab/,
        lifestyle: /beauty|cosmetic|skincare|makeup|spa|salon|lifestyle|fashion|design/,
        food: /food|cafe|restaurant|recipe|bakery|drink|wine|coffee|organic/,
        design: /design|studio|agency|creative|art|portfolio|visual/,
        fintech: /fintech|payment|invest|crypto|bank|finance|trade/,
        health: /health|fitness|wellness|yoga|gym|exercise|nutrition/,
        ecommerce: /shop|store|mall|ecommerce|product|marketplace/,
        education: /course|learn|class|school|training|academy/,
        consulting: /consulting|strategy|business|enterprise|solution/
    };

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

function formatBrandName(name) {
    if (/[가-힣]/.test(name)) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function getFallbackAnalysis(url) {
    try {
        const domain = new URL(url).hostname;
        const domainName = domain.split('.')[0];
        return {
            success: false,
            brandName: formatBrandName(domainName),
            service: `${domain} 서비스를 분석 중입니다.`,
            painPoint: '타깃 고객의 핵심 니즈를 파악하세요.',
            currentMessaging: '브랜드의 현재 메시지를 입력해주세요.',
            serviceType: 'lifestyle',
            confidence: 0.3,
            source: 'fallback'
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
            source: 'error'
        };
    }
}
