(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  /* ---------- Translation ---------- */
  var SUPPORTED = ['fr', 'en', 'ar'];
  var T = window.TK_I18N;
  var lang = 'fr';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  function t(key) { return (T[lang] && T[lang][key]) || T.fr[key] || ''; }

  function applyLang(next) {
    if (SUPPORTED.indexOf(next) === -1) { next = 'fr'; }
    lang = next;
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    doc.title = t('meta.title');
    doc.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    doc.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === next)); });
    safeSet('tk-lang', next);
  }

  /* ---------- Hero: still image with one slow zoom; a real film at videos/tk-beton-hero.mp4 takes over if present ---------- */
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = doc.querySelector('.hero-video');
  if (!reduceMotion) {
    video.addEventListener('canplay', function () {
      video.classList.add('ready');
      video.play().catch(function () { video.classList.remove('ready'); });
    }, { once: true });
    video.addEventListener('error', function () { video.classList.remove('ready'); });
    video.src = video.getAttribute('data-src');
    video.load();
  }

  /* ---------- Header, menu, reveal ---------- */
  var header = doc.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var menuBtn = doc.querySelector('.menu-btn');
  var nav = doc.getElementById('main-nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  var revealEls = doc.querySelectorAll('.section-head, .card, .rail li, .band-copy, .craft-grid > *, .contact-grid > *, .pillars-grid > div');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Contact: product quote buttons pre-fill the message ---------- */
  var form = doc.getElementById('contact-form');
  doc.querySelectorAll('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () {
      var msg = form.elements.msg;
      if (!msg.value) { msg.value = a.getAttribute('data-product') + ' — '; }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var body = form.elements.name.value + '\n' + form.elements.phone.value + '\n\n' + form.elements.msg.value;
    window.location.href = 'mailto:info@tkbeton.ma?subject=' + encodeURIComponent('TK Béton — ' + form.elements.name.value) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- Language buttons ---------- */
  doc.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });
  /* French is the default; a visitor's own earlier choice is remembered. */
  applyLang(safeGet('tk-lang') || 'fr');
})();
