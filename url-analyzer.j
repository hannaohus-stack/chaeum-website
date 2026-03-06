/**
 * URL Analyzer
 * 웹사이트 또는 인스타그램 URL을 분석하여
 * 자동으로 서비스 유형, 서비스 설명, 타깃 등을 추출
 */

class URLAnalyzer {
    constructor(url) {
        this.url = url;
        this.isInstagram = url.includes('instagram.com');
        this.domain = new URL(url).hostname;
    }

    /**
     * 📱 인스타그램 URL 분석
     */
    async analyzeInstagram() {
        try {
            // Instagram은 직접 스크래핑이 어려우므로, 자동 인지로 처리
            const handle = this.url.split('/').filter(p => p)[3];
            
            return {
                brandName: handle || 'Instagram Brand',
                service: `인스타그램 계정: @${handle}\n라이프스타일 또는 뷰티/패션 관련 브랜드로 추정됩니다.`,
                painPoint: '인스타그램 팔로우는 있으나 실제 판매 전환이 낮은 상태로 추정됩니다.',
                currentMessaging: '인스타그램 프로필 소개 및 최근 게시물 분석 필요',
                serviceType: 'lifestyle', // 기본값
                confidence: 0.6
            };
        } catch (error) {
            console.error('Instagram 분석 오류:', error);
            return null;
        }
    }

    /**
     * 🌐 웹사이트 URL 분석
     */
    async analyzeWebsite() {
        try {
            // CORS-proxy를 통해 웹사이트 메타 데이터 추출
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(this.url)}`);
            const data = await response.json();
            const html = data.contents;
            
            // 메타 태그 추출
            const meta = this.extractMetaTags(html);
            const keywords = this.extractKeywords(html);
            const serviceType = this.detectServiceType(keywords, meta);
            
            return {
                brandName: meta.ogTitle || meta.title || this.domain,
                service: meta.ogDescription || meta.description || `${this.domain} 서비스`,
                painPoint: this.inferPainPoint(keywords, serviceType),
                currentMessaging: this.extractMainMessage(html),
                serviceType: serviceType,
                confidence: 0.8,
                metadata: meta
            };
        } catch (error) {
            console.error('웹사이트 분석 오류:', error);
            // 실패 시 기본값 반환
            return this.getFallbackAnalysis();
        }
    }

    /**
     * 메타 태그 추출
     */
    extractMetaTags(html) {
        const meta = {};
        
        // Open Graph 태그
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
        meta.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;
        
        const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
        meta.ogDescription = ogDescMatch ? ogDescMatch[1] : null;
        
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        meta.ogImage = ogImageMatch ? ogImageMatch[1] : null;
        
        // 일반 메타 태그
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        meta.title = titleMatch ? titleMatch[1] : null;
        
        const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
        meta.description = descMatch ? descMatch[1] : null;
        
        return meta;
    }

    /**
     * HTML에서 키워드 추출 (h1, h2, 메인 텍스트)
     */
    extractKeywords(html) {
        const keywords = [];
        
        // h1, h2 태그 추출
        const headings = html.match(/<h[1-2][^>]*>([^<]+)<\/h[1-2]>/g) || [];
        headings.forEach(h => {
            const text = h.replace(/<[^>]+>/g, '');
            keywords.push(text);
        });
        
        // p 태그에서 처음 200글자 추출
        const pTags = html.match(/<p[^>]*>([^<]+)<\/p>/g) || [];
        pTags.slice(0, 3).forEach(p => {
            const text = p.replace(/<[^>]+>/g, '').substring(0, 100);
            keywords.push(text);
        });
        
        return keywords.join(' ').toLowerCase();
    }

    /**
     * 서비스 유형 자동 감지
     */
    detectServiceType(keywords, meta) {
        const text = `${keywords} ${meta.ogDescription || ''} ${meta.description || ''}`.toLowerCase();
        
        const serviceTypes = {
            saas: ['software', 'saas', 'tool', 'collaboration', 'productivity', 'app', 'platform', '협업', '도구', '플랫폼'],
            lifestyle: ['lifestyle', 'beauty', 'fashion', 'aesthetic', 'design', 'brand', '라이프스타일', '뷰티', '패션'],
            food: ['food', 'beverage', 'restaurant', 'recipe', 'organic', 'healthy', '음식', '음료', '식품', '건강'],
            design: ['design', 'creative', 'studio', 'portfolio', 'branding', '디자인', '크리에이티브', '창작'],
            fintech: ['fintech', 'payment', 'investment', 'crypto', 'bank', 'finance', '금융', '투자', '결제'],
            health: ['health', 'fitness', 'wellness', 'yoga', 'exercise', '헬스', '피트니스', '웰니스'],
            ecommerce: ['shop', 'store', 'ecommerce', 'product', 'buy', 'sell', '쇼핑', '상점', '판매'],
            education: ['course', 'learn', 'education', 'school', 'training', '교육', '강의', '학습'],
            consulting: ['consulting', 'strategy', 'business', 'enterprise', 'solution', '컨설팅', '전략']
        };
        
        // 각 유형별 점수 계산
        const scores = {};
        for (const [type, keywords] of Object.entries(serviceTypes)) {
            scores[type] = keywords.filter(k => text.includes(k)).length;
        }
        
        // 가장 높은 점수 반환
        const detectedType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        return scores[detectedType] > 0 ? detectedType : 'lifestyle'; // 기본값
    }

    /**
     * 타깃 고객의 페인포인트 추론
     */
    inferPainPoint(keywords, serviceType) {
        const painPoints = {
            saas: '팀의 협업 효율성을 높이고 싶으나, 적절한 도구를 찾기 어려워합니다.',
            lifestyle: '자신의 라이프스타일을 더 아름답게 표현하고 싶으나, 선택지가 많아 결정이 어렵습니다.',
            food: '건강하고 신뢰할 수 있는 식품을 찾고 싶으나, 어떤 제품이 진정한지 판단하기 어렵습니다.',
            design: '자신의 감성을 표현하고 싶으나, 기성품으로는 부족합니다.',
            fintech: '금융 거래를 더 쉽고 안전하게 하고 싶으나, 복잡한 시스템이 진입 장벽입니다.',
            health: '건강한 삶을 유지하고 싶으나, 혼자서는 동기부여가 부족합니다.',
            ecommerce: '원하는 제품을 찾고 싶으나, 신뢰할 수 있는 추천처를 찾기 어렵습니다.',
            education: '새로운 기술을 배우고 싶으나, 체계적인 학습 경로를 찾기 어렵습니다.',
            consulting: '비즈니스 문제를 해결하고 싶으나, 어디서부터 시작해야 할지 모릅니다.'
        };
        
        return painPoints[serviceType] || '타깃 고객의 니즈를 명확히 파악해야 합니다.';
    }

    /**
     * 메인 메시지 추출 (h1 또는 첫 번째 중요 문구)
     */
    extractMainMessage(html) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        if (h1Match) {
            return h1Match[1].substring(0, 100);
        }
        
        const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/);
        if (h2Match) {
            return h2Match[1].substring(0, 100);
        }
        
        return '웹사이트 분석을 통해 메인 메시지를 파악하는 중입니다.';
    }

    /**
     * 실패 시 기본값 반환
     */
    getFallbackAnalysis() {
        return {
            brandName: this.domain || 'Unknown Brand',
            service: `${this.domain} 서비스를 분석 중입니다. 자세한 정보는 상담에서 확인해주세요.`,
            painPoint: '타깃 고객의 니즈를 파악해야 합니다.',
            currentMessaging: '웹사이트 분석을 통해 현재 메시지를 파악하고 있습니다.',
            serviceType: 'lifestyle',
            confidence: 0.3
        };
    }

    /**
     * 분석 실행
     */
    async analyze() {
        if (this.isInstagram) {
            return await this.analyzeInstagram();
        } else {
            return await this.analyzeWebsite();
        }
    }
}

// 사용 예시
// const analyzer = new URLAnalyzer('https://example.com');
// const result = await analyzer.analyze();
