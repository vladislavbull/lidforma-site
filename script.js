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
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const button = form.querySelector('[type="submit"]');
  button.innerHTML = 'Надсилаємо <span>…</span>'; button.disabled = true;
  const lead = Object.fromEntries(new FormData(form).entries());
  lead.package = document.querySelector('select[name="project"]').dataset.selectedPackage || 'Ще не обрано';
  /* Для запуску підключіть endpoint: window.LIDFORMA_CONFIG = { leadEndpoint: '/api/leads' }.
     Тоді форма передасть дані до CRM / Telegram-бота через ваш сервер. */
  try {
    if (window.LIDFORMA_CONFIG?.leadEndpoint) {
      await fetch(window.LIDFORMA_CONFIG.leadEndpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(lead) });
    }
    modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); form.reset();
  } catch (error) { alert('Не вдалося надіслати форму. Спробуйте ще раз або напишіть нам у Telegram.'); }
  finally { button.innerHTML = 'Надіслати заявку <span>↗</span>'; button.disabled = false; }
});
document.querySelectorAll('.modal-close,.modal-button').forEach(button => button.addEventListener('click', () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); }));
modal.addEventListener('click', e => { if (e.target === modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); } });
