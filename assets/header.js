/**
 * CHAEUM Blog Header Component
 * 모든 블로그 포스트에 동적으로 상단바를 주입합니다
 * 
 * 사용: <script src="/assets/header.js" defer></script>
 */

// 상단바 HTML
const headerHTML = `
<header>
  <a href="/index.html" class="logo">CHAEUM</a>
  <nav>
    <a href="/services.html">SERVICES</a>
    <a href="/portfolio.html">CASE STUDY</a>
    <a href="/insights/index.html">INSIGHT</a>
    <a href="/about.html">ABOUT</a>
  </nav>
  <a href="/diagnosis-talk.html" class="cta-header-btn">AI 진단 받기</a>
</header>
`;

// 상단바 CSS
const headerCSS = `
/* ──────────── HEADER COMPONENT ──────────── */
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(248, 246, 241, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0 48px;
  height: 64px;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header .logo {
  font-size: 11px;
  letter-spacing: 3.5px;
  opacity: 0.5;
  text-decoration: none;
  color: #333333;
  font-family: 'Noto Sans KR', -apple-system, sans-serif;
  flex-shrink: 0;
}

header nav {
  display: flex;
  gap: 28px;
  align-items: center;
}

header nav a {
  font-size: 11px;
  letter-spacing: 0.8px;
  color: #333333;
  opacity: 0.4;
  text-decoration: none;
  transition: opacity 0.2s ease;
  white-space: nowrap;
}

header nav a:hover,
header nav a.active {
  opacity: 1;
}

.cta-header-btn {
  font-size: 11px;
  letter-spacing: 0.8px;
  background: #333333;
  color: #F8F6F1;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: opacity 0.2s ease;
  display: inline-block;
  white-space: nowrap;
  flex-shrink: 0;
}

.cta-header-btn:hover {
  opacity: 0.8;
}

/* Body 상단 여백 (fixed header 때문에) */
body {
  padding-top: 64px;
}

/* 반응형 */
@media (max-width: 768px) {
  header {
    padding: 0 20px;
    flex-wrap: wrap;
    height: auto;
  }
  
  header nav {
    gap: 16px;
    font-size: 10px;
  }
  
  header nav a {
    font-size: 10px;
  }
  
  .cta-header-btn {
    font-size: 10px;
    padding: 8px 16px;
  }
}
`;

/**
 * 페이지 로드 시 상단바 주입
 */
document.addEventListener('DOMContentLoaded', function() {
  // 1. CSS 주입
  const styleEl = document.createElement('style');
  styleEl.textContent = headerCSS;
  styleEl.setAttribute('data-component', 'chaeum-header');
  document.head.appendChild(styleEl);
  
  // 2. HTML 주입 (기존 header가 없을 때만)
  if (!document.querySelector('header')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headerHTML;
    const headerElement = tempDiv.firstElementChild;
    headerElement.setAttribute('data-component', 'chaeum-header');
    document.body.insertBefore(headerElement, document.body.firstChild);
  }
  
  // 3. 현재 페이지에 맞게 active 클래스 설정
  setActiveNav();
});

/**
 * 현재 페이지 경로에 따라 네비게이션 활성화
 */
function setActiveNav() {
  try {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('header nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      // Exact match 또는 partial match
      if (href === currentPath || 
          currentPath.startsWith(href.replace('.html', '')) ||
          (href === '/insights/index.html' && currentPath.startsWith('/insights'))) {
        link.classList.add('active');
      }
    });
  } catch (e) {
    console.warn('Failed to set active nav:', e);
  }
}

/**
 * 동적 네비게이션 경로 변경 감지
 * (Single Page App에서도 동작하도록)
 */
window.addEventListener('popstate', setActiveNav);

// 페이지 변경 감지 (history API 사용 시)
const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  setActiveNav();
};