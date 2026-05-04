(() => {
  const existing = document.getElementById('inquiryPanel') || document.getElementById('inquiryWidgetPanel');
  if (existing) return;

  const endpoint = 'https://hook.us2.make.com/8omwxlfwuwdrenvqu3jdr7i8kyfror2l';
  const source = document.currentScript?.dataset.source || 'chaeum.cloud/ai';
  const pageLabel = document.currentScript?.dataset.page || document.title || 'CHAEUM';

  const styles = document.createElement('style');
  styles.textContent = `
    .inquiry-widget-open {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 80;
      border: 1px solid rgba(0,0,0,.18);
      border-radius: 999px;
      background: rgba(255,255,255,.88);
      padding: 11px 18px;
      color: #0b0b0b;
      font: 400 13px/1.2 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: -0.035em;
      cursor: pointer;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      box-shadow: 0 18px 50px rgba(0,0,0,.08);
    }
    .inquiry-widget-panel {
      position: fixed;
      right: 24px;
      bottom: 74px;
      z-index: 90;
      display: none;
      width: min(430px, calc(100vw - 48px));
      max-height: min(620px, calc(100vh - 96px));
      overflow: hidden;
      border: 1px solid rgba(0,0,0,.12);
      background: rgba(255,255,255,.96);
      color: #0b0b0b;
      box-shadow: 0 28px 90px rgba(0,0,0,.14);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .inquiry-widget-panel.open { display: block; }
    .inquiry-widget-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      border-bottom: 1px solid rgba(0,0,0,.08);
      padding: 13px 16px;
    }
    .inquiry-widget-title {
      margin: 0;
      max-width: 320px;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.35;
      letter-spacing: -0.04em;
    }
    .inquiry-widget-close {
      border: 0;
      background: transparent;
      color: rgba(0,0,0,.46);
      font: inherit;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }
    .inquiry-widget-body {
      max-height: calc(min(620px, calc(100vh - 96px)) - 50px);
      overflow-y: auto;
      padding: 14px 16px 16px;
    }
    .inquiry-widget-step { display: none; }
    .inquiry-widget-step.active { display: block; }
    .inquiry-widget-question {
      margin: 0 0 12px;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.45;
      letter-spacing: -0.045em;
    }
    .inquiry-widget-options,
    .inquiry-widget-fields {
      display: grid;
      gap: 6px;
    }
    .inquiry-widget-option {
      width: 100%;
      border: 1px solid rgba(0,0,0,.12);
      background: transparent;
      padding: 9px 11px;
      text-align: left;
      color: rgba(0,0,0,.76);
      font: inherit;
      font-size: 12px;
      line-height: 1.45;
      cursor: pointer;
    }
    .inquiry-widget-option:hover,
    .inquiry-widget-option.selected {
      border-color: rgba(0,0,0,.42);
      background: rgba(0,0,0,.04);
      color: #0b0b0b;
    }
    .inquiry-widget-input,
    .inquiry-widget-textarea {
      width: 100%;
      border: 0;
      border-bottom: 1px solid rgba(0,0,0,.22);
      outline: 0;
      background: transparent;
      padding: 12px 0;
      color: #0b0b0b;
      font: inherit;
      font-size: 13px;
    }
    .inquiry-widget-textarea {
      min-height: 64px;
      resize: vertical;
    }
    .inquiry-widget-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 14px;
    }
    .inquiry-widget-back,
    .inquiry-widget-next {
      border: 1px solid rgba(0,0,0,.18);
      border-radius: 999px;
      background: transparent;
      padding: 8px 13px;
      color: #0b0b0b;
      font: inherit;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
    }
    .inquiry-widget-next {
      border-color: #0b0b0b;
      background: #0b0b0b;
      color: #fff;
    }
    .inquiry-widget-progress {
      color: rgba(0,0,0,.42);
      font-size: 11px;
      letter-spacing: .1em;
    }
    @media (max-width: 760px) {
      .inquiry-widget-open {
        right: 16px;
        bottom: 16px;
      }
      .inquiry-widget-panel {
        right: 16px;
        bottom: 64px;
        width: calc(100vw - 32px);
      }
    }
  `;
  document.head.appendChild(styles);

  document.body.insertAdjacentHTML('beforeend', `
    <button class="inquiry-widget-open" id="inquiryWidgetOpen" type="button">문의하기</button>
    <section class="inquiry-widget-panel" id="inquiryWidgetPanel" aria-label="Brand OS AI 문의" aria-hidden="true">
      <div class="inquiry-widget-head">
        <p class="inquiry-widget-title">우리 브랜드에 필요한 AI 운영 구조를 확인해보세요.</p>
        <button class="inquiry-widget-close" id="inquiryWidgetClose" type="button" aria-label="문의 창 닫기">×</button>
      </div>
      <div class="inquiry-widget-body">
        <div class="inquiry-widget-step active" data-step="0">
          <p class="inquiry-widget-question">브랜드 업종을 선택해주세요.</p>
          <div class="inquiry-widget-options" data-key="industry">
            <button class="inquiry-widget-option" type="button" data-value="Food / F&B">Food / F&amp;B</button>
            <button class="inquiry-widget-option" type="button" data-value="Beauty">Beauty</button>
            <button class="inquiry-widget-option" type="button" data-value="Lifestyle">Lifestyle</button>
            <button class="inquiry-widget-option" type="button" data-value="B2B / Tech">B2B / Tech</button>
            <button class="inquiry-widget-option" type="button" data-value="Other">Other</button>
          </div>
        </div>
        <div class="inquiry-widget-step" data-step="1">
          <p class="inquiry-widget-question">현재 브랜드 운영 단계는 어디에 가까운가요?</p>
          <div class="inquiry-widget-options" data-key="stage">
            <button class="inquiry-widget-option" type="button" data-value="런칭 전 / 준비 단계">런칭 전 / 준비 단계</button>
            <button class="inquiry-widget-option" type="button" data-value="운영 중이지만 기준 정리가 필요함">운영 중이지만 기준 정리가 필요함</button>
            <button class="inquiry-widget-option" type="button" data-value="콘텐츠 발행을 꾸준히 확장하고 싶음">콘텐츠 발행을 꾸준히 확장하고 싶음</button>
            <button class="inquiry-widget-option" type="button" data-value="팀 단위 AI 운영 시스템이 필요함">팀 단위 AI 운영 시스템이 필요함</button>
          </div>
        </div>
        <div class="inquiry-widget-step" data-step="2">
          <p class="inquiry-widget-question">브랜드 운영에서 지금 가장 불편한 지점은 무엇인가요?</p>
          <div class="inquiry-widget-options" data-key="need">
            <button class="inquiry-widget-option" type="button" data-value="브랜드 말투가 매번 달라져요">브랜드 말투가 매번 달라져요</button>
            <button class="inquiry-widget-option" type="button" data-value="고객에게 설명이 잘 안 돼요">고객에게 설명이 잘 안 돼요</button>
            <button class="inquiry-widget-option" type="button" data-value="반응은 있는데 다음 액션이 어려워요">반응은 있는데 다음 액션이 어려워요</button>
            <button class="inquiry-widget-option" type="button" data-value="팀과 기준을 맞추기 어려워요">팀과 기준을 맞추기 어려워요</button>
            <button class="inquiry-widget-option" type="button" data-value="전체 구조를 먼저 보고 싶어요">전체 구조를 먼저 보고 싶어요</button>
          </div>
        </div>
        <div class="inquiry-widget-step" data-step="3">
          <p class="inquiry-widget-question">현재 사용 중이거나 선호하는 업무 도구가 있나요?</p>
          <div class="inquiry-widget-options" data-key="tool">
            <button class="inquiry-widget-option" type="button" data-value="Notion">Notion</button>
            <button class="inquiry-widget-option" type="button" data-value="Claude / ChatGPT">Claude / ChatGPT</button>
            <button class="inquiry-widget-option" type="button" data-value="Slack / Google Drive">Slack / Google Drive</button>
            <button class="inquiry-widget-option" type="button" data-value="아직 없음">아직 없음</button>
          </div>
        </div>
        <div class="inquiry-widget-step" data-step="4">
          <p class="inquiry-widget-question">상담을 위한 정보를 남겨주세요.</p>
          <div class="inquiry-widget-fields">
            <input class="inquiry-widget-input" id="inquiryWidgetName" placeholder="Name *" autocomplete="name" />
            <input class="inquiry-widget-input" id="inquiryWidgetCompany" placeholder="Company *" autocomplete="organization" />
            <input class="inquiry-widget-input" id="inquiryWidgetEmail" type="email" placeholder="Email *" autocomplete="email" />
            <input class="inquiry-widget-input" id="inquiryWidgetWebsite" type="url" placeholder="Website / Portfolio" />
            <textarea class="inquiry-widget-textarea" id="inquiryWidgetMessage" placeholder="다른 문의 내용이 있다면 자유롭게 남겨주세요."></textarea>
          </div>
        </div>
        <div class="inquiry-widget-actions">
          <button class="inquiry-widget-back" id="inquiryWidgetBack" type="button">Back</button>
          <span class="inquiry-widget-progress" id="inquiryWidgetProgress">1 / 5</span>
          <button class="inquiry-widget-next" id="inquiryWidgetNext" type="button">Next</button>
        </div>
      </div>
    </section>
  `);

  const panel = document.getElementById('inquiryWidgetPanel');
  const open = document.getElementById('inquiryWidgetOpen');
  const close = document.getElementById('inquiryWidgetClose');
  const back = document.getElementById('inquiryWidgetBack');
  const next = document.getElementById('inquiryWidgetNext');
  const progress = document.getElementById('inquiryWidgetProgress');
  const state = {
    industry: '',
    stage: '',
    need: '',
    tool: '',
    name: '',
    company: '',
    email: '',
    website: '',
    message: ''
  };
  let stepIndex = 0;

  const collect = () => {
    state.name = document.getElementById('inquiryWidgetName')?.value.trim() || '';
    state.company = document.getElementById('inquiryWidgetCompany')?.value.trim() || '';
    state.email = document.getElementById('inquiryWidgetEmail')?.value.trim() || '';
    state.website = document.getElementById('inquiryWidgetWebsite')?.value.trim() || '';
    state.message = document.getElementById('inquiryWidgetMessage')?.value.trim() || '';
  };

  const render = () => {
    document.querySelectorAll('.inquiry-widget-step').forEach((step) => {
      step.classList.toggle('active', Number(step.dataset.step) === stepIndex);
    });
    back.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    next.textContent = stepIndex === 4 ? 'Submit →' : 'Next';
    progress.textContent = `${stepIndex + 1} / 5`;
    if (stepIndex === 4) collect();
  };

  const canContinue = () => {
    collect();
    if (stepIndex === 0) return Boolean(state.industry);
    if (stepIndex === 1) return Boolean(state.stage);
    if (stepIndex === 2) return Boolean(state.need);
    if (stepIndex === 3) return Boolean(state.tool);
    if (stepIndex === 4) return Boolean(state.name && state.company && state.email);
    return true;
  };

  const slackText = (payload) => [
    '*Brand OS AI 문의가 접수되었습니다.*',
    `• 페이지: ${pageLabel}`,
    `• 업종: ${payload.industry || '-'}`,
    `• 운영 단계: ${payload.stage || '-'}`,
    `• 고민/개선 포인트: ${payload.need || '-'}`,
    `• 선호 도구: ${payload.tool || '-'}`,
    `• 이름: ${payload.name || '-'}`,
    `• 회사: ${payload.company || '-'}`,
    `• 이메일: ${payload.email || '-'}`,
    `• 웹사이트: ${payload.website || '-'}`,
    `• 추가 문의: ${payload.message || '-'}`,
    `• 접수 시간: ${payload.submittedAt}`
  ].join('\n');

  const submit = async () => {
    collect();
    const payload = {
      source,
      submittedAt: new Date().toISOString(),
      ...state
    };
    payload.text = slackText(payload);

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    alert('문의가 접수되었습니다.');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  open.addEventListener('click', () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  });
  close.addEventListener('click', () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('.inquiry-widget-options[data-key] .inquiry-widget-option').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.closest('[data-key]').dataset.key;
      state[key] = button.dataset.value;
      button.parentElement.querySelectorAll('.inquiry-widget-option').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      window.setTimeout(() => {
        stepIndex = Math.min(stepIndex + 1, 4);
        render();
      }, 140);
    });
  });
  back.addEventListener('click', () => {
    stepIndex = Math.max(stepIndex - 1, 0);
    render();
  });
  next.addEventListener('click', () => {
    if (!canContinue()) {
      alert('필수 정보를 입력해주세요.');
      return;
    }
    if (stepIndex === 4) submit();
    else {
      stepIndex += 1;
      render();
    }
  });
  render();
})();
