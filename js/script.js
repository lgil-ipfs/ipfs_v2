!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

    document.addEventListener('DOMContentLoaded', function () {
        const header = document.getElementById('ip-header');
        const mainbar = document.getElementById('mainbar');
        const hamburger = document.getElementById('hamburger-btn');
        const scrim = document.getElementById('ip-scrim');
        // Scroll Effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) { mainbar.classList.add('scrolled'); }
            else { mainbar.classList.remove('scrolled'); }
        });
        // Mobile Menu
        function toggleMenu() {
            header.classList.toggle('open');
            const isOpen = header.classList.contains('open');
            if (hamburger) hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        }
        if (hamburger) hamburger.addEventListener('click', toggleMenu);
        if (scrim) scrim.addEventListener('click', toggleMenu);
        // Global expose for close button
        window.toggleMenu = toggleMenu;
    });


        /* 
         * DYNAMIC LOGIC
         */
        document.addEventListener('DOMContentLoaded', () => {
            const section = document.querySelector('.ip-why-dynamic');
            // Intersection Observer to stagger reveal cards
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            if (section) observer.observe(section);
        });
    

  (function (C, A, L) { 
    let p = function (a, ar) { a.q.push(ar); }; 
    let d = C.document; 
    C.Cal = C.Cal || function () { 
      let cal = C.Cal; 
      let ar = arguments; 
      if (!cal.loaded) { 
        cal.ns = {}; 
        cal.q = cal.q || []; 
        d.head.appendChild(d.createElement("script")).src = A; 
        cal.loaded = true; 
      } 
      if (ar[0] === L) { 
        const api = function () { p(api, arguments); }; 
        const namespace = ar[1]; 
        api.q = api.q || []; 
        if(typeof namespace === "string"){
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ["initNamespace", namespace]);
        } else p(cal, ar); 
        return;
      } 
      p(cal, ar); 
    }; 
  })(window, "https://app.cal.com/embed/embed.js", "init");
  
  Cal("init", "let-s-connect", {origin:"https://app.cal.com"});
  Cal.ns["let-s-connect"]("inline", {
    elementOrSelector:"#my-cal-inline-let-s-connect",
    config:{ "layout":"column_view" },
    calLink:"iberian-pacific/let-s-connect"
  });
  Cal.ns["let-s-connect"]("ui", { "hideEventTypeDetails":false, "layout":"column_view" });


        (function () {
            var y = document.getElementById('ip-year');
            if (y) { y.textContent = new Date().getFullYear(); }
        })();
    

    document.addEventListener('DOMContentLoaded', () => {
        // 1. Unified Scroll Trigger
        // Select all sections with data-ip-animate
        const sections = document.querySelectorAll('[data-ip-animate]');

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target); // Trigger once
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(sec => observer.observe(sec));

        // 2. Parallax Effect for "Who We Are" image
        const parallaxImg = document.querySelector('.parallax-img');
        const parallaxSection = document.querySelector('.ip-who-dynamic');

        if (parallaxImg && parallaxSection) {
            window.addEventListener('scroll', () => {
                const rect = parallaxSection.getBoundingClientRect();
                const wh = window.innerHeight;

                // Only animate when section is nearby/in viewport
                if (rect.top < wh && rect.bottom > 0) {
                    // Calculate progress 0 to 1
                    const middle = rect.top + (rect.height / 2);
                    const screenMiddle = wh / 2;
                    const dist = (middle - screenMiddle) / wh;

                    // Move slightly: -10% to 10%
                    const move = dist * 15;
                    parallaxImg.style.transform = `translateY(${move}%) scale(1.1)`;
                }
            });
        }
    });
