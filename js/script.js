/* ==========================================================================
   Vinayaka College & School of Nursing - shared script
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
      if (window.matchMedia('(hover: hover) and (min-width: 1160px)').matches) {
        li.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    li.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 1160px)').matches) {
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
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeNav(); }
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1159) { closeNav(); }
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
     6b. Initial-letter avatar for staff without a photograph

     Every member of staff currently has a photo, but if one is missing
     or fails to load the card falls back to a neutral initial rather
     than a broken image or a generic silhouette.
     ------------------------------------------------------------------ */
  $$('.person__photo img').forEach(function (img) {
    function swap() {
      if (!img.parentNode) { return; }
      var name = (img.getAttribute('alt') || '').trim();
      var avatar = document.createElement('span');
      avatar.className = 'person__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = name ? name.charAt(0).toUpperCase() : '?';
      img.parentNode.replaceChild(avatar, img);
    }
    img.addEventListener('error', swap, { once: true });
    if (img.complete && img.naturalWidth === 0) { swap(); }
  });

  /* ------------------------------------------------------------------
     7. Gallery - data, filtering and lightbox
     ------------------------------------------------------------------ */
  /* Base path of the college's original image library. */
  var UPLOADS = 'https://vinayakacollegeofnursing.com/wp-content/uploads/';

  /* Every image published on the old site's gallery page (292 images),
     grouped by the old site's own gallery filters. */
  var GALLERY = [
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.19-PM.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.19-PM-300x150.jpeg", w: 300, h: 150, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.19-PM-768x384.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.19-PM-1024x512.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.19 PM" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1-300x150.jpeg", w: 300, h: 150, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1-768x384.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1-1024x512.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (1)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-10.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-10-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-10-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-10-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (10)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-11.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-11-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-11-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-11-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (11)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-12.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-12-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-12-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-12-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (12)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-13.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-13-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-13-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-13-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (13)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-14.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-14-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-14-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-14-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (14)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-15.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-15-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-15-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-15-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (15)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-16.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-16-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-16-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-16-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (16)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-17.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-17-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-17-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-17-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (17)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-18.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-18-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-18-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-18-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (18)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-19.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-19-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-19-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-19-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (19)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-2.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-2-300x150.jpeg", w: 300, h: 150, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-2-768x384.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-2-1024x512.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (2)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-20.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-20-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-20-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-20-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (20)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-21.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-21-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-21-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-21-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (21)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-22.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-22-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-22-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-22-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (22)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-23.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-23-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-23-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-23-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (23)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-24.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-24-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-24-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-24-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (24)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-25.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-25-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-25-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-25-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (25)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-26.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-26-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-26-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-26-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (26)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-27.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-27-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-27-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-27-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (27)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-28.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-28-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-28-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-28-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (28)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-29.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-29-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-29-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-29-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (29)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-3.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-3-300x150.jpeg", w: 300, h: 150, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-3-768x384.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-3-1024x512.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (3)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-30.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-30-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-30-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-30-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (30)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-31.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-31-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-31-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-31-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (31)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-32.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-32-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-32-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-32-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (32)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-33.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-33-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-33-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-33-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (33)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-34.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-34-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-34-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-34-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (34)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-35.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-35-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-35-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-35-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (35)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-36.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-36-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-36-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-36-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (36)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-37.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-37-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-37-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-37-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (37)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-38.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-38-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-38-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-38-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (38)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-39.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-39-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-39-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-39-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (39)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-4.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-4-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-4-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-4-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (4)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-40.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-40-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-40-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-40-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (40)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-41.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-41-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-41-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-41-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (41)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-42.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-42-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-42-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-42-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (42)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-43.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-43-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-43-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-43-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (43)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-44.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-44-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-44-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-44-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (44)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-45.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-45-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-45-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-45-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (45)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-46.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-46-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-46-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-46-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (46)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-47.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-47-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-47-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-47-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (47)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-48.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-48-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-48-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-48-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (48)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-49.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-49-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-49-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-49-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (49)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-5.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-5-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-5-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-5-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (5)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-50.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-50-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-50-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-50-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (50)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-51.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-51-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-51-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-51-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (51)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-52.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-52-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-52-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-52-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (52)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-53.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-53-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-53-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-53-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (53)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-54.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-54-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-54-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-54-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (54)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-55.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-55-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-55-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-55-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (55)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-56.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-56-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-56-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-56-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (56)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-57.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-57-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-57-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-57-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (57)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-58.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-58-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-58-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-58-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (58)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-59.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-59-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-59-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-59-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (59)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-6.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-6-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-6-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-6-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (6)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-60.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-60-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-60-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-60-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (60)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-61.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-61-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-61-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-61-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (61)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-62.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-62-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-62-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-62-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (62)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-63.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-63-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-63-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-63-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (63)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-64.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-64-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-64-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-64-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (64)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-65.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-65-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-65-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-65-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (65)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-66.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-66-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-66-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-66-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (66)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-67.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-67-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-67-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-67-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (67)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-68.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-68-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-68-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-68-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (68)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-69.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-69-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-69-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-69-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (69)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-7.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-7-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-7-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-7-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (7)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-70.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-70-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-70-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-70-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (70)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-71.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-71-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-71-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-71-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (71)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-72.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-72-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-72-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-72-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (72)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-73.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-73-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-73-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-73-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (73)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-74.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-74-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-74-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-74-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (74)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-75.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-75-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-75-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-75-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (75)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-76.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-76-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-76-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-76-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (76)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-77.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-77-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-77-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-77-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (77)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-78.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-78-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-78-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-78-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (78)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-79.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-79-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-79-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-79-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (79)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-8.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-8-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-8-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-8-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (8)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-80.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-80-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-80-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-80-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (80)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-81.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-81-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-81-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-81-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (81)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-82.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-82-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-82-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-82-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (82)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-83.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-83-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-83-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-83-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (83)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-84.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-84-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-84-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-84-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (84)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-85.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-85-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-85-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-85-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (85)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-86.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-86-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-86-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-86-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (86)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-87.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-87-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-87-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-87-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (87)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-88.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-88-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-88-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-88-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (88)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-89.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-89-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-89-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-89-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (89)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-9.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-9-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-9-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-9-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (9)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-90.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-90-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-90-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-90-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (90)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-91.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-91-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-91-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-91-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (91)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-92.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-92-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-92-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-92-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (92)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-93.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-93-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-93-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-93-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (93)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-94.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-94-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-94-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-94-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (94)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-95.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-95-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-95-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-95-1024x682.jpeg", y: "2024-25", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (95)" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-300x150.jpeg", w: 300, h: 150, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-768x384.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-1024x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM" },
  { s: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-96.jpeg", th: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-96-300x200.jpeg", w: 300, h: 200, md: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-96-768x512.jpeg", lg: "2026/02/WhatsApp-Image-2026-02-09-at-12.38.20-PM-96-1024x682.jpeg", y: "2025-26", t: "WhatsApp Image 2026-02-09 at 12.38.20 PM (96)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.25-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.25-PM-300x150.jpeg", w: 300, h: 150, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.25-PM-768x384.jpeg", lg: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.25-PM-1024x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.25 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.35-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.35-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.35-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.35 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.36 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.36-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.36 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.37 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.37-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.37 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.38-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.38-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.38-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.38 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.39 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.39-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.39 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.40-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.40-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.40-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.40 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.41-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.41-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.41-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.41 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.42-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.42-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.42-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.42 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.43-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.43-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.43-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.43 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.44 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.44-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.44 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.45-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.45-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.45-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.45 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.46-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.46-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.46-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.46 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.47-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.47-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.47-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.47 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.48-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.48-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.48-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.48 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.49-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.49-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.49-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.49 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.50 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.50-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.50 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.51-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.51-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.51-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.51 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.54 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.54-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.54 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.55-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.55 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.57 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.57-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.57 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.58-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.58-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.58-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.58 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.54.59-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.54.59 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.01 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.01-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.01 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.02-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.02-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.02-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.02 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.03-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.03-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.03-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.03 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.04 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.04-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.04 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.05 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.05-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.05 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.06-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.06-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.06-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.06 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.07-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.07-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.07-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.07 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.08-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.08-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.08-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.08 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.09-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.09-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.09-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.09 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.10-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.10-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.10-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.10 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.15 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.15-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.15 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.16 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.16-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.16 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.17-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.17 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.18 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.18-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.18 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.19-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.19 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.20 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.20-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.20 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.25-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.25 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.26 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.26-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.26 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.27-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.27 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.28 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.28-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.28 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.29-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.29 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.30 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.30-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.30 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-1.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-1-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM (1)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-2.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.31-PM-2-768x512.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.31 PM (2)" },
  { s: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.32-PM.jpeg", th: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.32-PM-300x150.jpeg", w: 300, h: 150, md: "2026/06/WhatsApp-Image-2026-06-10-at-12.55.32-PM-768x384.jpeg", y: "2025-26", t: "WhatsApp Image 2026-06-10 at 12.55.32 PM" },
  { s: "2026/07/Printable-Tarot-Cards-Rider-Waite-Full-Deck_Page_01-1-scaled.jpg", th: "2026/07/Printable-Tarot-Cards-Rider-Waite-Full-Deck_Page_01-1-212x300.jpg", w: 212, h: 300, ow: 1809, y: "2026-27", t: "Printable-Tarot-Cards-Rider-Waite-Full-Deck_Page_01" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.06-PM-1-1-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.06 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-1-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-2-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-2-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-2-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-3.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-3-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-3-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.07-PM-3-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.07 PM (3)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.08-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.08-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.08-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.08-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.08 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1-768x512.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-1-1024x683.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-2-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-2-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-3.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-3-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-3-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.09-PM-3-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.09 PM (3)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.10-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.10-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.10-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.33.10-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.33.10 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.19-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.19-PM-200x300.jpeg", w: 200, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.19-PM-768x1152.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.19 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-1-300x300.jpeg", w: 300, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-1-768x768.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-1-1024x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-2-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-2-768x432.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.21-PM-2-1024x576.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.21 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-768x432.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1024x576.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.22 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1-768x432.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.22-PM-1-1024x576.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.22 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM-169x300.jpeg", w: 169, h: 300, ow: 720, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.23 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.23-PM-1-169x300.jpeg", w: 169, h: 300, ow: 719, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.23 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM-169x300.jpeg", w: 169, h: 300, ow: 719, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.24 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.24-PM-1-169x300.jpeg", w: 169, h: 300, ow: 719, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.24 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM-169x300.jpeg", w: 169, h: 300, ow: 720, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.25 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.25-PM-1-169x300.jpeg", w: 169, h: 300, ow: 720, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.25 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.26-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.26-PM-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.26-PM-768x432.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.26-PM-1024x576.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.26 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.28-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.28-PM-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.28-PM-768x432.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.28-PM-1024x576.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.28 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM-169x300.jpeg", w: 169, h: 300, ow: 720, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.29 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.29-PM-1-169x300.jpeg", w: 169, h: 300, ow: 720, y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.29 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.30-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.30-PM-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.30-PM-768x431.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.30-PM-1024x575.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.30 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.31-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.31-PM-300x169.jpeg", w: 300, h: 169, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.31-PM-768x431.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.31-PM-1024x575.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.31 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.32-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.32-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.32-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.32 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.33 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-1-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.33-PM-1-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.33 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.34 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-1-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.34-PM-1-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.34 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.36-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.36-PM-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.36-PM-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.36-PM-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.36 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.37-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.37-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.37-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.37 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-1-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-1-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-2-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.40-PM-2-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.40 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.41 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-1-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.41-PM-1-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.41 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.42 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-1-300x225.jpeg", w: 300, h: 225, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-1-768x576.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.42-PM-1-1024x768.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.42 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.43 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-1-240x300.jpeg", w: 240, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.43-PM-1-768x960.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.43 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.44 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-1-225x300.jpeg", w: 225, h: 300, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.44-PM-1-768x1024.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.44 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.45-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.45-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.45-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.45-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.45 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.46-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.46-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.46-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.46-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.46 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.47 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.47-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.47 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.48 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.48-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.48 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.49-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.49-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.49-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.49-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.49 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.51-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.51-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.51-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.51-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.51 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.52 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.52-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.52 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.53-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.53-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.53-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.53-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.53 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.54 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.54-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.54 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.55 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.55-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.55 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.56 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.56-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.56 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.36.59-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.36.59 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.00-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.00-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.00-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.00-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.00 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.03-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.03-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.03-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.03-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.03 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.04 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.04-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.04 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.07-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.07 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.08-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.08 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.09 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.09-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.09 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.10-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.10 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.11 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.11-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.11 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.13 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.13-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.13 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.14-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.14-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.14-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.14-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.14 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.15 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.15-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.15 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.17-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.17-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.17-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.17-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.17 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.18 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.18-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.18 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.23 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.23-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.23 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.24-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.24 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.25 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.25-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.25 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.26-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.26 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.27 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.27-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.27 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-2.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-2-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-2-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.28-PM-2-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.28 PM (2)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.29 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.29-PM-1-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.29 PM (1)" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.30-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.30-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.30-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.30-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.30 PM" },
  { s: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.33-PM.jpeg", th: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.33-PM-300x200.jpeg", w: 300, h: 200, md: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.33-PM-768x511.jpeg", lg: "2026/07/WhatsApp-Image-2026-07-30-at-1.37.33-PM-1024x682.jpeg", y: "2026-27", t: "WhatsApp Image 2026-07-30 at 1.37.33 PM" }
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
        src: UPLOADS + item.s,        /* original: lightbox only */
        thumb: UPLOADS + item.th,     /* 300w: 1x grid tile */
        md: item.md ? UPLOADS + item.md : null,    /* 768w: 2x grid tile */
        lg: item.lg ? UPLOADS + item.lg : null,    /* 1024w: 3x grid tile */
        ow: item.ow || 0,             /* original width, where no 768w exists */
        w: item.w,
        h: item.h,
        year: item.y,
        title: labelFor(item, i)
      });
    });
    if (limit > 0) { galleryItems = galleryItems.slice(0, limit); }

    /* ----------------------------------------------------------------
       Tile rendering.

       Grid tiles offer three widths, so the browser always picks the
       smallest file that is still at least twice the CSS width:
         300w  - 1x screens
         768w  - 2x screens (the common retina case)
         1024w - 3x screens, where the host has that size
       The original photograph is never used in the grid; the lightbox
       loads it on demand at full resolution.
       ---------------------------------------------------------------- */
    /* Rendered width of a tile at every breakpoint. The gallery page keeps
       two columns on phones; the home preview is a one-per-view carousel. */
    var TILE_COLS_GALLERY = [
      ['(max-width: 720px)', 45, 'vw'],
      ['(max-width: 1080px)', 31, 'vw'],
      ['', 268, 'px']
    ];
    var TILE_COLS_PREVIEW = [
      ['(max-width: 767px)', 82, 'vw'],
      ['(max-width: 1080px)', 31, 'vw'],
      ['', 268, 'px']
    ];

    /* A tile is a 4:3 box and every photograph is cropped to fill it. A wide
       photograph is therefore drawn wider than the box, so `sizes` has to
       describe the drawn width - otherwise the browser picks a file that is
       too small and the cover crop softens it. */
    function tileSizes(item, preview) {
      var cols = preview ? TILE_COLS_PREVIEW : TILE_COLS_GALLERY;
      var drawn = Math.max(1, 0.75 * (item.w / item.h));
      return cols.map(function (c) {
        /* rounded down to 10px: a sub-1% crop shortfall should not push a
           1x screen from the 20 KB thumbnail onto a 100 KB 768px file */
        var v = c[2] === 'px' ? Math.floor(c[1] * drawn / 10) * 10
                              : Math.floor(c[1] * drawn);
        return (c[0] ? c[0] + ' ' : '') + v + c[2];
      }).join(', ');
    }

    function candidates(item) {
      /* [url, true pixel width] from smallest to largest.
         The 300px "medium" is capped on its long edge, so a portrait thumb
         is only 225-240px wide - the descriptor must use the real width or
         the browser will upscale it. */
      var list = [[item.thumb, item.w]];
      if (item.md) { list.push([item.md, 768]); }
      if (item.lg) { list.push([item.lg, 1024]); }
      if (!item.md && item.ow) { list.push([item.src, item.ow]); }
      return list;
    }

    function makeTile(item, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item';
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('data-year', item.year);
      btn.setAttribute('aria-label', 'Enlarge image: ' + item.title);

      var cands = candidates(item);
      var img = document.createElement('img');
      img.alt = item.title;
      /* srcset and sizes first; src is only the no-srcset fallback. */
      img.srcset = cands.map(function (c) { return c[0] + ' ' + c[1] + 'w'; }).join(', ');
      img.sizes = tileSizes(item, limit > 0);
      img.src = item.md || item.thumb;
      img.width = item.w;
      img.height = item.h;
      img.loading = 'lazy';
      img.decoding = 'async';
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

    var PAGE_SIZE = 12;
    var perPage = limit > 0 ? Math.max(1, limit) : PAGE_SIZE;
    var isPaged = limit === 0;
    var tileEls = [];
    var activeYear = 'all';
    var filtered = [];
    var currentPage = 1;
    var pagerEl = null;

    function computeFiltered(year) {
      if (year === 'all') {
        return galleryItems.map(function (_, i) { return i; });
      }
      var out = [];
      galleryItems.forEach(function (item, i) {
        if (item.year === year) { out.push(i); }
      });
      return out;
    }

    function totalPages() {
      return Math.max(1, Math.ceil(filtered.length / perPage));
    }

    function clampPage(n) {
      n = parseInt(n, 10);
      if (!isFinite(n) || n < 1) { return 1; }
      return Math.min(n, totalPages());
    }

    function updateCount() {
      var live = $('#galleryCount');
      if (!live) { return; }
      var total = filtered.length;
      live.textContent = total + ' image' + (total === 1 ? '' : 's') +
        (activeYear === 'all' ? ' in the gallery' : ' in ' + activeYear);
    }

    function pageSequence() {
      var total = totalPages();
      var i;
      if (total <= 7) {
        var all = [];
        for (i = 1; i <= total; i++) { all.push(i); }
        return all;
      }
      var keep = {};
      keep[1] = true;
      keep[total] = true;
      for (i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i >= 1 && i <= total) { keep[i] = true; }
      }
      var nums = Object.keys(keep).map(Number).sort(function (a, b) { return a - b; });
      var out = [];
      for (i = 0; i < nums.length; i++) {
        if (i > 0 && nums[i] - nums[i - 1] > 1) { out.push(0); }
        out.push(nums[i]);
      }
      return out;
    }

    function renderPager() {
      if (!pagerEl) { return; }
      var total = totalPages();
      pagerEl.innerHTML = '';

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'pager__btn pager__prev';
      prev.setAttribute('aria-label', 'Previous page');
      prev.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
      prev.disabled = currentPage <= 1;
      prev.addEventListener('click', function () { goToPage(currentPage - 1, true); });
      pagerEl.appendChild(prev);

      pageSequence().forEach(function (n) {
        if (n === 0) {
          var gap = document.createElement('span');
          gap.className = 'pager__gap';
          gap.setAttribute('aria-hidden', 'true');
          gap.textContent = '\u2026';
          pagerEl.appendChild(gap);
        } else {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pager__page';
          btn.textContent = String(n);
          if (n === currentPage) { btn.setAttribute('aria-current', 'page'); }
          btn.addEventListener('click', function () { goToPage(n, true); });
          pagerEl.appendChild(btn);
        }
      });

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'pager__btn pager__next';
      next.setAttribute('aria-label', 'Next page');
      next.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
      next.disabled = currentPage >= total;
      next.addEventListener('click', function () { goToPage(currentPage + 1, true); });
      pagerEl.appendChild(next);
    }

    function setUrl(mode) {
      if (!isPaged || !window.history || !window.history.pushState) { return; }
      var url = new URL(window.location.href);
      if (currentPage > 1) { url.searchParams.set('page', String(currentPage)); }
      else { url.searchParams.delete('page'); }
      var state = { page: currentPage };
      if (mode === 'push') { window.history.pushState(state, '', url.toString()); }
      else { window.history.replaceState(state, '', url.toString()); }
    }

    function scrollToGrid() {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var header = document.getElementById('siteHeader');
      var offset = (header ? header.offsetHeight : 0) + 16;
      var top = window.pageYOffset + galleryEl.getBoundingClientRect().top - offset;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }

    function renderPage() {
      var start = (currentPage - 1) * perPage;
      var end = Math.min(start + perPage, filtered.length);
      var frag = document.createDocumentFragment();
      galleryEl.innerHTML = '';
      for (var k = start; k < end; k++) {
        var gi = filtered[k];
        frag.appendChild(makeTile(galleryItems[gi], gi));
      }
      galleryEl.appendChild(frag);
      tileEls = $$('.gallery-item', galleryEl);
      revealAll(tileEls);
      updateCount();
      renderPager();
    }

    function goToPage(n, scroll) {
      var target = clampPage(n);
      currentPage = target;
      renderPage();
      setUrl('push');
      if (scroll) { scrollToGrid(); }
    }

    function readPageFromUrl() {
      if (!isPaged) { return 1; }
      var match = /[?&]page=(\d+)/.exec(window.location.search);
      if (!match) { return 1; }
      var n = parseInt(match[1], 10);
      if (!isFinite(n) || n < 1 || n > totalPages()) { return 1; }
      return n;
    }

    if (isPaged) {
      pagerEl = document.createElement('nav');
      pagerEl.className = 'pager';
      pagerEl.setAttribute('aria-label', 'Gallery pages');
      galleryEl.parentNode.insertBefore(pagerEl, galleryEl.nextSibling);
    }

    filtered = computeFiltered(activeYear);
    currentPage = readPageFromUrl();
    renderPage();
    setUrl('replace');

    if (isPaged) {
      window.addEventListener('popstate', function () {
        currentPage = readPageFromUrl();
        renderPage();
      });
    }

    /* Filtering */
    filterEls.forEach(function (btn) {
      if (!yearFilter) { return; }
      btn.addEventListener('click', function () {
        filterEls.forEach(function (other) { other.setAttribute('aria-pressed', String(other === btn)); });
        activeYear = btn.getAttribute('data-filter');
        filtered = computeFiltered(activeYear);
        currentPage = 1;
        renderPage();
        setUrl('replace');
      });
    });

    /* Lightbox */
    var lightbox  = $('#lightbox');
    var lbImg     = $('#lightboxImg');
    var lbCaption = $('#lightboxCaption');
    var lbCount   = $('#lightboxCount');
    var lastFocus = null;
    var currentPos = 0;

    function show(pos) {
      if (!filtered.length) { return; }
      currentPos = (pos + filtered.length) % filtered.length;
      var item = galleryItems[filtered[currentPos]];
      lbImg.width = item.w;
      lbImg.height = item.h;
      lbImg.src = item.src;
      lbImg.alt = item.title;
      lbCaption.textContent = item.title;
      lbCount.textContent = (currentPos + 1) + ' / ' + filtered.length;
    }

    function openLightbox(tile) {
      lastFocus = document.activeElement;
      var gi = parseInt(tile.getAttribute('data-index'), 10);
      var pos = filtered.indexOf(gi);
      lightbox.classList.add('is-open');
      document.body.classList.add('nav-open');
      show(pos < 0 ? 0 : pos);
      var closeBtn = $('.lightbox__close', lightbox);
      if (closeBtn) { closeBtn.focus(); }
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      if (isPaged) {
        var pageOfCurrent = Math.floor(currentPos / perPage) + 1;
        if (pageOfCurrent !== currentPage) {
          currentPage = clampPage(pageOfCurrent);
          renderPage();
          setUrl('replace');
        }
      }
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }

    galleryEl.addEventListener('click', function (e) {
      var tile = e.target.closest('.gallery-item');
      if (tile) { openLightbox(tile); }
    });

    if (lightbox) {
      $('.lightbox__close', lightbox).addEventListener('click', closeLightbox);
      $('.lightbox__prev', lightbox).addEventListener('click', function () { show(currentPos - 1); });
      $('.lightbox__next', lightbox).addEventListener('click', function () { show(currentPos + 1); });
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) { closeLightbox(); }
      });

      /* Swipe support on touch devices */
      var startX = null;
      lightbox.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      lightbox.addEventListener('touchend', function (e) {
        if (startX === null) { return; }
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) { show(dx < 0 ? currentPos + 1 : currentPos - 1); }
        startX = null;
      }, { passive: true });

      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('is-open')) { return; }
        if (e.key === 'Escape') { closeLightbox(); }
        if (e.key === 'ArrowRight') { show(currentPos + 1); }
        if (e.key === 'ArrowLeft') { show(currentPos - 1); }
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
     9. Mobile swipe carousels

     The scrolling itself is pure CSS scroll-snap. This only adds the
     pagination dots, the prev/next buttons and keyboard support, and it
     only runs below 768px - tablet and desktop keep the plain grid.
     ------------------------------------------------------------------ */
  var MOBILE = '(max-width: 767px)';
  var mobileMedia = window.matchMedia(MOBILE);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function buildCarousel(track) {
    var label = track.getAttribute('data-carousel-label') || 'items';
    var children = $$(':scope > *', track);
    if (children.length < 2) { return null; }

    var controls = document.createElement('div');
    controls.className = 'carousel__controls';

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel__arrow carousel__arrow--prev';
    prev.setAttribute('aria-label', 'Previous ' + label);
    prev.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

    var dots = document.createElement('div');
    dots.className = 'carousel__dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', label + ' pagination');

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel__arrow carousel__arrow--next';
    next.setAttribute('aria-label', 'Next ' + label);
    next.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

    /* keep long rows of dots on a single line inside the available width */
    var compact = children.length > 10;
    dots.style.setProperty('--carousel-dot',
      (children.length <= 5 ? 26 : children.length <= 10 ? 20 : 14) + 'px');
    if (compact) { dots.classList.add('carousel__dots--compact'); }

    var dotEls = children.map(function (child, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', 'Go to ' + label + ' ' + (i + 1) + ' of ' + children.length);
      dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () { goTo(i); });
      dots.appendChild(dot);
      return dot;
    });

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);
    track.parentNode.insertBefore(controls, track.nextSibling);

    function gap() {
      var g = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap);
      return isNaN(g) ? 0 : g;
    }
    function step() { return children[0].getBoundingClientRect().width + gap(); }
    function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }

    function goTo(i) {
      var x = Math.min(i * step(), maxScroll());
      track.scrollTo({ left: x, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    function sync() {
      var i = Math.round(track.scrollLeft / step());
      i = Math.max(0, Math.min(i, children.length - 1));
      dotEls.forEach(function (dot, d) {
        dot.setAttribute('aria-current', d === i ? 'true' : 'false');
      });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll() - 2;
    }

    var queued = false;
    track.addEventListener('scroll', function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; sync(); });
    }, { passive: true });

    prev.addEventListener('click', function () { goTo(Math.max(0, Math.round(track.scrollLeft / step()) - 1)); });
    next.addEventListener('click', function () { goTo(Math.round(track.scrollLeft / step()) + 1); });

    track.addEventListener('keydown', function (e) {
      if (!mobileMedia.matches) { return; }
      var i = Math.round(track.scrollLeft / step());
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(children.length - 1); }
    });

    function applyMode() {
      if (mobileMedia.matches) {
        track.setAttribute('tabindex', '0');
        track.setAttribute('role', 'group');
        track.setAttribute('aria-roledescription', 'carousel');
        track.setAttribute('aria-label', label);
        controls.hidden = false;
      } else {
        track.removeAttribute('tabindex');
        track.removeAttribute('role');
        track.removeAttribute('aria-roledescription');
        track.removeAttribute('aria-label');
        controls.hidden = true;
      }
    }

    applyMode();
    if (mobileMedia.addEventListener) { mobileMedia.addEventListener('change', applyMode); }
    else if (mobileMedia.addListener) { mobileMedia.addListener(applyMode); }
    window.addEventListener('resize', sync, { passive: true });
    sync();

    return { applyMode: applyMode };
  }

  $$('[data-carousel]').forEach(buildCarousel);

  var heroEl = document.getElementById('hero');
  var heroMount = document.getElementById('heroVideo');
  var heroFile = document.getElementById('heroVideoFile');
  var heroFallback = document.getElementById('heroFallback');
  var heroWrap = document.querySelector('.hero__video');
  var heroInView = true;
  var heroMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var heroPlayer = null;
  var heroStage = null;
  var heroPlaying = false;
  var HERO_END = 40;

  function setHeroOffset() {
    var total = heroEl ? heroEl.offsetTop : 0;
    if (!total) {
      var bar = document.querySelector('.topbar');
      var head = document.getElementById('siteHeader');
      total = (bar ? bar.offsetHeight : 0) + (head ? head.offsetHeight : 0);
    }
    if (total > 0) {
      document.documentElement.style.setProperty('--hero-offset', total + 'px');
    }
  }
  setHeroOffset();
  window.addEventListener('load', setHeroOffset);
  window.addEventListener('resize', setHeroOffset, { passive: true });

  function heroRevealVideo() {
    if (heroFallback) { heroFallback.classList.add('is-hidden'); }
  }

  function heroPlayback() {
    if (heroStage === 'yt' && heroPlayer && heroPlayer.playVideo) {
      if (document.hidden || !heroInView) { heroPlayer.pauseVideo(); }
      else { heroPlayer.playVideo(); }
      return;
    }
    if (heroStage === 'file' && heroFile) {
      if (document.hidden || !heroInView) { heroFile.pause(); }
      else {
        var attempt = heroFile.play();
        if (attempt && attempt.catch) { attempt.catch(function () {}); }
      }
    }
  }

  if (heroEl) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroInView = entries[0].isIntersecting;
        heroPlayback();
      }, { threshold: 0.15 }).observe(heroEl);
    }
    document.addEventListener('visibilitychange', heroPlayback);
  }

  setInterval(function () {
    if (heroStage === 'yt' && heroPlayer && heroPlayer.getCurrentTime) {
      var now = 0;
      try { now = heroPlayer.getCurrentTime(); } catch (err) { return; }
      if (now >= HERO_END) { try { heroPlayer.seekTo(0, true); } catch (err) {} }
      return;
    }
    if (heroStage === 'file' && heroFile && heroFile.readyState > 0) {
      if (heroFile.currentTime >= HERO_END) { heroFile.currentTime = 0; }
    }
  }, 250);

  function heroUseFile() {
    if (heroStage === 'file') { return; }
    heroStage = 'file';
    if (heroPlayer && heroPlayer.destroy) {
      try { heroPlayer.destroy(); } catch (err) {}
    }
    heroPlayer = null;
    if (heroMount && heroMount.parentNode) { heroMount.parentNode.removeChild(heroMount); }
    if (heroWrap) { heroWrap.classList.add('is-video-file'); }
    if (!heroFile) { return; }
    heroFile.src = 'assets/hero.mp4';
    heroFile.addEventListener('playing', heroRevealVideo, { once: true });
    heroFile.addEventListener('ended', function () {
      heroFile.currentTime = 0;
      var again = heroFile.play();
      if (again && again.catch) { again.catch(function () {}); }
    });
    var attempt = heroFile.play();
    if (attempt && attempt.catch) { attempt.catch(function () {}); }
  }

  function heroStartVideo() {
    if (!heroEl || heroMotion.matches) { return; }

    if (window.location.protocol === 'file:') { heroUseFile(); return; }

    window.onYouTubeIframeAPIReady = function () {
      heroPlayer = new window.YT.Player(heroMount, {
        videoId: 'tHa6NiU_EL8',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: function (event) {
            heroStage = 'yt';
            try { event.target.mute(); event.target.playVideo(); } catch (err) {}
          },
          onStateChange: function (event) {
            if (event.data === 1) { heroPlaying = true; heroRevealVideo(); }
            else if (event.data === 2 || event.data === 0) { heroPlaying = false; }
          }
        }
      });
    };

    var api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    api.async = true;
    document.head.appendChild(api);

    setTimeout(function () {
      if (heroPlaying) { return; }
      if (heroPlayer && heroPlayer.playVideo) {
        try { heroPlayer.playVideo(); } catch (err) {}
      }
    }, 3000);
  }

  if (document.readyState === 'complete') { heroStartVideo(); }
  else { window.addEventListener('load', heroStartVideo, { once: true }); }

  /* ------------------------------------------------------------------
     10. Current year in the footer
     ------------------------------------------------------------------ */
  $$('[data-current-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
