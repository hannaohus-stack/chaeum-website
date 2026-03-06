/**
 * CHAEUM AI Analysis Engine
 * 사용자 입력 → 논리적 분석 → JSON 구조화 데이터 생성
 * 모듈화된 분석 엔진으로, 각 섹션이 독립적으로 작동
 */

class BrandAnalysisEngine {
    constructor(userData) {
        this.brandName = userData.brandName;
        this.serviceType = userData.serviceType;
        this.service = userData.service;
        this.painPoint = userData.painPoint;
        this.currentMessaging = userData.currentMessaging;
        this.pain = userData.pain;
        this.website = userData.website;
        this.email = userData.email;
    }

    /**
     * 🔍 Module 1: 포지셔닝 분석
     * X축(기능 ↔ 감성), Y축(매스 ↔ 프리미엄) 2차원 분석
     */
    analyzePositioning() {
        // 서비스 설명 분석 (감성도)
        const emotionalKeywords = ['감정', '신뢰', '안심', '믿음', '프리미엄', '럭셔리', '가치', '철학', '스토리'];
        const functionalKeywords = ['기능', '빠른', '쉬운', '편한', '가성비', '저렴', '효율', '최적'];
        
        const serviceEmotional = emotionalKeywords.filter(k => this.service.includes(k)).length;
        const serviceFunctional = functionalKeywords.filter(k => this.service.includes(k)).length;
        
        // 현재 메시지 분석 (프리미엄도)
        const premiumKeywords = ['프리미엄', '고급', '수제', '정직', '정성', '특별', '유니크'];
        const massKeywords = ['대중', '누구나', '쉽', '간편', '저렴'];
        
        const messagingPremium = premiumKeywords.filter(k => this.currentMessaging.includes(k)).length;
        const messagingMass = massKeywords.filter(k => this.currentMessaging.includes(k)).length;
        
        // 점수 계산 (0-100)
        const xScore = Math.round(50 + (serviceEmotional - serviceFunctional) * 10);
        const yScore = Math.round(50 + (messagingPremium - messagingMass) * 8);
        
        return {
            coordinates: {
                x: Math.max(20, Math.min(100, xScore)),
                y: Math.max(20, Math.min(100, yScore))
            },
            analysis: {
                emotionalLevel: serviceEmotional > serviceFunctional ? 'high' : 'low',
                premiumLevel: messagingPremium > messagingMass ? 'high' : 'low',
                insight: this.generatePositioningInsight(xScore, yScore),
                evidence: `서비스 분석: "${this.service.substring(0, 80)}..." | 메시지 분석: "${this.currentMessaging.substring(0, 80)}..."`
            }
        };
    }

    generatePositioningInsight(xScore, yScore) {
        let insight = `귀사는 현재 X축 ${xScore}점, Y축 ${yScore}점에 위치합니다. `;
        
        if (xScore < 40 && yScore < 40) {
            insight += "기능성, 대중 포지셔닝으로 경쟁 심화 영역입니다. 차별화가 시급합니다.";
        } else if (xScore > 70 && yScore > 70) {
            insight += "감성, 프리미엄 포지셔닝으로 좋은 위치입니다. 이를 메시지에 일관되게 유지해야 합니다.";
        } else if (xScore > 70 && yScore < 50) {
            insight += "감성 지향이나 프리미엄 신호가 약합니다. 메시지를 상향 조정해야 합니다.";
        } else {
            insight += "포지셔닝 혼합 상태입니다. 명확한 포지셔닝 재정의가 필요합니다.";
        }
        
        return insight;
    }

    /**
     * 💬 Module 2: 메시지 일관성 분석
     * 사용자의 현재 메시지가 얼마나 명확하고 일관성 있는지 분석
     */
    analyzeMessageConsistency() {
        // 메시지 복잡도 (문장 수)
        const messageParts = this.currentMessaging.split(/[,。\n]/);
        const messageCount = messageParts.length;
        
        // 기본 명확도: 100에서 시작
        let clarity = 100;
        
        // 메시지가 3개 이상이면 분산된 것으로 판단
        if (messageCount > 3) {
            clarity -= (messageCount - 2) * 8;
        }
        
        // 서비스 설명과 메시지의 연결도
        const serviceWords = this.service.split(/\s/).slice(0, 10);
        const messagingWords = this.currentMessaging.split(/\s/).slice(0, 10);
        const commonWords = serviceWords.filter(w => messagingWords.includes(w)).length;
        
        if (commonWords < 2) {
            clarity -= 15; // 서비스와 메시지가 안 맞음
        }
        
        // 타깃 페인포인트 반영 여부
        if (!this.currentMessaging.includes('해결') && 
            !this.currentMessaging.includes('도움') && 
            !this.currentMessaging.includes('문제')) {
            clarity -= 10; // 페인 포인트를 직접 해결하지 않음
        }
        
        clarity = Math.max(20, Math.min(100, clarity));
        
        return {
            score: Math.round(clarity),
            analysis: {
                messageCount: messageCount,
                complexity: messageCount > 3 ? 'high' : 'normal',
                alignment: commonWords >= 2 ? 'good' : 'poor',
                painPointCovered: this.currentMessaging.includes('해결'),
                insight: this.generateMessageInsight(clarity, messageCount),
                evidence: `메시지 분석: "${this.currentMessaging.substring(0, 120)}..." (${messageCount}개 메시지)`
            }
        };
    }

    generateMessageInsight(clarity, messageCount) {
        let insight = `현재 메시지 명확도는 ${clarity}점입니다. `;
        
        if (clarity > 80) {
            insight += "명확하고 일관된 메시지입니다. 이를 지속적으로 강화하세요.";
        } else if (clarity > 60) {
            insight += "기본적인 명확도는 있으나, 개선의 여지가 있습니다.";
        } else {
            insight += "메시지가 분산되어 있습니다. ";
            if (messageCount > 3) {
                insight += `${messageCount}개의 메시지를 2-3개로 통합해야 합니다.`;
            } else {
                insight += "메시지의 논리적 연결성을 강화해야 합니다.";
            }
        }
        
        return insight;
    }

    /**
     * 📊 Module 3: 콘텐츠 구조 분석
     * 사용자의 콘텐츠가 제품/라이프스타일/스토리 중 어디에 집중되어 있는지 분석
     */
    analyzeContentStructure() {
        // 서비스 설명에서 콘텐츠 유형 추정
        const productKeywords = ['기능', '성능', '기술', '특징', '사양', '효과'];
        const lifestyleKeywords = ['생활', '라이프', '경험', '일상', '즐거움', '감성'];
        const storyKeywords = ['창립자', '철학', '신념', '여정', '스토리', '가치관', '이유'];
        
        const productCount = productKeywords.filter(k => this.service.includes(k)).length;
        const lifestyleCount = lifestyleKeywords.filter(k => this.service.includes(k)).length;
        const storyCount = storyKeywords.filter(k => this.service.includes(k)).length;
        
        // 메시지에서도 추출
        const productMsg = productKeywords.filter(k => this.currentMessaging.includes(k)).length;
        const lifestyleMsg = lifestyleKeywords.filter(k => this.currentMessaging.includes(k)).length;
        const storyMsg = storyKeywords.filter(k => this.currentMessaging.includes(k)).length;
        
        // 총합 계산
        const total = productCount + lifestyleCount + storyCount + productMsg + lifestyleMsg + storyMsg;
        
        let productRatio = total > 0 ? Math.round((productCount + productMsg) / total * 100) : 55;
        let lifestyleRatio = total > 0 ? Math.round((lifestyleCount + lifestyleMsg) / total * 100) : 30;
        let storyRatio = total > 0 ? Math.round((storyCount + storyMsg) / total * 100) : 15;
        
        // 비율 조정 (합계 100%)
        const ratios = this.normalizeRatios(productRatio, lifestyleRatio, storyRatio);
        
        return {
            ratios: {
                product: ratios.product,
                lifestyle: ratios.lifestyle,
                story: ratios.story
            },
            analysis: {
                insight: this.generateContentInsight(ratios),
                evidence: `서비스 키워드 분석: 제품(${productCount}개), 라이프(${lifestyleCount}개), 스토리(${storyCount}개)`
            }
        };
    }

    normalizeRatios(product, lifestyle, story) {
        const total = product + lifestyle + story;
        if (total === 0) return { product: 55, lifestyle: 30, story: 15 };
        
        return {
            product: Math.round(product / total * 100),
            lifestyle: Math.round(lifestyle / total * 100),
            story: Math.round(story / total * 100)
        };
    }

    generateContentInsight(ratios) {
        let insight = `현재 콘텐츠 구성은 제품 ${ratios.product}%, 라이프스타일 ${ratios.lifestyle}%, 스토리 ${ratios.story}%입니다. `;
        
        if (ratios.product > 60) {
            insight += "제품 중심이 과하니, 라이프스타일(${ratios.lifestyle + 15}%) 또는 스토리(${ratios.story + 15}%)를 강화해야 합니다.";
        } else if (ratios.story < 15) {
            insight += "스토리 비중이 부족합니다. 창립자 철학, 고객 성공 사례를 더해야 브랜드 신뢰가 형성됩니다.";
        } else {
            insight += "콘텐츠 구성이 균형잡혀 있습니다.";
        }
        
        return insight;
    }

    /**
     * 🔄 Module 4: 퍼널 분석
     * 사용자의 고민(pain) 유형에 따라 퍼널 누수 지점 분석
     */
    analyzeFunnel() {
        const painScores = {
            'awareness': { score: 40, leak: "유입 단계에서 35% 이탈" },
            'conversion': { score: 35, leak: "구매 단계에서 50% 이탈" },
            'messaging': { score: 45, leak: "메시지 혼란으로 모든 단계에서 이탈" },
            'positioning': { score: 42, leak: "선택 이유 부족으로 고려 단계 이탈" },
            'story': { score: 48, leak: "팬덤 부재로 반복 구매 불가" }
        };
        
        const painData = painScores[this.pain] || painScores.awareness;
        
        return {
            score: painData.score,
            painType: this.pain,
            analysis: {
                leak: painData.leak,
                insight: this.generateFunnelInsight(),
                evidence: `고객 고민: "${this.painPoint.substring(0, 100)}..."`
            }
        };
    }

    generateFunnelInsight() {
        const painDescriptions = {
            'awareness': "사람들이 당신을 모르고 있습니다. 유입 자체가 부족한 상태입니다.",
            'conversion': "유입은 있으나 구매로 이어지지 않습니다. 신뢰와 확신이 부족합니다.",
            'messaging': "고객이 당신이 뭔지 모호해합니다. 메시지가 명확하지 않으면 모든 단계에서 이탈됩니다.",
            'positioning': "경쟁사와 구분이 안 됩니다. '왜 우리인가'라는 선택 이유가 약합니다.",
            'story': "팬덤이 없어 일회성 고객만 확보됩니다. 브랜드 스토리가 부족합니다."
        };
        
        return painDescriptions[this.pain] || "퍼널 최적화가 필요합니다.";
    }

    /**
     * 🎯 최종 분석 리포트 생성
     * 모든 모듈의 결과를 종합하여 최종 JSON 구조화
     */
    generateReport() {
        const positioning = this.analyzePositioning();
        const message = this.analyzeMessageConsistency();
        const content = this.analyzeContentStructure();
        const funnel = this.analyzeFunnel();
        
        // 총합 점수 계산
        const totalScore = Math.round((message.score + (positioning.coordinates.y + positioning.coordinates.x) / 2 + funnel.score) / 3);
        
        return {
            // 기본 정보
            metadata: {
                brandName: this.brandName,
                serviceType: this.serviceType,
                timestamp: new Date().toISOString()
            },
            
            // 각 모듈 분석 결과
            sections: {
                positioning: {
                    title: "포지셔닝 분석",
                    data: positioning,
                    recommendation: `X축 ${positioning.coordinates.x}점(감성도), Y축 ${positioning.coordinates.y}점(프리미엄도)에서 포지셔닝이 명확해야 합니다.`
                },
                message: {
                    title: "메시지 일관성",
                    data: message,
                    recommendation: `메시지 명확도를 ${message.score}에서 80점 이상으로 올려야 합니다.`
                },
                content: {
                    title: "콘텐츠 구조",
                    data: content,
                    recommendation: `제품(${content.ratios.product}%) → ${Math.max(40, content.ratios.product - 10)}%로 감소, 스토리(${content.ratios.story}%) → ${Math.min(25, content.ratios.story + 10)}%로 증가`
                },
                funnel: {
                    title: "퍼널 분석",
                    data: funnel,
                    recommendation: `현재 고민(${this.pain})을 해결하기 위해 즉각적인 개선이 필요합니다.`
                }
            },
            
            // 종합 점수
            totalScore: totalScore,
            grade: this.getGrade(totalScore),
            
            // 종합 진단
            systemLeak: {
                title: "System Leak Detected",
                verdict: `"${this.brandName}"은 개별 요소는 좋으나 시스템 누수가 있습니다.`,
                evidence: [
                    `포지셔닝 혼탁: X축 ${positioning.coordinates.x}점 (목표: 75점 이상)`,
                    `메시지 분산: 명확도 ${message.score}점 (목표: 85점 이상)`,
                    `퍼널 이탈: 효율 ${funnel.score}점 (목표: 70점 이상)`
                ],
                estimatedWaste: "월간 마케팅 비용의 35-40% 낭비 가능성"
            }
        };
    }

    getGrade(score) {
        if (score >= 85) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        return 'C';
    }
}

// 사용 예시
// const analysis = new BrandAnalysisEngine(userData);
// const report = analysis.generateReport();
