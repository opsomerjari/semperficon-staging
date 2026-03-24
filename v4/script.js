(function () {
  "use strict";

  function initYear() {
    var yearEl = document.getElementById("copy-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initHeaderState() {
    var header = document.getElementById("site-header");
    if (!header) {
      return;
    }

    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initNavigation() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("nav-links");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (item) {
      item.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initActiveLink() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(function (link) {
      var href = link.getAttribute("href");
      link.classList.toggle("active", href === page);
    });
  }

  function initReveal() {
    var revealEls = document.querySelectorAll("[data-reveal]");
    if (!revealEls.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) {
      return;
    }

    function animateCount(el, target) {
      var duration = 1200;
      var start = 0;
      var startTime = performance.now();

      function update(now) {
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(start + (target - start) * eased);
        el.textContent = String(value);
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (counter) {
        counter.textContent = counter.getAttribute("data-counter") || "0";
      });
      return;
    }

    var started = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            counters.forEach(function (counter) {
              var target = Number(counter.getAttribute("data-counter") || 0);
              animateCount(counter, target);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(counters[0]);
  }

  initYear();
  initHeaderState();
  initNavigation();
  initActiveLink();
  initReveal();
  initCounters();
})();

