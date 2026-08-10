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

  /* Drawer close button */
  var closeBtn = e.target.closest('#drawer-close-btn');
  if (closeBtn) {
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
   Newsletter modal — shared across all pages (markup lives in
   components/header.html, fetched into #header-mount)
   ══════════════════════════════════════════════════════════ */
(function () {
  var lastTrigger = null;

  function getEls() {
    return {
      overlay: document.getElementById('newsletter-modal-overlay'),
      modal: document.getElementById('newsletter-modal'),
      form: document.getElementById('newsletter-form'),
      body: document.querySelector('.newsletter-form-body'),
      success: document.getElementById('newsletter-success'),
      errorEl: document.getElementById('newsletter-form-error'),
      submitBtn: document.getElementById('newsletter-submit-btn')
    };
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  window.openNewsletterModal = function (sourceContext, triggerEl) {
    var els = getEls();
    if (!els.overlay) return;
    lastTrigger = triggerEl || document.activeElement;

    var pageInput = document.getElementById('nl-source-page');
    var contextInput = document.getElementById('nl-source-context');
    if (pageInput) pageInput.value = window.location.href;
    if (contextInput) contextInput.value = sourceContext || 'modal';

    els.overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    var firstField = els.modal.querySelector('#nl-first-name');
    if (firstField) firstField.focus();

    document.addEventListener('keydown', trapHandler, true);
  };

  window.closeNewsletterModal = function () {
    var els = getEls();
    if (!els.overlay || els.overlay.hidden) return;
    els.overlay.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapHandler, true);
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  };

  function trapHandler(e) {
    var els = getEls();
    if (!els.overlay || els.overlay.hidden) return;

    if (e.key === 'Escape') {
      window.closeNewsletterModal();
      return;
    }

    if (e.key === 'Tab') {
      var focusable = getFocusable(els.modal);
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.js-newsletter-trigger');
    if (trigger) {
      e.preventDefault();
      window.openNewsletterModal(trigger.getAttribute('data-source-context') || 'modal', trigger);
      return;
    }

    var closeBtn = e.target.closest('#newsletter-modal-close');
    if (closeBtn) {
      window.closeNewsletterModal();
      return;
    }

    var overlay = e.target.closest('#newsletter-modal-overlay');
    if (overlay && e.target === overlay) {
      window.closeNewsletterModal();
    }
  });

  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'newsletter-form') return;
    e.preventDefault();

    var els = getEls();
    var form = els.form;
    var firstName = document.getElementById('nl-first-name');
    var checkedPrefs = form.querySelectorAll('input[name="preferences[]"]:checked');
    var consent = document.getElementById('nl-consent');

    els.errorEl.hidden = true;

    if (!firstName || !firstName.value.trim()) {
      els.errorEl.textContent = 'Please enter your first name.';
      els.errorEl.hidden = false;
      return;
    }
    if (!checkedPrefs.length) {
      els.errorEl.textContent = 'Please choose at least one topic you\'d like to hear about.';
      els.errorEl.hidden = false;
      return;
    }
    if (!consent || !consent.checked) {
      els.errorEl.textContent = 'Please check the consent box to subscribe.';
      els.errorEl.hidden = false;
      return;
    }

    var timestampInput = document.getElementById('nl-consent-timestamp');
    if (timestampInput) timestampInput.value = new Date().toISOString();

    els.submitBtn.disabled = true;
    els.submitBtn.classList.add('loading');
    els.submitBtn.querySelector('.btn-label').textContent = 'Subscribing…';

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        els.body.hidden = true;
        els.success.hidden = false;
        form.reset();
      } else {
        els.errorEl.textContent = 'Something went wrong sending your subscription. Please try again.';
        els.errorEl.hidden = false;
      }
    }).catch(function () {
      els.errorEl.textContent = 'Something went wrong sending your subscription. Please try again.';
      els.errorEl.hidden = false;
    }).finally(function () {
      els.submitBtn.disabled = false;
      els.submitBtn.classList.remove('loading');
      els.submitBtn.querySelector('.btn-label').textContent = 'Subscribe';
    });
  });
})();
