// WeCompound — main.js

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

/* ========== PRELOADER ========== */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) { initApp(); return; }

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('is-done');
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
        initApp();
      }, { once: true });
    }, 1500);
  });
}

function initApp() {
  initLenis();
  initGSAP();
  initVanta();
  initBarba();
  initMobileMenu();
  initStickyCta();
  initCountUp();
  initProjectPanels();
  initDynamicYear();
  initScrollToTop();
}

/* ========== LENIS SMOOTH SCROLL ========== */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  window.__lenis = lenis;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* ========== GSAP SCROLL ANIMATIONS ========== */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero word-by-word reveal (home page only)
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    const words = text.split(' ');
    heroTitle.innerHTML = words.map(w => '<span class="word" style="display:inline-block">' + w + '</span>').join(' ');

    gsap.from('.hero__title .word', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power2.out',
      delay: 0.2,
    });

    gsap.from('.hero .eyebrow', {
      opacity: 0,
      y: 15,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0,
    });

    gsap.from('.hero__sub, .hero__actions', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.8,
    });
  }

  // Page hero fade-in (non-home pages: services, work, contact)
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    gsap.from('.page-hero .eyebrow, .page-hero__title, .page-hero__sub', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.1,
    });
  }

  // Section entrance animations
  const sections = document.querySelectorAll(
    '.services-overview, .stats-strip, .featured-work, .cta-banner, .service-detail, .contact-section, .portfolio-section'
  );

  sections.forEach(section => {
    const children = section.querySelectorAll('.container > *, .service-detail__inner > *, .contact-grid > *, .cta-banner__inner > *');
    if (children.length === 0) return;

    gsap.from(children, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
    });
  });

  // Card stagger animations
  const cardGroups = document.querySelectorAll('.bento-grid, .work-grid, .project-grid');
  cardGroups.forEach(group => {
    const cards = group.children;
    gsap.from(cards, {
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 30,
      scale: 0.97,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
    });
  });
}

/* ========== VANTA.JS HERO BACKGROUND ========== */
function initVanta() {
  if (typeof VANTA === 'undefined') return;
  const el = document.getElementById('vanta-bg');
  if (!el) return;

  // Destroy existing instance if re-initializing after Barba transition
  if (window.__vantaEffect) {
    window.__vantaEffect.destroy();
  }

  window.__vantaEffect = VANTA.NET({
    el: el,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x22c55e,
    backgroundColor: 0x010102,
    points: 8.00,
    maxDistance: 22.00,
    spacing: 18.00,
    showDots: true,
  });
}

/* ========== BARBA.JS PAGE TRANSITIONS ========== */
function initBarba() {
  if (typeof barba === 'undefined') return;

  // Create progress bar if it doesn't exist
  if (!document.querySelector('.barba-progress')) {
    const progressBar = document.createElement('div');
    progressBar.className = 'barba-progress';
    progressBar.innerHTML = '<div class="barba-progress__bar"></div>';
    document.body.appendChild(progressBar);
  }

  barba.init({
    preventRunning: true,
    transitions: [{
      name: 'fade',
      leave(data) {
        const bar = document.querySelector('.barba-progress__bar');
        if (bar && typeof gsap !== 'undefined') {
          gsap.to(bar, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
        }
        return new Promise(resolve => {
          if (typeof gsap !== 'undefined') {
            gsap.to(data.current.container, {
              opacity: 0,
              duration: 0.3,
              ease: 'power2.inOut',
              onComplete: resolve,
            });
          } else {
            resolve();
          }
        });
      },
      enter(data) {
        const bar = document.querySelector('.barba-progress__bar');

        // Reset scroll
        window.scrollTo(0, 0);
        if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });

        return new Promise(resolve => {
          if (typeof gsap !== 'undefined') {
            gsap.from(data.next.container, {
              opacity: 0,
              duration: 0.3,
              ease: 'power2.inOut',
              onComplete: () => {
                if (bar) gsap.to(bar, { scaleX: 0, duration: 0.2, ease: 'power2.in' });
                resolve();
              },
            });
          } else {
            resolve();
          }
        });
      },
      after() {
        // Kill old ScrollTriggers and re-init everything
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.getAll().forEach(t => t.kill());
        }
        initGSAP();
        initVanta();
        initCountUp();
        initProjectPanels();
        initStickyCta();
        initDynamicYear();
        initScrollToTop();
        updateActiveNav();
      }
    }]
  });
}

function updateActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    link.classList.remove('nav__link--active');
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
}

/* ========== MOBILE MENU ========== */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const menu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu__overlay');
  const closeBtn = document.querySelector('.mobile-menu__close');
  if (!hamburger || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Stagger link animation
    const links = menu.querySelectorAll('.mobile-menu__link');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(links,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
      );
    }
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ========== STICKY MOBILE CTA ========== */
function initStickyCta() {
  const stickyCta = document.querySelector('.sticky-cta');
  const hero = document.querySelector('.hero, .page-hero');
  if (!stickyCta || !hero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        stickyCta.classList.add('is-visible');
      } else {
        stickyCta.classList.remove('is-visible');
      }
    });
  }, { threshold: 0 });

  observer.observe(hero);
}

/* ========== COUNT-UP ANIMATION ========== */
function initCountUp() {
  const counters = document.querySelectorAll('.stat__number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ========== PROJECT PANELS (Work page) ========== */
function initProjectPanels() {
  const cards = document.querySelectorAll('.project-card[data-project]');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.dataset.project;
      const panel = document.getElementById(projectId + '-panel');
      if (!panel) return;

      // Close any other open panel
      document.querySelectorAll('.project-panel.is-open').forEach(p => {
        if (p !== panel) p.classList.remove('is-open');
      });

      // Toggle this panel
      panel.classList.toggle('is-open');

      // Scroll into view if opening
      if (panel.classList.contains('is-open')) {
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });

  // Close buttons inside panels
  document.querySelectorAll('.project-panel__close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.closest('.project-panel').classList.remove('is-open');
    });
  });
}

/* ========== DYNAMIC YEAR ========== */
function initDynamicYear() {
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ========== SCROLL TO TOP ========== */
function initScrollToTop() {
  // Don't create duplicate buttons
  if (document.querySelector('.scroll-top')) return;

  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 16V4M4 10l6-6 6 6"/></svg>';
  document.body.appendChild(btn);

  const hero = document.querySelector('.hero, .page-hero');
  if (hero) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        btn.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(hero);
  }

  btn.addEventListener('click', () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
