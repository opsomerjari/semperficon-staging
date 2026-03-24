/* ============================================================
   SEMPERFICON — script.js
   Vanilla JavaScript — shared across all pages
   ============================================================ */

'use strict';

/* =====================
   UTILITIES
===================== */

/**
 * Safely query a single element; returns null if not found.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Safely query all elements; returns empty NodeList if none found.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
function qsa(selector, context = document) {
  return context.querySelectorAll(selector);
}


/* ============================================================
   STICKY HEADER
   ============================================================ */
(function initHeader() {
  const header = qs('#siteHeader');
  if (!header) return;

  const SCROLL_THRESHOLD = 70;

  function updateHeader() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // run on page load
})();


/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */
(function initMobileNav() {
  const hamburger = qs('#hamburger');
  const navMenu   = qs('#navMenu');
  if (!hamburger || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a link is tapped
  qsa('.nav__link, .nav__menu .btn', navMenu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click / tap
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();


/* ============================================================
   ACTIVE NAV LINK
   Highlights the link that matches the current page URL.
   ============================================================ */
(function setActiveNavLink() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  qsa('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const hrefFile = href.split('/').pop().split('#')[0];

    if (hrefFile === currentFile || (currentFile === '' && hrefFile === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
})();


/* ============================================================
   SCROLL ANIMATIONS  (IntersectionObserver fade-up)
   ============================================================ */
(function initScrollAnimations() {
  const elements = qsa('.fade-up');
  if (!elements.length) return;

  // Skip animation if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));

  // Hero elements animate on load without waiting for scroll
  const heroElements = qsa('.hero .fade-up');
  if (heroElements.length) {
    window.addEventListener('load', () => {
      heroElements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('is-visible');
        }, 120 + i * 140);
      });
    });
  }
})();


/* ============================================================
   STATS COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const statsSection = qs('#stats');
  if (!statsSection) return;

  // Skip if reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let hasRun = false;

  /**
   * Animate a single counter element from 0 to its data-target value.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target; // ensure exact final value
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasRun) {
      hasRun = true;
      qsa('.stat-item__num[data-target]', statsSection).forEach(animateCounter);
      observer.unobserve(statsSection);
    }
  }, { threshold: 0.3 });

  observer.observe(statsSection);
})();


/* ============================================================
   PARALLAX — Hero background subtle drift on scroll
   ============================================================ */
(function initHeroParallax() {
  const heroBg = qs('.hero__bg');
  if (!heroBg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Skip on mobile for performance
  if (window.innerWidth < 768) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.28}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   SMOOTH ANCHOR SCROLL
   Handles links like href="#section" within the same page.
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = qs('#siteHeader')?.offsetHeight ?? 70;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
})();
