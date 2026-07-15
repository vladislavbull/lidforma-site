const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; });

const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
}), { threshold: .13 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const countObserver = new IntersectionObserver((entries) => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.querySelectorAll('[data-count]').forEach(node => {
    const max = Number(node.dataset.count); let value = 0;
    const tick = () => { value += 1; node.textContent = value; if (value < max) requestAnimationFrame(tick); };
    tick();
  });
  countObserver.unobserve(entry.target);
}), { threshold: .4 });
document.querySelectorAll('.metrics').forEach(el => countObserver.observe(el));

document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
  const select = document.querySelector('select[name="project"]');
  select.dataset.selectedPackage = link.dataset.package;
}));

const form = document.querySelector('#lead-form');
const modal = document.querySelector('#success-modal');
const automationEndpoint = 'https://script.google.com/macros/s/AKfycbzAOYiXTkA90rbTYyGV15uk7dJ7IbtA9herqE6teOzLO8j9zh7HnOGvANfoX0JxTTM/exec';
const briefLink = document.querySelector('.modal-brief');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const button = form.querySelector('[type="submit"]');
  button.innerHTML = 'Надсилаємо <span>…</span>'; button.disabled = true;
  const lead = Object.fromEntries(new FormData(form).entries());
  lead.type = 'lead';
  lead.leadId = `LF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  lead.package = lead.packageChoice || document.querySelector('select[name="project"]').dataset.selectedPackage || 'Потрібна порада';
  try {
    await fetch(automationEndpoint, { method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(lead) });
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: lead.project, content_category: lead.package });
    briefLink.href = `brief.html?lead=${encodeURIComponent(lead.leadId)}`;
    modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); form.reset();
  } catch (error) { alert('Не вдалося надіслати форму. Спробуйте ще раз або напишіть нам у Telegram.'); }
  finally { button.innerHTML = 'Надіслати заявку <span>↗</span>'; button.disabled = false; }
});
document.querySelectorAll('.modal-close,.modal-button').forEach(button => button.addEventListener('click', () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }));
modal.addEventListener('click', e => { if (e.target === modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });
