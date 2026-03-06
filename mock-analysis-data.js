// 프로급 더미 데이터 - 이 데이터로 UI를 완벽하게 테스트
const MOCK_ANALYSIS = {
  "analysis_summary": {
    "brand_name": "케이알케이 (KRK Team)",
    "industry": "B2B SaaS / 협업 도구",
    "overall_score": 62,
    "grade": "B-",
    "confidence": 94.2
  },

  "positioning_map": {
    "coordinates": { "x": 72, "y": 45 },
    "quadrant": "Mid-Premium Functionality",
    "current_position": "프리미엄을 지향하나 기능 중심의 메시지",
    "target_position": "엔터프라이즈급 신뢰성 + 감정적 공감",
    "competitors": [
      { "name": "Aesop", "x": 85, "y": 80, "type": "luxury_lifestyle" },
      { "name": "Nonfiction", "x": 78, "y": 70, "type": "premium_design" },
      { "name": "Granhand", "x": 65, "y": 50, "type": "mid_premium" },
      { "name": "귀사 (KRK)", "x": 72, "y": 45, "type": "current" }
    ],
    "insight": "귀사는 프리미엄의 감도를 지향하나 메시지 밀도는 대중 시장에 머물러 있습니다. 현재 '기능 중심'의 포지셔닝으로는 경쟁사(Nonfiction 등)와의 변별력이 약합니다. 니치(Niche)한 포지셔닝으로의 상향 조정이 시급합니다.",
    "gap_analysis": "프리미엄 진입 기업들은 감성 + 신뢰의 2축을 모두 강화합니다. 현재 귀사는 감성 요소(Y축)에서 45점으로, 경쟁사 대비 35점 뒤처져 있습니다."
  },

  "message_consistency": {
    "score": 74,
    "grade": "C+",
    "primary_keywords": ["협업", "효율", "간편함"],
    "secondary_keywords": ["신뢰", "성장", "함께"],
    "dissonance_level": 28,
    "dissonance_report": "웹사이트의 '기업용 협업 도구'라는 B2B 기능 중심 메시지가 인스타그램의 '스타트업 창업자들의 성장 이야기'라는 감정 중심 콘텐츠와 28%의 충돌을 일으키고 있습니다.",
    "detailed_analysis": [
      {
        "channel": "웹사이트",
        "message": "효율적인 협업을 위한 최고의 도구",
        "tone": "Business-focused, Feature-heavy"
      },
      {
        "channel": "인스타그램",
        "message": "함께 성장하는 팀들의 이야기",
        "tone": "Emotional, Community-focused"
      }
    ],
    "recommendation": "두 메시지를 통합하면: '효율적인 협업으로 팀의 성장을 가속화하는 도구'라는 단일 메시지로 수렴할 수 있습니다. 이는 두 채널의 강점을 모두 살립니다.",
    "insight": "고객은 일관되지 않은 브랜드에 신뢰를 느끼지 못합니다. 흩어진 메시지를 하나의 **브랜드 보이스(Brand Voice)**로 정렬해야 할 때입니다. 이를 통해 메시지 명확도를 현재 74점에서 88점 이상으로 끌어올릴 수 있습니다."
  },

  "content_structure": {
    "ratios": {
      "product": 58,
      "lifestyle": 24,
      "story": 18
    },
    "benchmark": {
      "product": 45,
      "lifestyle": 30,
      "story": 25
    },
    "analysis": [
      {
        "type": "제품 중심 (58%)",
        "content": "기능 설명, 튜토리얼, 업데이트 소식",
        "effect": "단기 구매 유도에는 효과적 → 휘발성 높음"
      },
      {
        "type": "라이프스타일 (24%)",
        "content": "팀 빌딩, 협업 팁, 성공 사례",
        "effect": "브랜드 매력도 증가 → 중장기 충성도 형성"
      },
      {
        "type": "스토리 (18%)",
        "content": "창업자 인터뷰, 브랜드 철학, 미션",
        "effect": "감정 공유와 팬덤 형성 → 입소문 효과"
      }
    ],
    "gap_analysis": "경쟁 벤치마크 대비 제품 중심이 13% 높고, 스토리가 7% 낮습니다.",
    "diagnosis": "Direct Sales 비중이 과다합니다. 브랜드 로열티를 위한 스토리 자산(Asset) 확보가 시급합니다. 특히 '창업자의 경험담'이나 '고객 성공 사례'는 단순한 후기가 아니라 **브랜드 신뢰의 자산**입니다.",
    "insight": "판매만 유도하는 콘텐츠는 휘발됩니다. 팬덤을 만드는 콘텐츠는 축적됩니다. 현재 귀사의 체질은 **58% 제품 중심 → 48% 제품, 28% 라이프스타일, 24% 스토리**로의 개선이 필요합니다.",
    "improvement_potential": "스토리 콘텐츠를 현재 18%에서 25%로 확대하면, 고객 체류 시간이 평균 23% 증가하고 입소문 효과가 31% 향상됩니다 (동종 업계 데이터 기준)."
  },

  "funnel_entry": {
    "score": 56,
    "grade": "D+",
    "stage_scores": {
      "awareness": 72,
      "consideration": 58,
      "decision": 42,
      "retention": 48
    },
    "leaks": [
      {
        "stage": "인지 → 고려",
        "problem": "CTA 명확성 부족",
        "impact": "유입 대비 35% 이탈",
        "evidence": "웹사이트 상단에 '시작하기' 버튼이 3개 이상으로 분산됨. 고객이 다음 행동을 명확히 알지 못함."
      },
      {
        "stage": "고려 → 구매 결정",
        "problem": "신뢰 증거(Social Proof) 부재",
        "impact": "구매 결정 단계에서 50% 이탈",
        "evidence": "고객 후기와 성공 사례가 매우 부족함. 'G2 리뷰' 같은 제3자 검증이 없음."
      },
      {
        "stage": "구매 후",
        "problem": "온보딩 경험 미흡",
        "impact": "신규 고객의 초기 이탈 (Churn) 18% 발생",
        "evidence": "가입 후 첫 1주일 내 기능 이해도가 낮아 불만족"
      }
    ],
    "action_plan_locked": true,
    "action_plan": "📌 [유료 컨설팅에서 공개] 인스타그램 프로필 링크에서 상세페이지 구매 버튼까지의 클릭 뎁스(Depth)를 현재 4단계에서 2단계로 축소. 동시에 '15초 데모 영상' 삽입으로 구매 결정 시간 단축.",
    "insight": "마케팅 비용은 **유입(Impression)**이 아니라 **이탈(Leak)**에서 낭비됩니다. 현재 데이터상 100명이 유입되면 65명이 고려 단계에서 빠져나갑니다. 가장 좁은 병목 구간(Decision → Purchase)을 먼저 해결하십시오.",
    "estimated_impact": "퍼널 개선 시 현재 '10만 명 유입 → 2,000명 고객' (2% 전환율)에서 '10만 명 유입 → 5,000명 고객' (5% 전환율)으로 개선 가능 (약 250% ROI 증대)."
  },

  "system_leak_summary": {
    "title": "🚩 System Leak Detected",
    "overall_verdict": "귀사의 브랜드는 개별 요소(디자인, 기능)는 훌륭하나 이를 '매출로 연결할 운영 시스템'이 누수되고 있습니다.",
    "monthly_waste_estimate": "현재 마케팅 비용의 약 35-40%가 퍼널 누수로 인해 낭비되고 있을 것으로 추정됩니다.",
    "critical_next_steps": [
      "1. 메시지 정렬: 웹사이트 + SNS 통합 메시지 수립 (효과: 메시지 명확도 74 → 88)",
      "2. 스토리 자산: 고객 성공 사례 및 창업자 스토리 4개월간 월 4-5건 발행 (효과: 콘텐츠 체질 개선, 팬덤 형성)",
      "3. 퍼널 최적화: 'CTA 통일 + Social Proof 강화 + 온보딩 개선' (효과: 전환율 2% → 5%)"
    ]
  },

  "consulting_unlock": {
    "title": "20분 무료 상담에서 얻을 수 있는 것",
    "locked_content": "📌 구체적 3개월 로드맵 (액션별 우선순위 + 일정 + 담당자 배정)",
    "locked_content_2": "📌 경쟁사 3곳 벤치마킹 데이터 (Nonfiction, Monday.com, Notion 분석)",
    "locked_content_3": "📌 즉시 적용 가능한 10개 액션 아이템 (주차별 실행 계획)",
    "preview": "현재 AI 분석은 귀사 브랜드의 **표면적 진단(약 20%)**입니다. 전문가 상담에서는 경쟁 생태계, 타깃 고객의 심리 프로필, 그리고 실행 전략까지 **80% 심화 분석**을 제공합니다."
  }
};
