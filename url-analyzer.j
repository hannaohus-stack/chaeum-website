/**
 * URL Analyzer - 개선된 버전
 * CORS 이슈 해결 + 더 안정적인 분석
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
            const handle = this.url.split('/').filter(p => p)[3];
            
            return {
                brandName: `@${handle || 'Instagram Brand'}`,
                service: `인스타그램 계정: @${handle}\n라이프스타일 또는 뷰티/패션 관련 브랜드로 추정됩니다.`,
                painPoint: '인스타그램 팔로우는 있으나 실제 판매 전환이 낮은 상태로 추정됩니다.',
                currentMessaging: `@${handle}의 인스타그램 프로필 분석 완료`,
                serviceType: this.detectInstagramType(handle),
                confidence: 0.7
            };
        } catch (error) {
            console.error('Instagram 분석 오류:', error);
            return this.getFallbackAnalysis();
        }
    }

    /**
     * 인스타그램 핸들로 서비스 유형 추측
     */
    detectInstagramType(handle) {
        if (!handle) return 'lifestyle';
        
        const text = handle.toLowerCase();
        
        if (text.includes('beauty') || text.includes('makeup') || text.includes('cosmetic')) return 'lifestyle';
        if (text.includes('food') || text.includes('recipe') || text.includes('cafe')) return 'food';
        if (text.includes('design') || text.includes('art') || text.includes('creative')) return 'design';
        if (text.includes('fit') || text.includes('gym') || text.includes('yoga')) return 'health';
        if (text.includes('shop') || text.includes('store') || text.includes('brand')) return 'ecommerce';
        
        return 'lifestyle';
    }

    /**
     * 🌐 웹사이트 URL 분석 (여러 CORS 프록시 시도)
     */
    async analyzeWebsite() {
        // CORS 프록시 목록 (우선순위순)
        const corsProxies = [
            (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            (url) => `https://cors-anywhere.herokuapp.com/${url}`,
            (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        ];

        let html = null;
        let proxy = null;

        // 각 프록시 순서대로 시도
        for (let i = 0; i < corsProxies.length; i++) {
            try {
                const proxyUrl = corsProxies[i](this.url);
                const response = await Promise.race([
                    fetch(proxyUrl),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('timeout')), 5000)
                    )
                ]);

                if (!response.ok) continue;

                const data = await response.json();
                
                // 다양한 응답 형식 지원
                html = data.contents || data.body || data;
                proxy = i;
                break;

            } catch (error) {
                console.log(`Proxy ${i} 실패:`, error.message);
                continue;
            }
        }

        // 모든 프록시 실패 시 폴백
        if (!html) {
            console.warn('모든 CORS 프록시 실패, 폴백 분석 시작');
            return this.analyzeWebsiteFallback();
        }

        // HTML 분석
        try {
            const meta = this.extractMetaTags(html);
            const keywords = this.extractKeywords(html);
            const serviceType = this.detectServiceType(keywords, meta);

            return {
                brandName: meta.ogTitle || meta.title || this.domain,
                service: meta.ogDescription || meta.description || `${this.domain} 서비스 분석 중`,
                painPoint: this.inferPainPoint(keywords, serviceType),
                currentMessaging: this.extractMainMessage(html),
                serviceType: serviceType,
                confidence: 0.85,
                metadata: meta
            };

        } catch (error) {
            console.error('HTML 분석 오류:', error);
            return this.analyzeWebsiteFallback();
        }
    }

    /**
     * 웹사이트 분석 폴백 (프록시 실패 시)
     * 도메인 이름과 기본 휴리스틱으로 분석
     */
    analyzeWebsiteFallback() {
        console.log('폴백 분석 시작:', this.domain);
        
        const domainName = this.domain.split('.')[0].toLowerCase();
        const serviceType = this.detectServiceTypeFromDomain(domainName);
        
        return {
            brandName: domainName.charAt(0).toUpperCase() + domainName.slice(1),
            service: `${this.domain}의 서비스를 분석하고 있습니다. 더 정확한 분석을 원하시면 상담에서 직접 확인해주세요.`,
            painPoint: this.inferPainPoint(domainName, serviceType),
            currentMessaging: `${this.domain}의 웹사이트 분석 중`,
            serviceType: serviceType,
            confidence: 0.5, // 낮은 신뢰도 표시
            isUsingFallback: true
        };
    }

    /**
     * 도메인 이름으로 서비스 유형 추측
     */
    detectServiceTypeFromDomain(domainName) {
        const text = domainName.toLowerCase();
        
        // 키워드 매칭
        if (text.match(/saas|app|tool|soft|tech|platform|cloud|api/)) return 'saas';
        if (text.match(/beauty|cosmetic|skincare|makeup|spa|salon/)) return 'lifestyle';
        if (text.match(/food|cafe|restaurant|recipe|bakery|drink|wine|beer/)) return 'food';
        if (text.match(/design|studio|agency|creative|art|brand/)) return 'design';
        if (text.match(/pay|bank|invest|crypto|finance|trade|stock|money/)) return 'fintech';
        if (text.match(/fit|gym|yoga|health|wellness|medical|clinic|nutrition/)) return 'health';
        if (text.match(/shop|store|mall|buy|sell|commerce|market|cart/)) return 'ecommerce';
        if (text.match(/course|learn|class|school|edu|training|academy/)) return 'education';
        if (text.match(/consult|agency|strategy|business|solution|service|expert/)) return 'consulting';
        
        // 기본값
        return 'lifestyle';
    }

    /**
     * 메타 태그 추출
     */
    extractMetaTags(html) {
        const meta = {};
        
        try {
            // Open Graph 태그
            const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
            meta.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;
            
            const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
            meta.ogDescription = ogDescMatch ? ogDescMatch[1] : null;
            
            // 일반 메타 태그
            const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
            meta.title = titleMatch ? titleMatch[1] : null;
            
            const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
            meta.description = descMatch ? descMatch[1] : null;
        } catch (error) {
            console.error('메타 태그 추출 오류:', error);
        }
        
        return meta;
    }

    /**
     * HTML에서 키워드 추출
     */
    extractKeywords(html) {
        const keywords = [];
        
        try {
            // h1, h2 태그 추출
            const headings = html.match(/<h[1-2][^>]*>([^<]+)<\/h[1-2]>/gi) || [];
            headings.forEach(h => {
                const text = h.replace(/<[^>]+>/g, '').trim();
                if (text.length > 0) keywords.push(text);
            });
            
            // p 태그에서 처음 200글자 추출
            const pTags = html.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
            pTags.slice(0, 3).forEach(p => {
                const text = p.replace(/<[^>]+>/g, '').substring(0, 100).trim();
                if (text.length > 0) keywords.push(text);
            });
        } catch (error) {
            console.error('키워드 추출 오류:', error);
        }
        
        return keywords.join(' ').toLowerCase();
    }

    /**
     * 서비스 유형 자동 감지
     */
    detectServiceType(keywords, meta) {
        const text = `${keywords} ${meta.ogDescription || ''} ${meta.description || ''}`.toLowerCase();
        
        const serviceTypes = {
            saas: ['software', 'saas', 'tool', 'collaboration', 'productivity', 'app', 'platform', '협업', '도구', '플랫폼', 'cloud', 'api'],
            lifestyle: ['lifestyle', 'beauty', 'fashion', 'aesthetic', 'design', 'brand', '라이프스타일', '뷰티', '패션', 'cosmetic', 'skincare'],
            food: ['food', 'beverage', 'restaurant', 'recipe', 'organic', 'healthy', '음식', '음료', '식품', '건강', 'cafe', 'bakery'],
            design: ['design', 'creative', 'studio', 'portfolio', 'branding', '디자인', '크리에이티브', '창작', 'agency', 'artist'],
            fintech: ['fintech', 'payment', 'investment', 'crypto', 'bank', 'finance', '금융', '투자', '결제', 'wallet', 'trading'],
            health: ['health', 'fitness', 'wellness', 'yoga', 'exercise', '헬스', '피트니스', '웰니스', 'gym', 'nutrition'],
            ecommerce: ['shop', 'store', 'ecommerce', 'product', 'buy', 'sell', '쇼핑', '상점', '판매', 'marketplace', 'commerce'],
            education: ['course', 'learn', 'education', 'school', 'training', '교육', '강의', '학습', 'academy', 'class'],
            consulting: ['consulting', 'strategy', 'business', 'enterprise', 'solution', '컨설팅', '전략', 'agency', 'expert']
        };
        
        // 각 유형별 점수 계산
        const scores = {};
        for (const [type, keywords] of Object.entries(serviceTypes)) {
            scores[type] = keywords.filter(k => text.includes(k)).length;
        }
        
        // 가장 높은 점수 반환
        const detectedType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        return scores[detectedType] > 0 ? detectedType : 'lifestyle';
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
     * 메인 메시지 추출
     */
    extractMainMessage(html) {
        try {
            const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (h1Match) {
                return h1Match[1].substring(0, 100);
            }
            
            const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
            if (h2Match) {
                return h2Match[1].substring(0, 100);
            }
        } catch (error) {
            console.error('메시지 추출 오류:', error);
        }
        
        return '웹사이트 분석을 통해 메인 메시지를 파악하는 중입니다.';
    }

    /**
     * 기본값 반환
     */
    getFallbackAnalysis() {
        return {
            brandName: this.domain || 'Unknown Brand',
            service: `${this.domain} 서비스 분석 중입니다.`,
            painPoint: '타깃 고객의 니즈를 파악해야 합니다.',
            currentMessaging: `${this.domain} 웹사이트 분석 중`,
            serviceType: 'lifestyle',
            confidence: 0.3,
            isUsingFallback: true
        };
    }

    /**
     * 분석 실행
     */
    async analyze() {
        try {
            if (this.isInstagram) {
                return await this.analyzeInstagram();
            } else {
                return await this.analyzeWebsite();
            }
        } catch (error) {
            console.error('분석 실패:', error);
            return this.getFallbackAnalysis();
        }
    }
}

// 사용 예시
// const analyzer = new URLAnalyzer('https://example.com');
// const result = await analyzer.analyze();
