/* ALTIVA — interacciones del sitio */

// nav on scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), {passive:true});

// reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.15});
document.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));

// mobile menu — typographic toggle, no dependencies
const toggle = document.querySelector('.nav-toggle');
const panel = document.getElementById('nav-panel');
const setMenu = open => {
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
};
if (toggle && panel) {
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
}

// active section in the nav
const navLinks = [...document.querySelectorAll('.nav-links a')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if (sections.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      const link = navLinks.find(a => a.getAttribute('href') === '#' + e.target.id);
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, {rootMargin: '-45% 0px -50% 0px'});
  sections.forEach(s => spy.observe(s));
}


// fichas de catacion: un panel abierto a la vez, accesible por teclado
const discos = document.querySelectorAll('.disc[data-cup]');
discos.forEach(btn => btn.addEventListener('click', () => {
  const id = 'cup-' + btn.dataset.cup;
  const panel = document.getElementById(id);
  if (!panel) return;
  const abierto = panel.classList.contains('open');
  document.querySelectorAll('.cup.open').forEach(p => p.classList.remove('open'));
  discos.forEach(b => b.setAttribute('aria-expanded', 'false'));
  if (!abierto) {
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    panel.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
}));

// journal tag filter (visual)
const tags = document.querySelectorAll('.tags button');
const cards = document.querySelectorAll('.j-card');
tags.forEach(t => t.addEventListener('click', () => {
  tags.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
  t.classList.add('on');
  t.setAttribute('aria-pressed', 'true');
  const v = t.textContent.trim().toLowerCase();
  cards.forEach(c => {
    const show = v === 'all' || c.dataset.tags.includes(v);
    c.style.opacity = show ? 1 : .25;
    c.style.filter = show ? 'none' : 'grayscale(1)';
  });
}));


/* ── Conversiones B2B ── */
// Conversiones B2B. Sin GA4 activo no hace nada y no da error.
(function () {
  var send = function (name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0)            send('phone_click',    {method: 'phone'});
    else if (href.indexOf('wa.me') > -1)       send('whatsapp_click', {method: 'whatsapp'});
    else if (href.indexOf('mailto:') === 0)    send('email_click',    {method: 'email'});
  }, {passive: true});
  var form = document.querySelector('.sample-form');
  if (form) form.addEventListener('submit', function () {
    var v = form.querySelector('[name="variety"]');
    send('quote_request', {form: 'sample_request', variety: v ? v.value : ''});
  });
})();
