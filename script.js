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
    'court-floor': {
      icon: '🟦',
      title: 'Court Floor',
      subtitle: 'Ralli geometrisinin ana yüzeyi',
      desc: 'Padel oyununda tüm ilk temasların referansı zemin yüzeyidir. Topun seki yüksekliği, spin davranışı ve hız kaybı bu yüzey üzerinde okunur.',
      rules: [
        'Rakip atışı önce zemine değmeli, sonra cam/tel sekmesi oyuna girer.',
        'İki sekme oluştuğunda puan sona erer.',
        'Zemin açısını erken okumak savunma reaksiyonunu hızlandırır.'
      ]
    },
    'player-zone': {
      icon: '🧍',
      title: 'Player Standing Zone',
      subtitle: 'Denge, hazırlık ve ilk adım bölgesi',
      desc: 'Oyuncunun temel hazırlık pozisyonunu aldığı alan, bir sonraki vuruş açısını belirler. Doğru duruş, hem file oyunu hem savunma için kritik avantaj üretir.',
      rules: [
        'Servis karşılamada diz-kalça hizası alçak tutulmalı.',
        'Rakibin vuruş anında ağırlık merkezini öne taşı.',
        'İlk adımı topun çıkış yönüne göre gecikmeden ver.'
      ]
    },
    net: {
      icon: '🕸️',
      title: 'Net',
      subtitle: 'Atak ve savunmayı ayıran merkezi bariyer',
      desc: 'Padelde file yüksekliği orta bölümde 88 cm, direklerde 92 cm olacak biçimde uygulanır. Fileyi net geçen toplar atak kalitesini belirler.',
      rules: [
        'Serviste fileye temas edip doğru kutuya inen top let ilan edilir.',
        'Raket veya oyuncunun file teması doğrudan hatadır.',
        'Fileyi geçemeyen top puanı rakibe verir.'
      ]
    },
    'service-boxes': {
      icon: '🎯',
      title: 'Service Boxes',
      subtitle: 'Çapraz servis geçerlilik alanı',
      desc: 'Servis atışının resmi olarak geçerli sayılması için topun ilk sekmesi çapraz servis kutusunda alınmalıdır. Bu alan oyun temposunu başlatan kilit bölgedir.',
      rules: [
        'Sağdan servis, karşı sol kutuya inmeli.',
        'Soldan servis, karşı sağ kutuya inmeli.',
        'Kutuya inmeden cama giden top servis hatasıdır.'
      ]
    },
    'side-panels': {
      icon: '🛡️',
      title: 'Side Panels',
      subtitle: 'Yan cam ve metal tel yön kırma alanı',
      desc: 'Yan paneller topa ikinci yön kazandırarak açı üretir. Özellikle dar açı rallilerinde savunma-hücum dönüşümü bu sekmelerle hızlanır.',
      rules: [
        'Top ilk zemin temasından sonra yan panele değebilir.',
        'Yan sekmeyi erken okumak pozisyon avantajı sağlar.',
        'Doğrudan tele giden top, zemin teması yoksa hatadır.'
      ]
    },
    'back-panels': {
      icon: '🧱',
      title: 'Back Panels',
      subtitle: 'Savunma devamlılığını sağlayan arka cam',
      desc: 'Arka cam paneller, topun kontrollü şekilde geri oyuna dönmesine izin vererek savunmadan yeniden yapı kurmayı sağlar.',
      rules: [
        'Top önce zemine temas etmeli, sonra arka cama gitmeli.',
        'Camdan dönüş sonrası tek net temas hakkı vardır.',
        'Lob savunmasında cam açıları ralli kontrolünü belirler.'
      ]
    }
  };

  let activeZone = null;

  function setPreview(zoneEl, enabled) {
    if (!zoneEl) return;
    zoneEl.classList.toggle('is-preview', enabled);
  }

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
    zones.forEach(z => z.classList.remove('is-preview'));
    if (activeZone) activeZone.classList.remove('is-active');
    activeZone = null;
  }

  zones.forEach(zone => {
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    const zoneKey = zone.dataset.zone;
    if (zoneData[zoneKey]) {
      zone.setAttribute('aria-label', zoneData[zoneKey].title);
    }

    zone.addEventListener('pointerenter', () => setPreview(zone, true));
    zone.addEventListener('pointerleave', () => setPreview(zone, false));
    zone.addEventListener('focus', () => setPreview(zone, true));
    zone.addEventListener('blur', () => setPreview(zone, false));
    zone.addEventListener('touchstart', () => setPreview(zone, true), { passive: true });
    zone.addEventListener('touchend', () => {
      if (!zone.classList.contains('is-active')) setPreview(zone, false);
    }, { passive: true });
    zone.addEventListener('touchcancel', () => setPreview(zone, false), { passive: true });

    zone.addEventListener('click', () => {
      const key = zone.dataset.zone;
      setPreview(zone, false);
      setActive(zone);
      openSheet(key);
    });

    zone.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const key = zone.dataset.zone;
      setPreview(zone, false);
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
  const shadow = document.getElementById('motionBallShadow');
  const trail = document.getElementById('motionTrail');
  const impacts = document.getElementById('motionImpacts');
  const pathGhost = document.getElementById('motionPathGhost');
  const wallTop = document.getElementById('motionWallTop');
  const wallBottom = document.getElementById('motionWallBottom');
  const tabs = Array.from(document.querySelectorAll('.motion-tab'));
  const playBtn = document.getElementById('motionPlay');
  const prevBtn = document.getElementById('motionPrev');
  const nextBtn = document.getElementById('motionNext');
  const range = document.getElementById('motionProgress');
  const speed = document.getElementById('motionSpeed');
  const speedMeta = document.getElementById('motionSpeedMeta');
  const loopTimer = document.getElementById('motionLoopTimer');
  const stepLabel = document.getElementById('motionStepLabel');
  const titleEl = document.getElementById('motionTitle');
  const descEl = document.getElementById('motionDesc');
  const stepsEl = document.getElementById('motionSteps');

  if (!svg || !ball || !tabs.length || !shadow || !trail || !impacts || !speed || !speedMeta || !loopTimer) return;

  const motions = {
    serve: {
      title: 'Doğru Servis',
      reason: 'Doğru Servis',
      desc: 'Servis topu kontrollü parabole girer, çapraz kutuya iner ve derin temasta oyunun dengesini kurar.',
      steps: [
        { text: 'Hazırlık: Servis oyuncusu sağ arka bölgeden denge alır.', p: [248, 546] },
        { text: 'Bel altı temasla top kısa yükselişten sonra bırakılır.', p: [226, 490], impact: 'court' },
        { text: 'Top çapraz servis kutusuna kavisle taşınır.', p: [108, 205], arc: 78 },
        { text: 'Derin hedefe inerek ralli başlangıcı kuruludur.', p: [84, 126], impact: 'court', arc: 36 }
      ],
      defaultArc: 44
    },
    bandeja: {
      title: 'Bandeja',
      reason: 'Bandeja Vuruşu',
      desc: 'Bandeja, yüksek topa kontrollü kesme verip rakibi dipte tutarak file üstünlüğünü koruyan profesyonel geçiş vuruşudur.',
      steps: [
        { text: 'Rakip lobunda file oyuncusu geri çapraza açılır.', p: [188, 272] },
        { text: 'Omuz üstü kesme temasla topa kontrollü spin verilir.', p: [204, 242] },
        { text: 'Top derin arka alana düşük tempolu parabole girer.', p: [118, 132], arc: 54 },
        { text: 'Sekme sonrası alçak kaldığı için baskı devam eder.', p: [132, 106], impact: 'court', arc: 24 }
      ],
      defaultArc: 36
    },
    lob: {
      title: 'Lob',
      reason: 'Lob Vuruşu',
      desc: 'Lob, savunmadan çıkış için maksimum yükseklikli parabole girerek rakibi arka banda iten alan kazandırıcı vuruştur.',
      steps: [
        { text: 'Savunmadan çıkışta raket yüzü açık tutulur.', p: [92, 530] },
        { text: 'Top hızlı yükselir ve tavana yakın apex görür.', p: [148, 280], arc: 110 },
        { text: 'Derin hatta iniş açıları hesaplanır.', p: [222, 134], arc: 128 },
        { text: 'Arka banda yakın iniş rakibi geri taşır.', p: [236, 70], impact: 'court', arc: 48 }
      ],
      defaultArc: 72
    },
    wall: {
      title: 'Duvar Kullanımı',
      reason: 'Duvar Kullanımı',
      desc: 'Arka cam sekmesi doğru açıyla okunur; top ikinci yörüngede karşı sahaya gönderilerek savunma hücuma çevrilir.',
      steps: [
        { text: 'Top arka banda doğru hızla derinleşir.', p: [90, 540] },
        { text: 'İlk temas zeminde alınır ve sekme hazırlanır.', p: [78, 600], impact: 'court' },
        { text: 'Arka cam temasıyla gerçekçi açıda geri kırılır.', p: [104, 548], impact: 'wall-bottom', arc: 18 },
        { text: 'Zamanlama sonrası top karşı yarıya yönlendirilir.', p: [208, 242], arc: 56 }
      ],
      defaultArc: 30
    },
    smash: {
      title: 'Smash',
      reason: 'Smash Vuruşu',
      desc: 'Fileye yakın pozisyonda yüksek topa hızla inen bitirici vuruş uygulanır. Amaç rakibi reaksiyon süresi olmadan puanın dışına itmektir.',
      steps: [
        { text: 'Atak oyuncusu file dibinde dengeli hazır durur.', p: [176, 250] },
        { text: 'Top omuz üstü yükseklikte temas noktasına gelir.', p: [190, 192], arc: 32 },
        { text: 'Smash ile top dik açıyla rakip zemine iner.', p: [130, 412], impact: 'court', arc: 18 },
        { text: 'Sekme sonrası top yükselmeden puan kapanır.', p: [114, 446], arc: 10 }
      ],
      defaultArc: 24
    },
    'back-glass-rebound': {
      title: 'Back-glass Rebound',
      reason: 'Back-glass Rebound',
      desc: 'Top arka camdan kontrollü dönerken zamanlama korunur ve ikinci temasla oyun tekrar karşı sahaya güvenli şekilde aktarılır.',
      steps: [
        { text: 'Top arka banda doğru derin bir çizgide ilerler.', p: [84, 528] },
        { text: 'İlk sekme zeminde alınır, rebound hattı oluşur.', p: [78, 590], impact: 'court', arc: 16 },
        { text: 'Arka camdan dönüş açısı okunur.', p: [108, 542], impact: 'wall-bottom', arc: 14 },
        { text: 'Savunma vuruşu ile top karşı yarıya taşınır.', p: [210, 264], arc: 48 }
      ],
      defaultArc: 28
    }
  };

  let key = 'serve';
  let step = 0;
  let animating = false;
  let runToken = 0;
  let speedScale = 1;
  const activeTrails = [];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function quadratic(from, control, to, t) {
    const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * control[0] + t * t * to[0];
    const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * control[1] + t * t * to[1];
    return [x, y];
  }

  function clearTrails() {
    while (activeTrails.length) {
      const node = activeTrails.pop();
      node.remove();
    }
  }

  function drawTrail(x, y, altitude = 0) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', String(Math.max(2.4, 4.8 - altitude / 55)));
    dot.setAttribute('fill', 'rgba(204,255,0,0.34)');
    dot.style.transition = 'opacity 420ms ease-out, transform 420ms ease-out';
    dot.style.transformOrigin = 'center';
    trail.appendChild(dot);
    activeTrails.push(dot);
    if (activeTrails.length > 20) {
      const old = activeTrails.shift();
      old.remove();
    }
    requestAnimationFrame(() => {
      dot.style.opacity = '0';
      dot.style.transform = 'scale(0.38)';
    });
    setTimeout(() => {
      const idx = activeTrails.indexOf(dot);
      if (idx >= 0) activeTrails.splice(idx, 1);
      dot.remove();
    }, 440);
  }

  function placeBall(p) {
    ball.setAttribute('cx', p[0]);
    ball.setAttribute('cy', p[1]);
    shadow.setAttribute('cx', p[0]);
    shadow.setAttribute('cy', p[1] + 14);
    shadow.setAttribute('rx', '9.5');
    shadow.setAttribute('ry', '4.1');
    shadow.setAttribute('opacity', '0.45');
  }

  function flashWall(which) {
    const target = which === 'wall-bottom' ? wallBottom : wallTop;
    if (!target) return;
    target.classList.remove('is-hit');
    void target.getBBox();
    target.classList.add('is-hit');
    setTimeout(() => target.classList.remove('is-hit'), 380);
  }

  function spawnRipple(x, y) {
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', x);
    ring.setAttribute('cy', y);
    ring.setAttribute('r', '4');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', 'rgba(204,255,0,0.75)');
    ring.setAttribute('stroke-width', '1.8');
    impacts.appendChild(ring);

    const dust = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dust.setAttribute('cx', x);
    dust.setAttribute('cy', y);
    dust.setAttribute('r', '3');
    dust.setAttribute('fill', 'rgba(255,248,204,0.24)');
    impacts.appendChild(dust);

    ring.style.transition = 'transform 360ms ease-out, opacity 360ms ease-out';
    dust.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out';

    requestAnimationFrame(() => {
      ring.style.transform = 'scale(5.2)';
      ring.style.opacity = '0';
      dust.style.transform = 'scale(2.8)';
      dust.style.opacity = '0';
    });

    setTimeout(() => {
      ring.remove();
      dust.remove();
    }, 380);
  }

  function animateSegment(from, to, options = {}) {
    const arcHeight = options.arc ?? motions[key].defaultArc;
    const duration = (options.duration ?? 560) / speedScale;
    const control = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - arcHeight];

    return new Promise(resolve => {
      const start = performance.now();
      const token = runToken;

      function tick(now) {
        if (token !== runToken) return resolve();
        const rawT = Math.min(1, (now - start) / duration);
        const t = easeInOut(rawT);
        const [x, y] = quadratic(from, control, to, t);
        const groundY = lerp(from[1], to[1], rawT);
        const altitude = Math.max(0, groundY - y);

        ball.setAttribute('cx', x);
        ball.setAttribute('cy', y);

        shadow.setAttribute('cx', lerp(from[0], to[0], rawT));
        shadow.setAttribute('cy', groundY + 12);
        shadow.setAttribute('rx', String(Math.max(4.8, 12 - altitude / 20)));
        shadow.setAttribute('ry', String(Math.max(2.2, 5.4 - altitude / 30)));
        shadow.setAttribute('opacity', String(Math.max(0.14, 0.5 - altitude / 180)));

        drawTrail(x, y, altitude);

        if (rawT < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(tick);
    });
  }

  function moveBallTo(p, instant = false) {
    const [x, y] = p;
    if (instant) {
      placeBall([x, y]);
      return;
    }
    animateSegment(
      [parseFloat(ball.getAttribute('cx')), parseFloat(ball.getAttribute('cy'))],
      [x, y],
      { arc: motions[key].defaultArc, duration: 520 }
    );
  }

  function renderPathGhost() {
    const m = motions[key];
    const pts = m.steps.map(s => s.p);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const arc = m.steps[i + 1].arc ?? m.defaultArc;
      const cx = (a[0] + b[0]) / 2;
      const cy = Math.min(a[1], b[1]) - arc;
      d += ` Q ${cx} ${cy} ${b[0]} ${b[1]}`;
    }
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
  }

  function renderStep() {
    const m = motions[key];
    const max = m.steps.length - 1;
    range.max = String(max);
    range.value = String(step);
    stepLabel.textContent = `Adım ${step + 1}: ${m.steps[step].text}`;
    placeBall(m.steps[step].p);
    renderInfo();
  }

  function totalMotionDuration() {
    const m = motions[key];
    let total = 0;
    for (let i = 1; i < m.steps.length; i++) {
      total += (m.steps[i].duration ?? 560);
      total += 120;
    }
    return total / speedScale;
  }

  function restartLoopTimer() {
    loopTimer.style.animation = 'none';
    loopTimer.offsetWidth;
    loopTimer.style.animation = `motionLoopTick ${Math.max(0.4, totalMotionDuration() / 1000)}s linear 1`;
    loopTimer.style.animationDuration = `${Math.max(0.4, totalMotionDuration() / 1000)}s`;
  }

  function describeSpeed(v) {
    if (v <= 0.8) return 'Yavaş';
    if (v >= 1.5) return 'Hızlı';
    return 'Normal';
  }

  function updateSpeedUi() {
    const v = Number(speed.value);
    speedScale = v;
    speedMeta.textContent = `${describeSpeed(v)} · ${v.toFixed(1)}x`;
    svg.style.setProperty('--motion-speed', String(v));
    restartLoopTimer();
  }

  async function playAll() {
    if (animating) return;
    if (step >= motions[key].steps.length - 1) {
      step = 0;
      clearTrails();
      renderStep();
    }
    animating = true;
    runToken += 1;
    const token = runToken;
    playBtn.classList.add('is-playing');
    playBtn.textContent = 'Oynatılıyor...';

    const m = motions[key];
    for (let i = step; i < m.steps.length - 1; i++) {
      if (token !== runToken) break;
      const from = m.steps[i];
      const to = m.steps[i + 1];
      step = i;
      range.value = String(step);
      stepLabel.textContent = `Adım ${step + 1}: ${from.text}`;
      await animateSegment(from.p, to.p, {
        arc: to.arc ?? m.defaultArc,
        duration: to.duration ?? 560
      });
      if (to.impact) {
        spawnRipple(to.p[0], to.p[1]);
        if (to.impact.startsWith('wall')) flashWall(to.impact);
      }
      step = i + 1;
      range.value = String(step);
      stepLabel.textContent = `Adım ${step + 1}: ${to.text}`;
      await delay(120);
    }

    animating = false;
    playBtn.classList.remove('is-playing');
    playBtn.textContent = 'Tekrar Oyna';
    renderInfo();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      key = tab.dataset.motion;
      step = 0;
      animating = false;
      runToken += 1;
      clearTrails();
      playBtn.classList.remove('is-playing');
      playBtn.textContent = 'Animasyonu Oyna';
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
    runToken += 1;
    step = Math.max(0, step - 1);
    clearTrails();
    renderStep();
  });
  nextBtn.addEventListener('click', () => {
    runToken += 1;
    step = Math.min(motions[key].steps.length - 1, step + 1);
    clearTrails();
    renderStep();
  });
  range.addEventListener('input', () => {
    runToken += 1;
    step = Number(range.value);
    clearTrails();
    renderStep();
  });

  speed.addEventListener('input', () => {
    updateSpeedUi();
    runToken += 1;
    animating = false;
    clearTrails();
    playBtn.textContent = 'Animasyonu Oyna';
    renderStep();
  });

  renderPathGhost();
  renderStep();
  updateSpeedUi();
  playBtn.textContent = 'Animasyonu Oyna';
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
