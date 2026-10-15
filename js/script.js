/* ==========================================================================
   Vinayaka College & School of Nursing — shared script
   Plain vanilla JavaScript. No libraries, no build step.
   Handles: sticky header, dropdown nav, mobile menu, scroll reveal,
            gallery filtering + lightbox, accordions, form validation,
            back-to-top, scroll progress and image fallbacks.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     1. Scroll progress bar + sticky header shadow + back-to-top
     ------------------------------------------------------------------ */
  var progress = $('#scrollProgress');
  var header   = $('#siteHeader');
  var toTop    = $('#backToTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) { progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%'; }
    if (header) { header.classList.toggle('is-stuck', y > 8); }
    if (toTop) { toTop.classList.toggle('is-visible', y > 620); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     2. Dropdown menus (hover on pointer devices, click + keyboard always)
     ------------------------------------------------------------------ */
  var dropdownParents = $$('.has-dropdown');

  function closeAllDropdowns(except) {
    dropdownParents.forEach(function (li) {
      if (li === except) { return; }
      li.classList.remove('is-open');
      var trigger = $('.nav__link', li);
      if (trigger) { trigger.setAttribute('aria-expanded', 'false'); }
    });
  }

  dropdownParents.forEach(function (li) {
    var trigger = $('.nav__link', li);
    var menu    = $('.dropdown', li);
    if (!trigger || !menu) { return; }

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var open = li.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
      closeAllDropdowns(li);
    });

    li.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 1161px)').matches) {
        li.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    li.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 1161px)').matches) {
        li.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        li.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        var first = $('a', menu);
        if (first) { first.focus(); }
      }
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        li.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) { closeAllDropdowns(null); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAllDropdowns(null); closeNav(); }
  });

  /* ------------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------------ */
  var navToggle = $('#navToggle');
  var nav       = $('#primaryNav');
  var scrim     = $('#navScrim');

  function openNav() {
    if (!nav) { return; }
    nav.classList.add('is-open');
    if (scrim) { scrim.classList.add('is-visible'); }
    if (navToggle) { navToggle.setAttribute('aria-expanded', 'true'); }
    document.body.classList.add('nav-open');
  }
  function closeNav() {
    if (!nav || !nav.classList.contains('is-open')) { return; }
    nav.classList.remove('is-open');
    if (scrim) { scrim.classList.remove('is-visible'); }
    if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('nav-open');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (nav && nav.classList.contains('is-open')) { closeNav(); } else { openNav(); }
    });
  }
  if (scrim) { scrim.addEventListener('click', closeNav); }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1160) { closeNav(); }
  });

  /* ------------------------------------------------------------------
     4. Scroll reveal animations
     ------------------------------------------------------------------ */
  var revealObserver = null;

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  }

  /* Registers elements for a one-off reveal. Falls back to showing them
     immediately where IntersectionObserver is unavailable. */
  function revealAll(items) {
    items.forEach(function (el) {
      if (revealObserver) { revealObserver.observe(el); } else { el.classList.add('is-visible'); }
    });
  }

  revealAll($$('[data-reveal]'));

  /* ------------------------------------------------------------------
     5. Accordions
     ------------------------------------------------------------------ */
  $$('.accordion').forEach(function (item) {
    var btn   = $('.accordion__btn', item);
    var panel = $('.accordion__panel', item);
    if (!btn || !panel) { return; }
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  });

  /* ------------------------------------------------------------------
     6. Image fallback for portraits that fail to load
     ------------------------------------------------------------------ */
  var portraitFallback =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>" +
      "<rect width='320' height='320' fill='#F4EFF7'/>" +
      "<circle cx='160' cy='124' r='52' fill='#DDA9C6'/>" +
      "<path d='M52 320c0-62 48-104 108-104s108 42 108 104z' fill='#DDA9C6'/>" +
      "</svg>"
    );

  function attachFallback(img, fallback) {
    img.addEventListener('error', function handle() {
      img.removeEventListener('error', handle);
      img.src = fallback;
    });
  }

  /* ------------------------------------------------------------------
     7. Gallery — data, filtering and lightbox
     ------------------------------------------------------------------ */
  /* Base path of the college's original image library. */
  var UPLOADS = 'https://vinayakacollegeofnursing.com/wp-content/uploads/';

  /* Every image published on the old site's gallery page (292 images),
     grouped by the old site's own gallery filters. */
  var GALLERY = [
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.19-PM.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.19 PM" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (1)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-10.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (10)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-11.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (11)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-12.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (12)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-13.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (13)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-14.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (14)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-15.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (15)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-16.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (16)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-17.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (17)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-18.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (18)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-19.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (19)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-2.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (2)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-20.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (20)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-21.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (21)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-22.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (22)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-23.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (23)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-24.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (24)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-25.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (25)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-26.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (26)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-27.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (27)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-28.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (28)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-29.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (29)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-3.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (3)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-30.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (30)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-31.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (31)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-32.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (32)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-33.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (33)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-34.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (34)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-35.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (35)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-36.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (36)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-37.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (37)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-38.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (38)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-39.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (39)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-4.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (4)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-40.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (40)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-41.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (41)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-42.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (42)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-43.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (43)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-44.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (44)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-45.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (45)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-46.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (46)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-47.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (47)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-48.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (48)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-49.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (49)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-5.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (5)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-50.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (50)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-51.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (51)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-52.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (52)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-53.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (53)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-54.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (54)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-55.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (55)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-56.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (56)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-57.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (57)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-58.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (58)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-59.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (59)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-6.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (6)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-60.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (60)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-61.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (61)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-62.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (62)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-63.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (63)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-64.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (64)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-65.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (65)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-66.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (66)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-67.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (67)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-68.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (68)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-69.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (69)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-7.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (7)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-70.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (70)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-71.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (71)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-72.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (72)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-73.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (73)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-74.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (74)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-75.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (75)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-76.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (76)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-77.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (77)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-78.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (78)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-79.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (79)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-8.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (8)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-80.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (80)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-81.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (81)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-82.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (82)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-83.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (83)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-84.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (84)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-85.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (85)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-86.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (86)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-87.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (87)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-88.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (88)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-89.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (89)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-9.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (9)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-90.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (90)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-91.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (91)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-92.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (92)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-93.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (93)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-94.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (94)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-95.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (95)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-96.jpeg", y: "2025-26", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (96)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.25-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.25 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.35-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.35 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.36 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.36 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.37 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.37 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.38-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.38 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.39 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.39 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.40-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.40 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.41-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.41 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.42-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.42 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.43-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.43 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.44 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.44 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.45-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.45 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.46-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.46 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.47-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.47 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.48-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.48 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.49-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.49 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.50 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.50 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.51-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.51 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.54 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.54 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.57 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.57 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.58-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.58 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.01 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.01 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.02-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.02 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.03-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.03 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.04 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.04 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.05 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.05 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.06-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.06 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.07-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.07 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.08-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.08 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.09-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.09 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.10-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.10 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.15 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.15 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.16 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.16 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.18 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.18 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.20 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.20 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.26 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.26 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.28 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.28 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.30 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.30 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-1.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-2.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.32-PM.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.32 PM" },
  { s: "2026/07/Printable-Tarot-Cards-Rider-Waite-Full-Deck_Page_01-1-scaled.jpg", y: "2026-27", t: "Printable-Tarot-Cards-Rider-Waite-Full-Deck_Page_01" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-3.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (3)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.08-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.08 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-3.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (3)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.10-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.10 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.19-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.19 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.22 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.22 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.23 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.23 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.24 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.24 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.25 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.25 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.26-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.26 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.28-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.28 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.29 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.29 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.30-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.30 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.31-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.31 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.32-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.32 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.33 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.33 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.34 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.34 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.36-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.36 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.37-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.37 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.41 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.41 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.42 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.42 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.43 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.43 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.44 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.44 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.45-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.45 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.46-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.46 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.47 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.47 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.48 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.48 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.49-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.49 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.51-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.51 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.52 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.52 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.53-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.53 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.54 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.54 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.55 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.55 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.56 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.56 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.00-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.00 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.03-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.03 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.04 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.04 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.09 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.09 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.11 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.11 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.13 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.13 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.14-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.14 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.15 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.15 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.17-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.17 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.18 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.18 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.23 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.23 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.25 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.25 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.27 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.27 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-2.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.29 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.29 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.30-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.30 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.33-PM.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.33 PM" }
];
;

  var galleryEl = $('#galleryGrid');
  var filterEls = $$('.filter-btn');

  var GENERIC_TITLE = /^(whatsapp|img|image|photo|screenshot|dsc|file)[\s_-]/i;
  var SECTION_LABEL = {
    home: 'Campus life',
    gallery: 'Campus life'
  };

  function labelFor(item, index) {
    if (item.t && !GENERIC_TITLE.test(item.t)) { return item.t; }
    var section = SECTION_LABEL[document.body.getAttribute('data-page')] || 'Gallery';
    return section + ' photograph \u2014 ' + item.y + ' (' + (index + 1) + ')';
  }

  var galleryItems = [];

  if (galleryEl) {
    var yearFilter = galleryEl.getAttribute('data-year-filter') === 'true';
    var limit      = parseInt(galleryEl.getAttribute('data-limit') || '0', 10);

    /* Build the list, honouring the optional "latest N" preview limit. */
    GALLERY.forEach(function (item, i) {
      galleryItems.push({
        src: UPLOADS + item.s,
        year: item.y,
        title: labelFor(item, i)
      });
    });
    if (limit > 0) { galleryItems = galleryItems.slice(0, limit); }

    /* ----------------------------------------------------------------
       Tile rendering.

       Every photograph in the collection gets a tile. Images are lazy
       loaded by the browser, so only the rows on screen are requested.
       ---------------------------------------------------------------- */
    var tileEls = [];
    var activeYear = 'all';

    function makeTile(item, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item';
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('data-year', item.year);
      btn.setAttribute('aria-label', 'Enlarge image: ' + item.title);

      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 800;
      img.height = 600;
      attachFallback(img, portraitFallback);
      btn.appendChild(img);

      var zoom = document.createElement('span');
      zoom.className = 'gallery-item__zoom';
      zoom.setAttribute('aria-hidden', 'true');
      zoom.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      btn.appendChild(zoom);

      /* Small stagger so each newly revealed row animates in sequence. */
      btn.style.animationDelay = ((i % 8) * 45) + 'ms';

      return btn;
    }

    function updateCount(visible) {
      var live = $('#galleryCount');
      if (!live) { return; }
      var total = (activeYear === 'all') ? galleryItems.length : visible;
      live.textContent = total + ' image' + (total === 1 ? '' : 's') +
        (activeYear === 'all' ? ' in the gallery' : ' in ' + activeYear);
    }

    function applyFilter(year) {
      activeYear = year;
      var visible = 0;
      tileEls.forEach(function (tile) {
        var show = (year === 'all' || tile.getAttribute('data-year') === year);
        tile.hidden = !show;
        if (show) { visible++; }
      });
      updateCount(visible);
    }

    var frag = document.createDocumentFragment();
    galleryItems.forEach(function (item, i) { frag.appendChild(makeTile(item, i)); });
    galleryEl.appendChild(frag);

    tileEls = $$('.gallery-item', galleryEl);
    revealAll(tileEls);
    updateCount(tileEls.length);

    /* Filtering */
    filterEls.forEach(function (btn) {
      if (!yearFilter) { return; }
      btn.addEventListener('click', function () {
        filterEls.forEach(function (other) { other.setAttribute('aria-pressed', String(other === btn)); });
        applyFilter(btn.getAttribute('data-filter'));
      });
    });

    /* Lightbox */
    var lightbox  = $('#lightbox');
    var lbImg     = $('#lightboxImg');
    var lbCaption = $('#lightboxCaption');
    var lbCount   = $('#lightboxCount');
    var lastFocus = null;
    var currentList = tileEls.slice();
    var currentIndex = 0;

    function show(index) {
      if (!currentList.length) { return; }
      currentIndex = (index + currentList.length) % currentList.length;
      var tile = currentList[currentIndex];
      var item = galleryItems[parseInt(tile.getAttribute('data-index'), 10)];
      lbImg.src = item.src;
      lbImg.alt = item.title;
      lbCaption.textContent = item.title;
      lbCount.textContent = (currentIndex + 1) + ' / ' + currentList.length;
    }

    function openLightbox(tile) {
      lastFocus = document.activeElement;
      currentList = tileEls.filter(function (t) { return !t.hidden; });
      lightbox.classList.add('is-open');
      document.body.classList.add('nav-open');
      show(currentList.indexOf(tile));
      var closeBtn = $('.lightbox__close', lightbox);
      if (closeBtn) { closeBtn.focus(); }
    }
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    galleryEl.addEventListener('click', function (e) {
      var tile = e.target.closest('.gallery-item');
      if (tile) { openLightbox(tile); }
    });

    if (lightbox) {
      $('.lightbox__close', lightbox).addEventListener('click', closeLightbox);
      $('.lightbox__prev', lightbox).addEventListener('click', function () { show(currentIndex - 1); });
      $('.lightbox__next', lightbox).addEventListener('click', function () { show(currentIndex + 1); });
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) { closeLightbox(); }
      });

      /* Swipe support on touch devices */
      var startX = null;
      lightbox.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      lightbox.addEventListener('touchend', function (e) {
        if (startX === null) { return; }
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) { show(dx < 0 ? currentIndex + 1 : currentIndex - 1); }
        startX = null;
      }, { passive: true });

      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('is-open')) { return; }
        if (e.key === 'Escape') { closeLightbox(); }
        if (e.key === 'ArrowRight') { show(currentIndex + 1); }
        if (e.key === 'ArrowLeft') { show(currentIndex - 1); }
      });
    }
  }

  /* ------------------------------------------------------------------
     8. Front-end only forms (no back end yet)
     ------------------------------------------------------------------ */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[+()\d][\d\s()+-]{6,19}$/;

  $$('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      $$('[required]', form).forEach(function (input) {
        var field = input.closest('.field');
        var value = (input.value || '').trim();
        var valid = value.length > 0;

        if (valid && input.type === 'email') { valid = emailRe.test(value); }
        if (valid && input.type === 'tel') { valid = phoneRe.test(value); }

        if (field) {
          field.classList.toggle('has-error', !valid);
          input.setAttribute('aria-invalid', String(!valid));
        }
        if (!valid) { ok = false; }
      });

      var status = $('.form-status', form);
      if (!ok) {
        if (status) {
          status.className = 'form-status is-visible';
          status.style.background = '#FDECEA';
          status.style.borderColor = '#F3C4BF';
          status.style.color = '#8C1D18';
          status.textContent = 'Please correct the highlighted fields and try again.';
        }
        var firstBad = $('.field.has-error input, .field.has-error select, .field.has-error textarea', form);
        if (firstBad) { firstBad.focus(); }
        return;
      }

      form.reset();
      if (status) {
        status.className = 'form-status is-visible';
        status.style.background = '';
        status.style.borderColor = '';
        status.style.color = '';
        status.textContent = 'Thank you. Your enquiry has been recorded. Our office will contact you on the phone number or email address you provided.';
      }
    });

    $$('input, select, textarea', form).forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field && field.classList.contains('has-error')) {
          field.classList.remove('has-error');
          input.setAttribute('aria-invalid', 'false');
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     9. Current year in the footer
     ------------------------------------------------------------------ */
  $$('[data-current-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
