!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

document.addEventListener('DOMContentLoaded', function () {

  /* ── Selectors — querySelector for broader DOM search ── */
  const header    = document.querySelector('#ip-header') || document.querySelector('.ip-header');
  const mainbar   = document.querySelector('#mainbar')   || document.querySelector('.mainbar');
  const hamburger = document.querySelector('#hamburger-btn');
  const scrim     = document.querySelector('#ip-scrim');

  /* ── Toggle menu ── */
  function toggleMenu() {
    if (!header) return;
    header.classList.toggle('open');
    const isOpen = header.classList.contains('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /* ── Close menu ── */
  function closeMenu() {
    if (!header) return;
    header.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── Hamburger click ── */
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
  }

  /* ── Scrim click closes drawer ── */
  if (scrim) {
    scrim.addEventListener('click', closeMenu);
  }

  /* ── Escape key closes drawer ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Expose globally for inline onclick="toggleMenu()" ── */
  window.toggleMenu = toggleMenu;
  window.closeMenu  = closeMenu;

  /* ── Scroll: .scrolled class on mainbar ── */
  if (mainbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        mainbar.classList.add('scrolled');
      } else {
        mainbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ── Intersection observer: all [data-ip-animate] sections ── */
  const sections = document.querySelectorAll('[data-ip-animate]');

  if (sections.length) {
    const sectionObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(function (sec) { sectionObserver.observe(sec); });
  }

  /* ── Intersection observer: ip-why-dynamic cards ── */
  const whySection = document.querySelector('.ip-why-dynamic');
  if (whySection) {
    const whyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          whyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    whyObserver.observe(whySection);
  }

  /* ── Parallax: Who We Are image ── */
  const parallaxImg     = document.querySelector('.parallax-img');
  const parallaxSection = document.querySelector('.ip-who-dynamic');

  if (parallaxImg && parallaxSection) {
    window.addEventListener('scroll', function () {
      const rect = parallaxSection.getBoundingClientRect();
      const wh   = window.innerHeight;
      if (rect.top < wh && rect.bottom > 0) {
        const middle       = rect.top + (rect.height / 2);
        const screenMiddle = wh / 2;
        const dist         = (middle - screenMiddle) / wh;
        parallaxImg.style.transform = 'translateY(' + (dist * 15) + '%) scale(1.1)';
      }
    }, { passive: true });
  }

  /* ── Footer year ── */
  const yearEl = document.getElementById('ip-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});

/* ══════════════════════════════════════════════════════════
   Cal.com embed
   ══════════════════════════════════════════════════════════ */
(function (C, A, L) {
  let p = function (a, ar) { a.q.push(ar); };
  let d = C.document;
  C.Cal = C.Cal || function () {
    let cal = C.Cal;
    let ar  = arguments;
    if (!cal.loaded) {
      cal.ns  = {};
      cal.q   = cal.q || [];
      d.head.appendChild(d.createElement("script")).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api       = function () { p(api, arguments); };
      const namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ["initNamespace", namespace]);
      } else {
        p(cal, ar);
      }
      return;
    }
    p(cal, ar);
  };
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", "let-s-connect", { origin: "https://app.cal.com" });
Cal.ns["let-s-connect"]("inline", {
  elementOrSelector: "#my-cal-inline-let-s-connect",
  config: { "layout": "column_view" },
  calLink: "iberian-pacific/let-s-connect"
});
Cal.ns["let-s-connect"]("ui", { "hideEventTypeDetails": false, "layout": "column_view" });
