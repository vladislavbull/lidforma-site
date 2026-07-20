(() => {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1999638007347637');
  fbq('track', 'PageView');

  const analytics = window.LidformaAnalytics;
  const brand = document.querySelector('.brand');
  brand.innerHTML = '<span class="brand-mark"><i></i><b></b><em></em></span><span>ЛІДФОРМА</span>';
  const logoStyles = document.createElement('link');
  logoStyles.rel = 'stylesheet';
  logoStyles.href = 'brief-logo.css';
  document.head.appendChild(logoStyles);

  if (analytics?.isAuditCampaign()) {
    const intro = document.querySelector('main aside');
    intro.querySelector('p').textContent = 'БЕЗКОШТОВНИЙ РОЗБІР / 3 ПРАВКИ';
    intro.querySelector('h1').innerHTML = 'Допоможіть нам побачити<br><em>вашу точку входу.</em>';
    intro.querySelector('span').textContent = 'Дайте короткий контекст — ми знайдемо три пріоритетні зміни, які можуть прибрати втрати на шляху до заявки.';
  }

  const steps = [...document.querySelectorAll('.step')];
  const form = document.querySelector('#brief');
  const next = document.querySelector('#next');
  const back = document.querySelector('#back');
  const send = document.querySelector('#submit');
  const bar = document.querySelector('.progress em');
  const count = document.querySelector('#counter');
  const caption = document.querySelector('#caption');
  const automationEndpoint = 'https://script.google.com/macros/s/AKfycbzAOYiXTkA90rbTYyGV15uk7dJ7IbtA9herqE6teOzLO8j9zh7HnOGvANfoX0JxTTM/exec';
  const labels = ['Знайомство', 'Аудиторія й ціль', 'Сенс і візуал', 'Матеріали й запуск'];
  let active = 0;

  function draw() {
    steps.forEach((step, index) => step.classList.toggle('active', index === active));
    back.style.visibility = active ? 'visible' : 'hidden';
    next.style.display = active === 3 ? 'none' : 'block';
    send.style.display = active === 3 ? 'block' : 'none';
    count.textContent = `0${active + 1}`;
    caption.textContent = labels[active];
    bar.style.width = `${25 * (active + 1)}%`;
  }

  function valid() {
    const invalid = [...steps[active].querySelectorAll('[required]')].filter(field => !field.checkValidity());
    if (!invalid.length) return true;
    analytics?.trackCustom('BriefValidationError', {
      step: active + 1,
      missing_fields: invalid.map(field => field.name).join('|'),
      missing_count: invalid.length
    });
    invalid[0].reportValidity();
    return false;
  }

  form.addEventListener('focusin', () => {
    analytics?.once('brief_start', () => analytics.trackCustom('BriefStart', { step: 1 }));
  });

  next.onclick = () => {
    analytics?.once('brief_start', () => analytics.trackCustom('BriefStart', { step: 1 }));
    if (!valid()) return;
    analytics?.trackCustom('BriefStepComplete', { step: active + 1, step_name: labels[active] });
    active += 1;
    draw();
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  back.onclick = () => {
    active -= 1;
    draw();
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  form.onsubmit = async event => {
    event.preventDefault();
    if (!valid()) return;
    analytics?.trackCustom('BriefStepComplete', { step: 4, step_name: labels[3] });
    const data = Object.fromEntries(new FormData(event.target).entries());
    data.type = 'brief';
    data.leadId = new URLSearchParams(location.search).get('lead') || '';
    data.style = [...document.querySelectorAll('[name=style]:checked')].map(input => input.value);
    Object.assign(data, analytics?.getAttribution() || {});
    analytics?.trackCustom('BriefSubmitAttempt');

    try {
      await fetch(automationEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      analytics?.trackStandard('CompleteRegistration', { content_name: 'Project brief' });
      document.querySelector('#thanks').classList.add('show');
    } catch {
      analytics?.trackCustom('BriefSubmitError', { error_type: 'network' });
      alert('Не вдалося надіслати бриф. Спробуйте ще раз.');
    }
  };
})();
