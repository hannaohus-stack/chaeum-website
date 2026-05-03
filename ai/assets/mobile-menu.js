(() => {
  if (document.getElementById('sharedMobileMenuOverlay')) return;

  const style = document.createElement('style');
  style.textContent = `
    .shared-mobile-menu-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
      align-items: center;
      background: #fff;
      padding: 28px;
      color: #0b0b0b;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .shared-mobile-menu-overlay.open {
      display: flex;
    }
    .shared-mobile-menu-close {
      position: absolute;
      top: 28px;
      right: 28px;
      border: 0;
      background: transparent;
      padding: 4px;
      color: #0b0b0b;
      line-height: 0;
      cursor: pointer;
    }
    .shared-mobile-menu-list {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
    .shared-mobile-menu-list a {
      color: inherit;
      font-size: 30px;
      font-weight: 300;
      letter-spacing: -0.03em;
      line-height: 1.1;
      text-decoration: none;
      text-transform: uppercase;
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <div class="shared-mobile-menu-overlay" id="sharedMobileMenuOverlay" aria-hidden="true">
      <button class="shared-mobile-menu-close" id="sharedMobileMenuClose" type="button" aria-label="메뉴 닫기">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path d="M18 6 6 18M6 6l12 12"></path>
        </svg>
      </button>
      <nav class="shared-mobile-menu-list" aria-label="Mobile navigation">
        <a href="/ai/service/index.html">SERVICES</a>
        <a href="/ai/work/index.html">WORK</a>
        <a href="/ai/academy/index.html">ACADEMY</a>
        <a href="/ai/contact/">CONTACT</a>
      </nav>
    </div>
  `);

  const overlay = document.getElementById('sharedMobileMenuOverlay');
  const close = document.getElementById('sharedMobileMenuClose');
  const openMenu = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  };
  const closeMenu = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.mobile-menu').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openMenu();
    });
  });
  close.addEventListener('click', closeMenu);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeMenu();
  });
  document.querySelectorAll('.shared-mobile-menu-list a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
})();
