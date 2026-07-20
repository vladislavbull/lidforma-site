const analytics = window.LidformaAnalytics;
const glow = document.querySelector('.cursor-glow');
if (glow) {
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('in-view');
    observer.unobserve(entry.target);
  }
}), { threshold: .13 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.querySelectorAll('[data-count]').forEach(node => {
    const max = Number(node.dataset.count);
    let value = 0;
    const tick = () => {
      value += 1;
      node.textContent = value;
      if (value < max) requestAnimationFrame(tick);
    };
    tick();
  });
  countObserver.unobserve(entry.target);
}), { threshold: .4 });
document.querySelectorAll('.metrics').forEach(element => countObserver.observe(element));

const form = document.querySelector('#lead-form');
const modal = document.querySelector('#success-modal');
const briefLink = document.querySelector('.modal-brief');
const automationEndpoint = 'https://script.google.com/macros/s/AKfycbzAOYiXTkA90rbTYyGV15uk7dJ7IbtA9herqE6teOzLO8j9zh7HnOGvANfoX0JxTTM/exec';

function applyCampaignOffer() {
  if (!analytics?.isAuditCampaign()) return;
  document.body.classList.add('campaign-audit');
  const eyebrow = document.querySelector('.eyebrow');
  const titleLines = document.querySelectorAll('.hero-title span');
  const heroCopy = document.querySelector('.hero-bottom p');
  const heroButton = document.querySelector('.hero-bottom .button');
  const briefKicker = document.querySelector('.brief-intro .section-kicker');
  const briefTitle = document.querySelector('.brief-intro h2');
  const briefCopy = document.querySelector('.brief-intro > p:not(.section-kicker)');
  const project = form?.querySelector('[name="project"]');

  if (eyebrow) eyebrow.textContent = 'БЕЗКОШТОВНИЙ РОЗБІР / 24 ГОДИНИ';
  if (titleLines.length >= 3) {
    titleLines[0].textContent = 'Покажемо,';
    titleLines[1].textContent = 'де губляться';
    titleLines[2].textContent = 'ваші заявки.';
  }
  if (heroCopy) heroCopy.textContent = 'Надішліть сайт, Instagram або коротко опишіть нішу — повернемося з 3 конкретними змінами, які варто зробити першими.';
  if (heroButton) heroButton.childNodes[0].textContent = 'Отримати 3 правки ';
  if (briefKicker) briefKicker.textContent = 'БЕЗКОШТОВНИЙ РОЗБІР';
  if (briefTitle) briefTitle.innerHTML = 'Отримайте 3 конкретні правки <em>для своєї точки входу.</em>';
  if (briefCopy) briefCopy.textContent = 'Залиште контакти й коротко опишіть бізнес. Протягом 24 годин ми покажемо, де губляться заявки та що виправити першочергово.';
  if (project) project.value = 'Безкоштовний розбір сайту / точки входу';
}

applyCampaignOffer();

document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
  const packageSelect = form?.querySelector('[name="packageChoice"]');
  if (packageSelect) packageSelect.value = link.dataset.package;
}));

document.querySelectorAll('a[href="#brief"]').forEach((link, index) => {
  link.addEventListener('click', () => analytics?.trackCustom('PrimaryCtaClick', {
    cta_position: index === 0 ? 'header_or_hero' : `page_${index + 1}`
  }));
});

document.querySelectorAll('a[href^="https://t.me/"],a[href^="mailto:"]').forEach(link => {
  link.addEventListener('click', () => analytics?.trackCustom('ContactClick', {
    channel: link.href.startsWith('mailto:') ? 'email' : 'telegram'
  }));
});

if (form) {
  const formViewObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    analytics?.once('lead_form_view', () => analytics.trackCustom('LeadFormView'));
    formViewObserver.disconnect();
  }), { threshold: .45 });
  formViewObserver.observe(form);

  form.addEventListener('focusin', () => {
    analytics?.once('lead_form_start', () => analytics.trackCustom('FormStart'));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const missing = [...form.querySelectorAll('[required]')]
      .filter(field => !field.checkValidity())
      .map(field => field.name);
    if (missing.length) {
      analytics?.trackCustom('FormValidationError', {
        missing_fields: missing.join('|'),
        missing_count: missing.length
      });
      form.reportValidity();
      return;
    }

    const button = form.querySelector('[type="submit"]');
    button.innerHTML = 'Надсилаємо <span>…</span>';
    button.disabled = true;
    const lead = Object.fromEntries(new FormData(form).entries());
    lead.type = 'lead';
    lead.leadId = `LF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    lead.package = lead.packageChoice || 'Потрібна порада';
    Object.assign(lead, analytics?.getAttribution() || {});
    analytics?.trackCustom('LeadSubmitAttempt', {
      project_type: lead.project,
      package: lead.package
    });

    try {
      await fetch(automationEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(lead)
      });
      analytics?.trackStandard('Lead', {
        content_name: lead.project,
        content_category: lead.package
      });
      briefLink.href = `brief.html?lead=${encodeURIComponent(lead.leadId)}`;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      form.reset();
      applyCampaignOffer();
    } catch (error) {
      analytics?.trackCustom('LeadSubmitError', { error_type: 'network' });
      alert('Не вдалося надіслати форму. Спробуйте ще раз або напишіть нам у Telegram.');
    } finally {
      button.innerHTML = 'Надіслати заявку <span>↗</span>';
      button.disabled = false;
    }
  });
}

briefLink?.addEventListener('click', () => analytics?.trackCustom('BriefClick'));
document.querySelectorAll('.modal-close,.modal-button').forEach(button => button.addEventListener('click', () => {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}));
modal?.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
});
