/* ALTIVA — interacciones del sitio */

// nav on scroll
const nav = document.getElementById('nav');
const solidNav = document.body.classList.contains('page-solid');
addEventListener('scroll', () => nav.classList.toggle('scrolled', solidNav || scrollY > 40), {passive:true});

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
const sections = navLinks.filter(a => a.getAttribute('href').startsWith('#')).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
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
})();

/* ── Solicitud de muestras ──
   Con data-key (Web3Forms) envia la solicitud por correo a sales@ sin salir de la pagina.
   Sin clave valida, compone el mensaje y lo abre en WhatsApp (comportamiento anterior). */
(function () {
  var form = document.querySelector('.sample-form');
  if (!form) return;
  var key = form.dataset.key || '';
  var useEmail = key && key.indexOf('REPLACE') !== 0;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var waLink = 'https://wa.me/' + (form.dataset.wa || '6586419553');
  var get = function (n) {
    var el = form.querySelector('[name="' + n + '"]');
    return el && el.value.trim() ? el.value.trim() : '';
  };
  var say = function (html, kind) {
    if (!status) return;
    status.className = 'form-status ' + (kind || '');
    status.innerHTML = html;
  };
  if (!useEmail) {
    var note = form.querySelector('.form-note');
    if (note) note.textContent = 'Opens in WhatsApp with your details filled in. We reply within two working days.';
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var track = function () {
      if (typeof window.gtag === 'function') window.gtag('event', 'quote_request', {form: 'sample_request', variety: get('variety'), format: get('format')});
    };
    if (!useEmail) {
      var lines = [
        'Sample request — Altiva',
        'Name: ' + get('name'),
        'Company: ' + get('company'),
        'Email: ' + get('email'),
        'Phone: ' + get('phone'),
        'Market: ' + get('market'),
        'Business: ' + get('buyer'),
        'Green or roasted: ' + get('format'),
        'Variety: ' + get('variety'),
        'Annual volume: ' + get('volume')
      ];
      if (get('message')) lines.push('Notes: ' + get('message'));
      track();
      window.open(waLink + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      return;
    }
    var bot = form.querySelector('[name="botcheck"]');
    var payload = {
      access_key: key,
      subject: 'Sample request — ' + get('company') + ' (' + (get('format') || 'format not chosen') + ' · ' + (get('variety') || 'variety not chosen') + ')',
      from_name: 'Altiva website',
      replyto: get('email'),
      botcheck: bot && bot.checked,
      Name: get('name'),
      Company: get('company'),
      Email: get('email'),
      'Phone / WhatsApp': get('phone'),
      'Market': get('market'),
      'Business type': get('buyer'),
      'Green or roasted': get('format'),
      'Variety': get('variety'),
      'Annual volume': get('volume'),
      'Message': get('message')
    };
    button.disabled = true;
    var label = button.textContent;
    button.textContent = 'Sending…';
    say('', '');
    fetch(form.action, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (!data || !data.success) throw new Error('not sent');
      track();
      form.classList.add('is-sent');
      say('<b>Request received. Thank you.</b> We will reply to ' + get('email').replace(/[<>&"]/g, '') +
          ' within two working days. Prefer to talk now? <a href="' + waLink + '" data-track="whatsapp" rel="noopener">Chat with us on WhatsApp</a>.', 'ok');
      form.reset();
      button.textContent = 'Sent';
    }).catch(function () {
      button.disabled = false;
      button.textContent = label;
      say('Your request could not be sent. Please try again, or write to <a href="mailto:sales@altivaspecialitycoffee.com">sales@altivaspecialitycoffee.com</a> or <a href="' + waLink + '" rel="noopener">WhatsApp</a>.', 'err');
    });
  });
})();
