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

/* ─── 10. Padel Score Tracker ──────────────────────────────────
   Full scoring state machine: Points → Games → Sets → Match
─────────────────────────────────────────────────────────────── */
(function initScoreTracker() {
  'use strict';

  const POINTS_LABEL = ['0', '15', '30', '40'];

  /* ── State ── */
  function createState() {
    return {
      t1Points: 0, t2Points: 0,   // 0‑3 index into POINTS_LABEL
      deuce: false,
      advantage: 0,               // 0=none 1=T1 2=T2
      t1Games: 0, t2Games: 0,
      sets: [null, null, null],   // completed: {t1,t2} or null
      currentSet: 0,
      tiebreak: false,
      tbT1: 0, tbT2: 0,
      matchOver: false,
      winner: 0,
      log: [],
    };
  }
  let S = createState();

  /* ── DOM refs ── */
  const sb1s   = [0,1,2].map(i => document.getElementById(`sb1s${i}`));
  const sb2s   = [0,1,2].map(i => document.getElementById(`sb2s${i}`));
  const el1g   = document.getElementById('sb1g');
  const el2g   = document.getElementById('sb2g');
  const el1p   = document.getElementById('sb1p');
  const el2p   = document.getElementById('sb2p');
  const elStat = document.getElementById('sbStatus');
  const elRow1 = document.getElementById('sbRow1');
  const elRow2 = document.getElementById('sbRow2');
  const slpList= document.getElementById('slpList');
  const btnRst = document.getElementById('btnResetScore');

  if (!el1p || !el2p) return;

  /* ── Score-award buttons ── */
  document.querySelectorAll('.btn-score').forEach(btn => {
    btn.addEventListener('click', () => {
      if (S.matchOver) return;
      const team   = parseInt(btn.dataset.team, 10);
      const reason = btn.dataset.reason || 'Genel';

      btn.classList.add('btn-score--pulse');
      setTimeout(() => btn.classList.remove('btn-score--pulse'), 600);

      const result = addPoint(team, reason);
      if (result) {
        S.log.unshift(result);
        updateUI(result);
        // Scroll score tracker into view (subtle hint)
        const section = document.getElementById('score-tracker');
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    });
  });

  /* ── Reset ── */
  btnRst && btnRst.addEventListener('click', () => {
    S = createState();
    renderBoard();
    renderLog();
    setStatus('HAZIR', '');
  });

  /* ══════════════════════════════════════════
     SCORING LOGIC
  ══════════════════════════════════════════ */

  function addPoint(team, reason) {
    if (S.matchOver) return null;
    return S.tiebreak ? tbPoint(team, reason) : regularPoint(team, reason);
  }

  function regularPoint(team, reason) {
    const other = team === 1 ? 2 : 1;

    /* ─ Deuce state ─ */
    if (S.deuce) {
      if (S.advantage === team) {
        return gameWon(team, reason, 'Avantajdan Oyun');
      }
      if (S.advantage === other) {
        S.advantage = 0;
        return mkEntry('deuce', team, reason, '⚖️ Tekrar Deuce', '40-40', 'Deuce');
      }
      S.advantage = team;
      return mkEntry('advantage', team, reason, `⚡ T${team} Avantaj!`, `T${team} ADV`, 'ADV');
    }

    /* ─ Normal point ─ */
    if (team === 1) S.t1Points++; else S.t2Points++;

    /* check deuce */
    if (S.t1Points >= 3 && S.t2Points >= 3) {
      S.deuce = true;
      S.t1Points = S.t2Points = 3;
      return mkEntry('deuce', team, reason, '⚖️ Deuce! 40-40', '40-40', 'Deuce');
    }

    /* check natural game win (shouldn't go beyond 3 normally) */
    if (S.t1Points > 3) { S.t1Points = 3; return gameWon(1, reason, 'Normal'); }
    if (S.t2Points > 3) { S.t2Points = 3; return gameWon(2, reason, 'Normal'); }

    return mkEntry('point', team, reason,
      `T${team} Puan! ${scoreStr()}`, scoreStr(), scoreStr());
  }

  function gameWon(team, reason, ctx) {
    /* reset point counters */
    S.t1Points = S.t2Points = 0;
    S.deuce = false; S.advantage = 0;
    if (team === 1) S.t1Games++; else S.t2Games++;

    /* 6-6 → tiebreak */
    if (S.t1Games === 6 && S.t2Games === 6) {
      S.tiebreak = true; S.tbT1 = S.tbT2 = 0;
      return mkEntry('tiebreak', team, reason,
        `🎾 T${team} Oyun! Tie-Break başlıyor...`,
        `${S.t1Games}-${S.t2Games}`, 'Tie-Break', 'slp-item--game');
    }

    /* check set win */
    const sw = checkSetWin();
    if (sw) return setWon(sw, team, reason);

    return mkEntry('game', team, reason,
      `🎾 T${team} Oyun! ${S.t1Games}-${S.t2Games}`,
      `${S.t1Games}-${S.t2Games}`, `${S.t1Games}-${S.t2Games}`, 'slp-item--game');
  }

  function checkSetWin() {
    const g1 = S.t1Games, g2 = S.t2Games;
    if (g1 >= 6 && g1 - g2 >= 2) return 1;
    if (g2 >= 6 && g2 - g1 >= 2) return 2;
    if (g1 === 7 && g2 === 6)     return 1;
    if (g2 === 7 && g1 === 6)     return 2;
    return 0;
  }

  function setWon(sw, lastTeam, reason) {
    const idx = S.currentSet;
    S.sets[idx] = { t1: S.t1Games, t2: S.t2Games };
    const setLabel = `${S.t1Games}-${S.t2Games}`;
    S.t1Games = S.t2Games = 0;
    S.currentSet++;
    S.tiebreak = false;

    const w1 = S.sets.filter(s => s && s.t1 > s.t2).length;
    const w2 = S.sets.filter(s => s && s.t2 > s.t1).length;

    if (w1 === 2 || w2 === 2) {
      const mw = w1 === 2 ? 1 : 2;
      S.matchOver = true; S.winner = mw;
      return mkEntry('match', mw, reason,
        `🏆 TAKIM ${mw} MAÇI KAZANDI!`, setLabel,
        `T${mw} Maç Kazandı!`, 'slp-item--match');
    }
    return mkEntry('set', sw, reason,
      `🔥 T${sw} SET KAZANDI! ${setLabel}`, setLabel,
      `T${sw} Set (${setLabel})`, 'slp-item--set');
  }

  function tbPoint(team, reason) {
    if (team === 1) S.tbT1++; else S.tbT2++;
    const t1 = S.tbT1, t2 = S.tbT2;
    const tbScore = `${t1}-${t2}`;

    if ((t1 >= 7 || t2 >= 7) && Math.abs(t1 - t2) >= 2) {
      const tw = t1 > t2 ? 1 : 2;
      S.tiebreak = false;
      S.t1Games = tw === 1 ? 7 : 6;
      S.t2Games = tw === 2 ? 7 : 6;
      return setWon(tw, team, `${reason} (TB ${tbScore})`);
    }
    return mkEntry('tb-point', team, reason,
      `Tie-Break: ${tbScore}`, `TB ${tbScore}`, `TB ${tbScore}`);
  }

  /* ── Entry factory ── */
  function mkEntry(type, team, reason, message, score, logResult, logClass) {
    return {
      type, team, reason, message, score,
      logClass: logClass || `slp-item--t${team}`,
      logLabel: type === 'match' ? '🏆 MAÇ' : type === 'set' ? 'SET' : type === 'game' ? 'OYUN' : `T${team}`,
      logText:  reason,
      logResult,
    };
  }

  function scoreStr() {
    if (S.tiebreak)    return `TB ${S.tbT1}-${S.tbT2}`;
    if (S.deuce) {
      if (S.advantage === 1) return 'ADV-40';
      if (S.advantage === 2) return '40-ADV';
      return '40-40';
    }
    return `${POINTS_LABEL[S.t1Points]}-${POINTS_LABEL[S.t2Points]}`;
  }

  /* ══════════════════════════════════════════
     UI RENDER
  ══════════════════════════════════════════ */

  function updateUI(result) {
    renderBoard();
    renderLog();
    animateStatus(result);
  }

  function renderBoard() {
    /* Set columns */
    for (let i = 0; i < 3; i++) {
      const sd = S.sets[i];
      const isActive = i === S.currentSet;
      if (sd) {
        sb1s[i].textContent = sd.t1;
        sb2s[i].textContent = sd.t2;
        sb1s[i].classList.remove('sb-col--inactive');
        sb2s[i].classList.remove('sb-col--inactive');
        sb1s[i].style.fontWeight = sd.t1 > sd.t2 ? '800' : '400';
        sb2s[i].style.fontWeight = sd.t2 > sd.t1 ? '800' : '400';
        sb1s[i].style.color = sd.t1 > sd.t2 ? 'var(--accent)' : '';
        sb2s[i].style.color = sd.t2 > sd.t1 ? 'var(--primary-light)' : '';
      } else if (isActive) {
        sb1s[i].textContent = '·';
        sb2s[i].textContent = '·';
        sb1s[i].classList.remove('sb-col--inactive');
        sb2s[i].classList.remove('sb-col--inactive');
        sb1s[i].style.fontWeight = sb1s[i].style.color = '';
        sb2s[i].style.fontWeight = sb2s[i].style.color = '';
      } else {
        sb1s[i].textContent = '-';
        sb2s[i].textContent = '-';
        sb1s[i].classList.add('sb-col--inactive');
        sb2s[i].classList.add('sb-col--inactive');
        sb1s[i].style.fontWeight = sb1s[i].style.color = '';
        sb2s[i].style.fontWeight = sb2s[i].style.color = '';
      }
    }

    /* Games */
    el1g.textContent = S.t1Games;
    el2g.textContent = S.t2Games;

    /* Points */
    let p1, p2;
    if (S.matchOver) {
      p1 = S.winner === 1 ? '🏆' : ''; p2 = S.winner === 2 ? '🏆' : '';
    } else if (S.tiebreak) {
      p1 = String(S.tbT1); p2 = String(S.tbT2);
    } else if (S.deuce) {
      if (S.advantage === 1)      { p1 = 'ADV'; p2 = '40'; }
      else if (S.advantage === 2) { p1 = '40';  p2 = 'ADV'; }
      else                        { p1 = p2 = 'DCE'; }
    } else {
      p1 = POINTS_LABEL[S.t1Points];
      p2 = POINTS_LABEL[S.t2Points];
    }

    animateVal(el1p, p1);
    animateVal(el2p, p2);

    /* Row highlight */
    elRow1.classList.toggle('sb-row--winning',
      S.t1Points > S.t2Points || S.advantage === 1);
    elRow2.classList.toggle('sb-row--winning',
      S.t2Points > S.t1Points || S.advantage === 2);
  }

  function animateVal(el, v) {
    if (!el) return;
    const newV = String(v);
    if (el.textContent === newV) return;
    el.textContent = newV;
    el.classList.remove('score-updated');
    void el.offsetWidth;
    el.classList.add('score-updated');
    setTimeout(() => el.classList.remove('score-updated'), 360);
  }

  const STATUS_MAP = {
    'point':    (r) => ['', r.score],
    'deuce':    ()  => ['sb-status-badge--deuce', 'DEUCE'],
    'advantage':(r) => ['sb-status-badge--adv',   `T${r.team} ADV`],
    'tiebreak': ()  => ['sb-status-badge--tiebreak', 'TIE-BREAK'],
    'tb-point': ()  => ['sb-status-badge--tiebreak', `TB ${S.tbT1}-${S.tbT2}`],
    'game':     (r) => ['sb-status-badge--game',  `T${r.team} OYUN`],
    'set':      (r) => ['sb-status-badge--set',   `T${r.team} SET`],
    'match':    (r) => ['sb-status-badge--match', `T${r.team} MAÇ 🏆`],
  };

  function animateStatus(result) {
    if (!result || !elStat) return;
    const fn = STATUS_MAP[result.type];
    if (!fn) return;
    const [cls, text] = fn(result);
    elStat.className = 'sb-status-badge' + (cls ? ' ' + cls : '');
    elStat.textContent = text || result.score;
  }

  function setStatus(text, cls) {
    if (!elStat) return;
    elStat.className = 'sb-status-badge' + (cls ? ' ' + cls : '');
    elStat.textContent = text;
  }

  function renderLog() {
    if (!slpList) return;
    if (!S.log.length) {
      slpList.innerHTML = '<div class="slp-empty">Henüz puan yok. Aşağıdaki bölümlerdeki <strong>"T1/T2 Puan"</strong> butonlarını kullan.</div>';
      return;
    }
    slpList.innerHTML = S.log.map((e, i) => `
      <div class="slp-item ${e.logClass}">
        <span class="slp-item-num">${S.log.length - i}</span>
        <span class="slp-item-team">${e.logLabel}</span>
        <span class="slp-item-text">${escHtml(e.logText)}</span>
        <span class="slp-item-result">${escHtml(e.logResult)}</span>
      </div>`).join('');
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* initial render */
  renderBoard();
})();

/* ─── 11. Gemini AI Chat Widget ────────────────────────────────
   Floating chat with Gemini 2.5 Flash — Padel Rule Assistant
─────────────────────────────────────────────────────────────── */
(function initChatWidget() {
  'use strict';

  const API_URL   = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const LS_KEY    = 'padel_gemini_key';
  const SYS_PROMPT= 'Sen uzman bir Padel Tenisi hakemi ve antrenörüsün. Sana gelen tüm soruları yalnızca Padel kuralları, teknikleri ve stratejileri çerçevesinde, kısa, net ve anlaşılır biçimde Türkçe olarak yanıtla. Kullanıcıya dostane ve motive edici bir dil kullan. Yanıtların maksimum 5-6 cümle olsun.';

  /* ── DOM refs ── */
  const fab        = document.getElementById('chatFab');
  const winEl      = document.getElementById('chatWindow');
  const closeBtn   = document.getElementById('chatClose');
  const apikeyPanel= document.getElementById('cwApikeyPanel');
  const apiInput   = document.getElementById('cwApiKeyInput');
  const apiSaveBtn = document.getElementById('cwApiKeySave');
  const keybar     = document.getElementById('cwKeybar');
  const keyChange  = document.getElementById('cwKeybarChange');
  const messages   = document.getElementById('cwMessages');
  const textarea   = document.getElementById('cwInput');
  const sendBtn    = document.getElementById('cwSend');
  const badge      = document.getElementById('chatFabBadge');
  const subtitle   = document.getElementById('cwSubtitle');
  const openIcon   = fab  && fab.querySelector('.chat-fab-icon--open');
  const closeIcon  = fab  && fab.querySelector('.chat-fab-icon--close');

  if (!fab || !winEl) return;

  let isOpen    = false;
  let isLoading = false;
  let apiKey    = localStorage.getItem(LS_KEY) || '';
  let history   = []; // Gemini conversation history

  /* ── Init ── */
  applyKeyState();

  /* ── FAB toggle ── */
  fab.addEventListener('click', toggleChat);
  closeBtn && closeBtn.addEventListener('click', toggleChat);

  function toggleChat() {
    isOpen = !isOpen;
    fab.classList.toggle('is-open', isOpen);
    winEl.classList.toggle('is-open', isOpen);
    winEl.setAttribute('aria-hidden', String(!isOpen));

    if (openIcon)  openIcon.style.display  = isOpen ? 'none' : 'flex';
    if (closeIcon) closeIcon.style.display = isOpen ? 'flex' : 'none';

    if (isOpen) {
      if (badge) badge.style.display = 'none';
      setTimeout(scrollBottom, 160);
      if (apiKey && textarea && !textarea.disabled) {
        setTimeout(() => textarea.focus(), 320);
      }
    }
  }

  /* ── API key save ── */
  apiSaveBtn && apiSaveBtn.addEventListener('click', saveKey);
  apiInput   && apiInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveKey(); });

  function saveKey() {
    const val = (apiInput.value || '').trim();
    if (!val) { shakeEl(apiInput); return; }
    apiKey = val;
    localStorage.setItem(LS_KEY, apiKey);
    applyKeyState();
  }

  /* ── Change key ── */
  keyChange && keyChange.addEventListener('click', () => {
    apiKey = '';
    localStorage.removeItem(LS_KEY);
    applyKeyState();
    setTimeout(() => apiInput && apiInput.focus(), 80);
  });

  function applyKeyState() {
    const has = !!apiKey;
    if (apikeyPanel) apikeyPanel.style.display = has ? 'none' : 'block';
    if (keybar)      keybar.style.display      = has ? 'flex' : 'none';
    if (textarea)    textarea.disabled         = !has;
    if (sendBtn)     sendBtn.disabled          = !has;
    if (subtitle) {
      subtitle.textContent = has ? 'Gemini 2.5 Flash · Çevrimiçi' : 'API anahtarı gerekli';
      if (has) subtitle.classList.add('online');
      else     subtitle.classList.remove('online');
    }
    /* Show badge hint for new users after 3s */
    if (!has && badge) setTimeout(() => { if (!isOpen) badge.style.display = 'flex'; }, 3000);
  }

  /* ── Send message ── */
  sendBtn  && sendBtn.addEventListener('click', sendMsg);
  textarea && textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  });
  textarea && textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  });

  async function sendMsg() {
    if (!apiKey || isLoading) return;
    const text = (textarea.value || '').trim();
    if (!text) return;

    appendMsg('user', text);
    textarea.value = '';
    textarea.style.height = 'auto';

    history.push({ role: 'user', parts: [{ text }] });

    const typing = showTyping();
    isLoading = true;
    sendBtn.disabled = true;
    textarea.disabled = true;

    try {
      const res = await fetch(`${API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYS_PROMPT }] },
          contents: history,
          generationConfig: { temperature: 0.65, maxOutputTokens: 512 },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data    = await res.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı.';
      history.push({ role: 'model', parts: [{ text: botText }] });

      typing && typing.remove();
      appendMsg('bot', botText);

    } catch (err) {
      typing && typing.remove();
      const isAuthErr = /API_KEY|401|403|invalid/i.test(err.message);
      appendMsg('error', isAuthErr
        ? '❌ API anahtarı geçersiz veya yetki hatası. Anahtarı kontrol edin.'
        : `❌ Hata: ${err.message}`);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      textarea.disabled = false;
      textarea.focus();
    }
  }

  /* ── UI helpers ── */
  function appendMsg(role, text) {
    const wrap   = document.createElement('div');
    wrap.className = `cw-msg cw-msg--${role === 'user' ? 'user' : role === 'error' ? 'bot cw-msg--error' : 'bot'}`;

    const av   = document.createElement('div');
    av.className = 'cw-msg-avatar';
    av.textContent = role === 'user' ? 'SEN' : '🤖';

    const bub  = document.createElement('div');
    bub.className = 'cw-msg-bubble';
    bub.innerHTML = fmtText(text);

    wrap.appendChild(av);
    wrap.appendChild(bub);
    messages.appendChild(wrap);
    scrollBottom();
  }

  function fmtText(t) {
    return String(t)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/\n/g,'<br>');
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'cw-msg cw-msg--bot';
    wrap.id = 'cwTyping';
    const av  = document.createElement('div');
    av.className = 'cw-msg-avatar'; av.textContent = '🤖';
    const bub = document.createElement('div');
    bub.className = 'cw-msg-bubble';
    bub.innerHTML = '<div class="cw-typing-dots"><span></span><span></span><span></span></div>';
    wrap.appendChild(av); wrap.appendChild(bub);
    messages.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function shakeEl(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.32s ease';
    setTimeout(() => { el.style.animation = ''; }, 380);
  }
})();
