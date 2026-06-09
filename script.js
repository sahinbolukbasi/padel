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

/* ─── 2. SVG Court + Mobile Bottom Sheet ────────────────────── */
(function initCourtBottomSheet() {
  const zones = document.querySelectorAll('.court-zone[data-zone]');
  const overlay = document.getElementById('sheetOverlay');
  const sheet = document.getElementById('courtSheet');
  const closeBtn = document.getElementById('sheetClose');
  const titleEl = document.getElementById('sheetTitle');
  const subtitleEl = document.getElementById('sheetSubtitle');
  const descEl = document.getElementById('sheetDesc');
  const rulesEl = document.getElementById('sheetRules');
  const iconEl = document.getElementById('sheetIcon');

  if (!zones.length || !overlay || !sheet) return;

  const zoneData = {
    net: {
      icon: '🕸️',
      title: 'File (Net)',
      subtitle: 'Sahayı ikiye bölen kritik hat',
      desc: 'Padelde file yüksekliği ortada 88 cm, kenarlarda 92 cm olacak şekilde tasarlanır. Servis ve rally vuruşları fileyi temiz geçmelidir.',
      rules: [
        'Serviste top fileye değip doğru kutuya düşerse let oynanır.',
        'Vuruş sırasında raketin veya oyuncunun fileye teması hatadır.',
        'Fileye takılan top karşı tarafa geçmezse puan kaybı oluşur.'
      ]
    },
    'service-line': {
      icon: '📏',
      title: 'Servis Çizgisi',
      subtitle: 'Fileden 3 metre uzaktaki kontrol hattı',
      desc: 'Servis topu çapraz servis kutusuna düşerken servis çizgisinin ön tarafına inmelidir. Çizgiye temas geçerli kabul edilir.',
      rules: [
        'Servis topu servis çizgisini aşarak derine düşmemelidir.',
        'Servis pozisyonu arka çizgi gerisinde korunmalıdır.',
        'Çizgi üstü temas kural gereği içeri sayılır.'
      ]
    },
    'service-box': {
      icon: '🎯',
      title: 'Servis Kutuları',
      subtitle: 'Çapraz servis hedef alanı',
      desc: 'Standart 10x20 m kortta servis kutuları file ve servis çizgisi arasında ikiye bölünür. Servis daima çapraz kutuya gönderilir.',
      rules: [
        'Sağdan atılan servis rakibin sol kutusuna gitmelidir.',
        'Soldan atılan servis rakibin sağ kutusuna gitmelidir.',
        'Top kutuya düşmeden direkt cama giderse servis hatasıdır.'
      ]
    },
    'back-glass': {
      icon: '🧱',
      title: 'Arka Cam',
      subtitle: 'Padelin savunma motoru',
      desc: 'Top zemine temas ettikten sonra arka cama çarpıp geri dönebilir. Savunma oyuncusu bu dönüşü avantaja çevirebilir.',
      rules: [
        'Top önce zemine değmeden cama çarparsa puan kaybedilir.',
        'Camdan sekme sonrası tek vuruş hakkı vardır.',
        'Lob savunmasında arka cam kullanımı kritik taktiktir.'
      ]
    },
    'side-walls': {
      icon: '🛡️',
      title: 'Yan Cam/Tel',
      subtitle: 'Açı üretimi ve ritim kırma bölgesi',
      desc: 'Yan duvarlar padelde topa ekstra yön verir. Kontrollü yan sekmeler rakibi dengesiz yakalamak için kullanılır.',
      rules: [
        'Top zeminden sonra yan duvara değerek oyunda kalabilir.',
        'Duvar sekmesini okuyup pozisyon almak reaksiyon kazandırır.',
        'Dar açılarda yan duvar üzerinden tempo değiştirilebilir.'
      ]
    }
  };

  let activeZone = null;

  function setActive(zoneEl) {
    zones.forEach(z => z.classList.remove('is-active'));
    if (zoneEl) zoneEl.classList.add('is-active');
    activeZone = zoneEl;
  }

  function openSheet(zoneKey) {
    const data = zoneData[zoneKey];
    if (!data) return;

    titleEl.textContent = data.title;
    subtitleEl.textContent = data.subtitle;
    descEl.textContent = data.desc;
    iconEl.textContent = data.icon;
    rulesEl.innerHTML = data.rules.map(rule => `<li>${rule}</li>`).join('');

    overlay.classList.add('is-open');
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
  }

  function closeSheet() {
    overlay.classList.remove('is-open');
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    if (activeZone) activeZone.classList.remove('is-active');
    activeZone = null;
  }

  zones.forEach(zone => {
    zone.addEventListener('click', () => {
      const key = zone.dataset.zone;
      setActive(zone);
      openSheet(key);
    });
  });

  closeBtn.addEventListener('click', closeSheet);
  overlay.addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSheet();
  });
})();

/* ─── 3. Accordion (Faults) ──────────────────────────────────── */
(function initAccordion() {
  const items = document.querySelectorAll('[data-accordion]');

  document.querySelectorAll('.fault-body').forEach(body => {
    if (!body.querySelector('.fault-body-inner')) {
      const inner = document.createElement('div');
      inner.className = 'fault-body-inner';
      while (body.firstChild) inner.appendChild(body.firstChild);
      body.appendChild(inner);
    }
  });

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

  // Mobile readability: tap card to expand/collapse full text.
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (window.innerWidth > 768) return;
      card.classList.toggle('is-expanded');
    });
  });
})();

/* ─── 5. Motion Lab (4 Advanced Animations) ─────────────────── */
(function initMotionLab() {
  const svg = document.getElementById('motionSvg');
  const ball = document.getElementById('motionBall');
  const trail = document.getElementById('motionTrail');
  const pathGhost = document.getElementById('motionPathGhost');
  const tabs = Array.from(document.querySelectorAll('.motion-tab'));
  const playBtn = document.getElementById('motionPlay');
  const prevBtn = document.getElementById('motionPrev');
  const nextBtn = document.getElementById('motionNext');
  const range = document.getElementById('motionProgress');
  const stepLabel = document.getElementById('motionStepLabel');
  const titleEl = document.getElementById('motionTitle');
  const descEl = document.getElementById('motionDesc');
  const stepsEl = document.getElementById('motionSteps');
  const btnT1 = document.getElementById('motionT1');
  const btnT2 = document.getElementById('motionT2');

  if (!svg || !ball || !tabs.length) return;

  const motions = {
    serve: {
      title: 'Doğru Servis',
      reason: 'Doğru Servis',
      desc: 'Servis topu önce zemine iner, çapraz kutuya gider ve derinlikte camdan sekerek oyunu başlatır.',
      steps: [
        { text: 'Hazırlık: Servis oyuncusu sağ arka bölgeden pozisyon alır.', p: [250, 560] },
        { text: 'Top zemine bir kez bırakılır, bel altı vuruş hazırlanır.', p: [238, 500] },
        { text: 'Top çapraz servis kutusuna gönderilir.', p: [92, 168] },
        { text: 'Derinlikte arka cama temas ederek sekme üretir.', p: [70, 44] }
      ]
    },
    bandeja: {
      title: 'Bandeja',
      reason: 'Bandeja Vuruşu',
      desc: 'Orta-yüksek topta kontrollü kesme vuruşla topu düşük ve derin göndererek file üstünlüğünü korur.',
      steps: [
        { text: 'Rakip lobuna karşı file oyuncusu geri adım açısı alır.', p: [176, 260] },
        { text: 'Omuz üstünde kontrollü kesme teması yapılır.', p: [196, 238] },
        { text: 'Top rakibin arka bölgesine alçak hızda iner.', p: [116, 86] },
        { text: 'Sekme sonrası top alçakta kalarak baskı sürer.', p: [130, 68] }
      ]
    },
    lob: {
      title: 'Lob',
      reason: 'Lob Vuruşu',
      desc: 'Savunmadan çıkmak için topu yüksek kavisle rakibin arkasına atıp file pozisyonunu geri aldırır.',
      steps: [
        { text: 'Savunma oyuncusu alçak toptan yükseliş açısı üretir.', p: [84, 528] },
        { text: 'Top yüksek parabole girer.', p: [150, 350] },
        { text: 'Rakibin arkasına doğru derin düşüş başlar.', p: [218, 128] },
        { text: 'Arka çizgiye yakın inişle rakibi geri iter.', p: [228, 52] }
      ]
    },
    wall: {
      title: 'Duvar Kullanımı',
      reason: 'Duvar Kullanımı',
      desc: 'Arka camdan dönen top zamanlanarak karşı sahaya yönlendirilir; savunma hücuma dönüşür.',
      steps: [
        { text: 'Top arka bölgeye hızlı yaklaşır.', p: [88, 540] },
        { text: 'Zeminden sonra arka cama çarpar.', p: [60, 612] },
        { text: 'Cam sekmesi sonrası oyuncu zamanlamayı yakalar.', p: [106, 512] },
        { text: 'Vuruşla top karşı yarıya kontrollü gönderilir.', p: [206, 226] }
      ]
    }
  };

  let key = 'serve';
  let step = 0;
  let animating = false;

  function drawTrail(x, y) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', 'rgba(204,255,0,0.35)');
    dot.style.transition = 'opacity 450ms ease-out, transform 450ms ease-out';
    trail.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.opacity = '0';
      dot.style.transform = 'scale(0.4)';
    });
    setTimeout(() => dot.remove(), 500);
  }

  function moveBallTo(p, instant = false) {
    const [x, y] = p;
    if (instant) {
      ball.setAttribute('cx', x);
      ball.setAttribute('cy', y);
      return;
    }
    const fromX = parseFloat(ball.getAttribute('cx'));
    const fromY = parseFloat(ball.getAttribute('cy'));
    const duration = 520;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const cx = fromX + (x - fromX) * ease;
      const cy = fromY + (y - fromY) * ease;
      ball.setAttribute('cx', cx);
      ball.setAttribute('cy', cy);
      drawTrail(cx, cy);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function renderPathGhost() {
    const pts = motions[key].steps.map(s => s.p);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    pathGhost.setAttribute('d', d);
  }

  function renderInfo() {
    const m = motions[key];
    titleEl.textContent = m.title;
    descEl.textContent = m.desc;
    stepsEl.innerHTML = m.steps.map((s, i) => `
      <button class="motion-step-chip${i === step ? ' is-active' : ''}" data-step="${i}">
        <span class="chip-index">${i + 1}</span>${s.text}
      </button>
    `).join('');
    btnT1.dataset.reason = m.reason;
    btnT2.dataset.reason = m.reason;
  }

  function renderStep() {
    const m = motions[key];
    const max = m.steps.length - 1;
    range.max = String(max);
    range.value = String(step);
    stepLabel.textContent = `Adım ${step + 1}: ${m.steps[step].text}`;
    moveBallTo(m.steps[step].p, true);
    renderInfo();
  }

  async function playAll() {
    if (animating) return;
    animating = true;
    playBtn.classList.add('is-playing');
    playBtn.textContent = 'Oynatılıyor...';
    for (let i = step; i < motions[key].steps.length; i++) {
      step = i;
      range.value = String(step);
      stepLabel.textContent = `Adım ${step + 1}: ${motions[key].steps[step].text}`;
      moveBallTo(motions[key].steps[step].p, i === 0);
      await delay(560);
      if (!animating) break;
    }
    animating = false;
    playBtn.classList.remove('is-playing');
    playBtn.textContent = 'Animasyonu Oynat';
    renderInfo();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      key = tab.dataset.motion;
      step = 0;
      animating = false;
      playBtn.classList.remove('is-playing');
      playBtn.textContent = 'Animasyonu Oynat';
      renderPathGhost();
      renderStep();
    });
  });

  stepsEl.addEventListener('click', e => {
    const chip = e.target.closest('.motion-step-chip');
    if (!chip) return;
    step = Number(chip.dataset.step);
    renderStep();
  });

  playBtn.addEventListener('click', playAll);
  prevBtn.addEventListener('click', () => {
    step = Math.max(0, step - 1);
    renderStep();
  });
  nextBtn.addEventListener('click', () => {
    step = Math.min(motions[key].steps.length - 1, step + 1);
    renderStep();
  });
  range.addEventListener('input', () => {
    step = Number(range.value);
    renderStep();
  });

  renderPathGhost();
  renderStep();
})();

/* ─── 6. Utility: Promise-based delay ───────────────────────── */
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
