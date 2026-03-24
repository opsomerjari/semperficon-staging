/**
 * SEMPERFICON CONSTRUCTION — script.js
 * Handles: navigation, scroll effects, reveal animations, stats counter
 */

(function () {
  'use strict';

  /* ── FOOTER YEAR ─────────────────────────────────────── */
  const yearEl = document.getElementById('copy-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── MOBILE NAVIGATION ───────────────────────────────── */
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('nav-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── STICKY HEADER ───────────────────────────────────── */
  const header = document.getElementById('site-header');

  function handleScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  /* ── SCROLL REVEAL (IntersectionObserver) ────────────── */
  const revealClasses = [
    '.fade-in-up',
    '.fade-in',
    '.reveal-up',
    '.reveal-left',
    '.reveal-right',
  ];

  const revealEls = document.querySelectorAll(revealClasses.join(', '));

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── STATS COUNTER ANIMATION ─────────────────────────── */
  const statNums  = document.querySelectorAll('.stat-num');
  const statsBar  = document.querySelector('.stats-bar');
  let countStarted = false;

  function animateCount(el, target, duration) {
    const startTime = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (statsBar && statNums.length && 'IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countStarted) {
          countStarted = true;
          statNums.forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            if (!isNaN(target)) animateCount(el, target, 1800);
          });
          statsObs.disconnect();
        }
      });
    }, { threshold: 0.4 });

    statsObs.observe(statsBar);
  } else {
    // Fallback: set values immediately
    statNums.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) el.textContent = target;
    });
  }

  /* ── SUBTLE HERO PARALLAX ────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg-img');

  if (heroBg && window.innerWidth > 860) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ── ACTIVE NAV LINK (per page) ──────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) {
      link.classList.add('active');
    } else if (currentPage === '' && href === 'index.html') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

})();