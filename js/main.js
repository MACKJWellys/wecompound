// WeCompound — main.js

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
});

/* ========== PRELOADER — Compounding Spheres ========== */
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) { initApp(); return; }

  // Start Vanta BEHIND the preloader immediately so there's no flash on dismiss
  window.addEventListener('load', () => {
    initVanta();
    runPreloaderAnimation(preloader);
  });
}

function runPreloaderAnimation(preloader) {
  const canvas = preloader.querySelector('.preloader__canvas');
  if (!canvas) { dismissPreloader(preloader); return; }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = 280;
  const H = 160;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const GREEN = '#22c55e';
  const WHITE = '#f7f8f8';
  const cx = W / 2;
  const cy = H / 2;

  // Spheres
  const greenBall  = { x: -30, y: cy, r: 14, color: GREEN, opacity: 1 };
  const whiteBall  = { x: cx + 10, y: cy, r: 18, color: WHITE, opacity: 1 };
  const children   = [
    { x: cx + 10, y: cy, r: 8, color: WHITE, opacity: 0, tx: cx - 36, ty: cy - 28 },
    { x: cx + 10, y: cy, r: 8, color: WHITE, opacity: 0, tx: cx + 56, ty: cy - 20 },
    { x: cx + 10, y: cy, r: 8, color: WHITE, opacity: 0, tx: cx + 10, ty: cy + 32 },
  ];

  // Timing (ms)
  const T_GLIDE     = 600;   // green glides in
  const T_IMPACT    = 100;   // squeeze frame
  const T_SPLIT     = 500;   // children fly out
  const T_HOLD      = 400;   // hold the result
  const T_TOTAL     = T_GLIDE + T_IMPACT + T_SPLIT + T_HOLD;

  const start = performance.now();
  let done = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  function drawBall(b) {
    if (b.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = b.opacity;

    // Radial gradient for 3D sphere look
    const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
    grad.addColorStop(0, b.color === GREEN ? '#4ade80' : '#ffffff');
    grad.addColorStop(0.7, b.color);
    grad.addColorStop(1, b.color === GREEN ? '#16a34a' : '#a1a1aa');

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (done) return;
    const elapsed = now - start;
    ctx.clearRect(0, 0, W, H);

    if (elapsed < T_GLIDE) {
      // Phase 1: Green glides to center
      const t = easeOutCubic(elapsed / T_GLIDE);
      greenBall.x = -30 + (cx - 12 - (-30)) * t;
      whiteBall.opacity = 1;
      drawBall(whiteBall);
      drawBall(greenBall);

    } else if (elapsed < T_GLIDE + T_IMPACT) {
      // Phase 2: Impact — squeeze the white ball
      const t = (elapsed - T_GLIDE) / T_IMPACT;
      greenBall.x = cx - 12;
      whiteBall.r = 18 - 4 * Math.sin(t * Math.PI);
      drawBall(whiteBall);
      drawBall(greenBall);

    } else if (elapsed < T_GLIDE + T_IMPACT + T_SPLIT) {
      // Phase 3: White ball splits into 3 children
      const t = easeOutBack(Math.min(1, (elapsed - T_GLIDE - T_IMPACT) / T_SPLIT));
      whiteBall.opacity = Math.max(0, 1 - t * 3); // fast fade
      if (whiteBall.opacity > 0) drawBall(whiteBall);
      greenBall.x = cx - 12;
      drawBall(greenBall);

      children.forEach(c => {
        c.opacity = Math.min(1, t * 2);
        c.x = (cx + 10) + (c.tx - (cx + 10)) * t;
        c.y = cy + (c.ty - cy) * t;
        drawBall(c);
      });

    } else {
      // Phase 4: Hold
      greenBall.x = cx - 12;
      drawBall(greenBall);
      children.forEach(c => {
        c.opacity = 1;
        c.x = c.tx;
        c.y = c.ty;
        drawBall(c);
      });
    }

    if (elapsed >= T_TOTAL) {
      done = true;
      // Fade in wordmark, then dismiss
      const wordmark = preloader.querySelector('.preloader__wordmark');
      if (wordmark) {
        wordmark.style.transition = 'opacity 0.4s ease';
        wordmark.style.opacity = '1';
      }
      setTimeout(() => dismissPreloader(preloader), 600);
      return;
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function dismissPreloader(preloader) {
  preloader.classList.add('is-done');
  preloader.addEventListener('transitionend', () => {
    preloader.remove();
    initApp();
  }, { once: true });
  // Fallback if transitionend doesn't fire
  setTimeout(() => { if (document.contains(preloader)) { preloader.remove(); initApp(); } }, 800);
}

function initApp() {
  initLenis();
  initGSAP();
  // Vanta already initialized in preloader phase — skip if already running
  if (!window.__vantaEffect) initVanta();
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
