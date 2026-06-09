/* ═══════════════════════════════════════════════════════════════
   PADEL TENİSİ REHBERİ — script.js
   Vanilla JS | Tooltip · Accordion · Animations · Navbar
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. Navbar: scroll effect & mobile toggle ──────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  // Scroll effect
  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close nav on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ─── 2. Court Tooltips: hover & click/touch ────────────────── */
(function initTooltips() {
  const hotspots = document.querySelectorAll('[data-hotspot]');
  const overlay  = document.getElementById('tooltipOverlay');
  let activeHotspot = null;

  // Wrap tooltip body content in inner div if not already (for accordion-style padding)
  document.querySelectorAll('.fault-body').forEach(body => {
    if (!body.querySelector('.fault-body-inner')) {
      const inner = document.createElement('div');
      inner.className = 'fault-body-inner';
      while (body.firstChild) inner.appendChild(body.firstChild);
      body.appendChild(inner);
    }
  });

  function closeActive() {
    if (activeHotspot) {
      activeHotspot.classList.remove('is-active');
      activeHotspot = null;
    }
    overlay.classList.remove('is-active');
  }

  hotspots.forEach(hs => {
    // Touch / click for mobile
    hs.addEventListener('click', e => {
      e.stopPropagation();
      if (activeHotspot === hs) {
        closeActive();
        return;
      }
      closeActive();
      activeHotspot = hs;
      hs.classList.add('is-active');
      overlay.classList.add('is-active');
    });
  });

  overlay.addEventListener('click', closeActive);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeActive();
  });
})();

/* ─── 3. Accordion (Faults) ──────────────────────────────────── */
(function initAccordion() {
  const items = document.querySelectorAll('[data-accordion]');

  items.forEach(item => {
    const btn  = item.querySelector('.fault-header');
    const body = item.querySelector('.fault-body');
    const inner = body.querySelector('.fault-body-inner');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all
      items.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.fault-header').setAttribute('aria-expanded', 'false');
        other.querySelector('.fault-body').style.maxHeight = '0';
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });
})();

/* ─── 4. Scroll Reveal for Rule Cards ───────────────────────── */
(function initScrollReveal() {
  const cards = document.querySelectorAll('[data-reveal]');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Staggered delay
        const delay = Array.from(cards).indexOf(entry.target) % 3 * 80;
        setTimeout(() => {
          entry.target.classList.add('is-revealed');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(card => observer.observe(card));
})();

/* ─── 5. Serve Animation ─────────────────────────────────────── */
(function initServeAnimation() {
  const btn    = document.getElementById('btnServe');
  const court  = document.getElementById('serveCourt');
  const ball   = document.getElementById('serveBall');
  const b1     = document.getElementById('serveBounce1');
  const b2     = document.getElementById('serveBounce2');

  if (!btn || !court || !ball) return;

  let running = false;

  // Animation keyframes as percentage-based positions [left%, top%]
  const steps = [
    // [left%, top%, duration_ms, easing]
    { l: 62, t: 22, d: 0,    e: 'linear' },      // start: server position (bottom-right of own court)
    { l: 58, t: 68, d: 350,  e: 'ease-out' },     // bounce 1 (own court)
    { l: 40, t: 42, d: 400,  e: 'ease-in-out' },  // cross net
    { l: 28, t: 22, d: 380,  e: 'ease-in' },      // bounce 2 (cross service box)
    { l: 22, t: 8,  d: 300,  e: 'ease-out' },     // hit back wall
    { l: 28, t: 22, d: 250,  e: 'ease-in-out' },  // rebound from glass
  ];

  const bouncePositions = [
    { el: b1, l: 58, t: 68 },
    { el: b2, l: 28, t: 22 },
  ];

  function resetAnim() {
    ball.style.transition = 'none';
    ball.style.opacity = '0';
    ball.style.left = steps[0].l + '%';
    ball.style.top  = steps[0].t + '%';
    [b1, b2].forEach(b => { b.style.opacity = '0'; });
    drawServePath(court);
  }

  async function playServe() {
    if (running) return;
    running = true;
    btn.classList.add('is-playing');
    btn.textContent = '⏹ Duraksatmak için tıkla';

    resetAnim();

    // Fade in ball
    await delay(50);
    ball.style.transition = 'opacity 0.2s ease';
    ball.style.opacity = '1';
    await delay(200);

    // Animate through steps
    for (let i = 1; i < steps.length; i++) {
      const s = steps[i];
      ball.style.transition = `left ${s.d}ms ${s.e}, top ${s.d}ms ${s.e}`;
      ball.style.left = s.l + '%';
      ball.style.top  = s.t + '%';
      await delay(s.d);

      // Show bounce markers
      if (i === 1) showBounce(b1, bouncePositions[0]);
      if (i === 3) showBounce(b2, bouncePositions[1]);
    }

    // Flash on wall
    ball.style.transition = 'box-shadow 0.15s ease';
    ball.style.boxShadow = '0 0 20px rgba(204,255,0,1), 0 0 40px rgba(204,255,0,0.8)';
    await delay(200);
    ball.style.boxShadow = '';

    await delay(600);

    // Fade out
    ball.style.transition = 'opacity 0.3s ease';
    ball.style.opacity = '0';
    await delay(300);

    running = false;
    btn.classList.remove('is-playing');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Servisi İzle';
  }

  function showBounce(el, pos) {
    el.style.left = pos.l + '%';
    el.style.top  = pos.t + '%';
    el.style.transition = 'opacity 0.1s ease, transform 0.3s ease';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    setTimeout(() => {
      el.style.transform = 'translate(-50%, -50%) scale(2)';
      el.style.opacity = '0';
    }, 150);
    setTimeout(() => {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 450);
  }

  function drawServePath(container) {
    const svg  = container.querySelector('#serveTrajectory');
    const path = container.querySelector('#servePath');
    if (!svg || !path) return;

    const W = 300, H = 600;
    const pts = steps.map(s => ({ x: s.l / 100 * W, y: s.t / 100 * H }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = (pts[i-1].x + pts[i].x) / 2;
      const cp1y = pts[i-1].y;
      const cp2x = (pts[i-1].x + pts[i].x) / 2;
      const cp2y = pts[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
    }
    path.setAttribute('d', d);
  }

  btn.addEventListener('click', playServe);

  // Draw initial path
  drawServePath(court);
})();

/* ─── 6. Wall Shot Animation ─────────────────────────────────── */
(function initWallAnimation() {
  const btn   = document.getElementById('btnWall');
  const court = document.getElementById('wallCourt');
  const ball  = document.getElementById('wallBall');
  const b1    = document.getElementById('wallBounce1');
  const b2    = document.getElementById('wallBounce2');

  if (!btn || !court || !ball) return;

  let running = false;

  // Steps: attacker hits from top, ball comes toward bottom-back-wall,
  // bounces off back wall, defender hits back over
  const steps = [
    { l: 50, t: 14, d: 0,   e: 'linear' },      // start: attacker top
    { l: 36, t: 72, d: 420, e: 'ease-in' },      // crosses net, lands in defender's court
    { l: 30, t: 91, d: 320, e: 'ease-out' },     // hits back wall
    { l: 36, t: 72, d: 280, e: 'ease-in-out' },  // rebounds from wall
    { l: 28, t: 60, d: 300, e: 'ease-in' },      // defender hits
    { l: 50, t: 42, d: 350, e: 'ease-out' },     // crosses net
    { l: 60, t: 20, d: 320, e: 'ease-in' },      // lands in top half
  ];

  const bouncePositions = [
    { el: b1, l: 36, t: 72 },
    { el: b2, l: 30, t: 91 },
  ];

  function resetAnim() {
    ball.style.transition = 'none';
    ball.style.opacity = '0';
    ball.style.left = steps[0].l + '%';
    ball.style.top  = steps[0].t + '%';
    [b1, b2].forEach(b => { b.style.opacity = '0'; });
    drawWallPath(court);
  }

  async function playWall() {
    if (running) return;
    running = true;
    btn.classList.add('is-playing');
    btn.textContent = '⏹ Durdur';

    resetAnim();

    await delay(50);
    ball.style.transition = 'opacity 0.2s ease';
    ball.style.opacity = '1';
    await delay(200);

    for (let i = 1; i < steps.length; i++) {
      const s = steps[i];
      ball.style.transition = `left ${s.d}ms ${s.e}, top ${s.d}ms ${s.e}, box-shadow 0.15s`;
      ball.style.left = s.l + '%';
      ball.style.top  = s.t + '%';
      await delay(s.d);

      if (i === 1) showBounce(b1, bouncePositions[0]);
      if (i === 2) {
        // Wall impact flash
        ball.style.boxShadow = '0 0 20px rgba(0,150,214,1), 0 0 40px rgba(0,150,214,0.8)';
        showBounce(b2, bouncePositions[1]);
        await delay(80);
        ball.style.boxShadow = '';
      }
    }

    await delay(500);
    ball.style.transition = 'opacity 0.3s ease';
    ball.style.opacity = '0';
    await delay(300);

    running = false;
    btn.classList.remove('is-playing');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Duvar Vuruşunu İzle';
  }

  function showBounce(el, pos) {
    el.style.left = pos.l + '%';
    el.style.top  = pos.t + '%';
    el.style.transition = 'opacity 0.1s ease, transform 0.3s ease';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    el.style.borderColor = '#0096d6';
    setTimeout(() => {
      el.style.transform = 'translate(-50%, -50%) scale(2.2)';
      el.style.opacity = '0';
    }, 120);
    setTimeout(() => {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 420);
  }

  function drawWallPath(container) {
    const svg  = container.querySelector('#wallTrajectory');
    const path = container.querySelector('#wallPath');
    if (!svg || !path) return;

    const W = 300, H = 600;
    const pts = steps.map(s => ({ x: s.l / 100 * W, y: s.t / 100 * H }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = (pts[i-1].x + pts[i].x) / 2;
      const cp1y = pts[i-1].y;
      const cp2x = (pts[i-1].x + pts[i].x) / 2;
      const cp2y = pts[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
    }
    path.setAttribute('d', d);
  }

  btn.addEventListener('click', playWall);
  drawWallPath(court);
})();

/* ─── 7. Utility: Promise-based delay ───────────────────────── */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─── 8. Smooth Scroll for anchor links ─────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar').offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─── 9. Active nav highlight on scroll ─────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const navH = () => document.getElementById('navbar').offsetHeight + 32;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.style.color = '';
          link.style.background = '';
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.style.color = 'var(--accent)';
            link.style.background = 'rgba(204,255,0,0.08)';
          }
        });
      }
    });
  }, {
    rootMargin: `-${navH()}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
})();
