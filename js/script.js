!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

/* ============================================================
   IBERIAN PACIFIC — script.js
   Uses event delegation so hamburger works inside Webflow
   w-embed which renders after DOMContentLoaded
   ============================================================ */

/* ── Menu functions exposed immediately on window ── */
window.toggleMenu = function () {
  var header = document.querySelector('#ip-header') || document.querySelector('.ip-header');
  if (!header) return;
  var isOpen = header.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  var btn = document.querySelector('#hamburger-btn');
  if (btn) btn.setAttribute('aria-expanded', String(isOpen));
};

window.closeMenu = function () {
  var header = document.querySelector('#ip-header') || document.querySelector('.ip-header');
  if (!header) return;
  header.classList.remove('open');
  document.body.style.overflow = '';
  var btn = document.querySelector('#hamburger-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
};

/* ── Event delegation — works regardless of when embed renders ── */
document.addEventListener('click', function (e) {

  /* Hamburger button or anything inside it */
  var hamburger = e.target.closest('#hamburger-btn');
  if (hamburger) {
    e.stopPropagation();
    window.toggleMenu();
    return;
  }

  /* Scrim click — close drawer */
  var scrim = e.target.closest('#ip-scrim');
  if (scrim) {
    window.closeMenu();
    return;
  }

});

/* ── Escape key ── */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') window.closeMenu();
});

/* ── Scroll: .scrolled on mainbar ── */
window.addEventListener('scroll', function () {
  var mainbar = document.querySelector('#mainbar') || document.querySelector('.mainbar');
  if (!mainbar) return;
  if (window.scrollY > 20) {
    mainbar.classList.add('scrolled');
  } else {
    mainbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── Everything else waits for DOM ── */
document.addEventListener('DOMContentLoaded', function () {

  /* Intersection observer: all [data-ip-animate] sections */
  var sections = document.querySelectorAll('[data-ip-animate]');
  if (sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    sections.forEach(function (sec) { sectionObserver.observe(sec); });
  }

  /* Intersection observer: ip-why-dynamic */
  var whySection = document.querySelector('.ip-why-dynamic');
  if (whySection) {
    var whyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          whyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    whyObserver.observe(whySection);
  }

  /* Parallax: Who We Are image */
  var parallaxImg     = document.querySelector('.parallax-img');
  var parallaxSection = document.querySelector('.ip-who-dynamic');
  if (parallaxImg && parallaxSection) {
    window.addEventListener('scroll', function () {
      var rect = parallaxSection.getBoundingClientRect();
      var wh   = window.innerHeight;
      if (rect.top < wh && rect.bottom > 0) {
        var middle       = rect.top + (rect.height / 2);
        var screenMiddle = wh / 2;
        var dist         = (middle - screenMiddle) / wh;
        parallaxImg.style.transform = 'translateY(' + (dist * 15) + '%) scale(1.1)';
      }
    }, { passive: true });
  }

  /* Footer year */
  var yearEl = document.getElementById('ip-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});

/* ══════════════════════════════════════════════════════════
   Cal.com embed
   ══════════════════════════════════════════════════════════ */
(function (C, A, L) {
  var p = function (a, ar) { a.q.push(ar); };
  var d = C.document;
  C.Cal = C.Cal || function () {
    var cal = C.Cal;
    var ar  = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q  = cal.q || [];
      d.head.appendChild(d.createElement('script')).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      var api       = function () { p(api, arguments); };
      var namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === 'string') {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ['initNamespace', namespace]);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  };
})(window, 'https://app.cal.com/embed/embed.js', 'init');

Cal('init', 'let-s-connect', { origin: 'https://app.cal.com' });
Cal.ns['let-s-connect']('inline', {
  elementOrSelector: '#my-cal-inline-let-s-connect',
  config: { layout: 'column_view' },
  calLink: 'iberian-pacific/let-s-connect'
});
Cal.ns['let-s-connect']('ui', { hideEventTypeDetails: false, layout: 'column_view' });
