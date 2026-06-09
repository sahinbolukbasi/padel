(function () {
  'use strict';

  const POINT_LABELS = ['0', '15', '30', '40'];

  const els = {
    setupScreen: document.getElementById('setupScreen'),
    winnerScreen: document.getElementById('winnerScreen'),
    winnerName: document.getElementById('winnerName'),
    confettiCanvas: document.getElementById('confettiCanvas'),

    inputA: document.getElementById('inputTeamA'),
    inputB: document.getElementById('inputTeamB'),

    btnStart: document.getElementById('btnStartMatch'),
    btnOpenSetup: document.getElementById('btnOpenSetup'),
    btnNewMatch: document.getElementById('btnNewMatch'),
    btnUndo: document.getElementById('btnUndo'),
    btnReset: document.getElementById('btnReset'),

    teamAButton: document.getElementById('teamAButton'),
    teamBButton: document.getElementById('teamBButton'),
    teamAName: document.getElementById('teamAName'),
    teamBName: document.getElementById('teamBName'),
    teamALive: document.getElementById('teamALive'),
    teamBLive: document.getElementById('teamBLive'),

    statusText: document.getElementById('statusText'),
    metaText: document.getElementById('metaText'),
    setsBoard: document.getElementById('setsBoard'),
  };

  let state = createInitialState();
  const history = [];

  function createInitialState() {
    return {
      teamNames: ['Takım 1', 'Takım 2'],
      bestOf: 3,
      setsToWin: 2,

      started: false,
      finished: false,
      winner: null,

      currentGames: [0, 0],
      currentPoints: [0, 0],
      advantage: null,
      tiebreak: false,
      tbPoints: [0, 0],

      setResults: [],
      setWins: [0, 0],
      eventLog: [],
    };
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function formatSelection() {
    const checked = document.querySelector('input[name="matchFormat"]:checked');
    return checked ? Number(checked.value) : 3;
  }

  function openSetup() {
    els.setupScreen.classList.add('is-open');
  }

  function closeSetup() {
    els.setupScreen.classList.remove('is-open');
  }

  function resetSetupInputs() {
    els.inputA.value = '';
    els.inputB.value = '';
    const selected = document.querySelector('input[name="matchFormat"][value="3"]');
    if (selected) selected.checked = true;
  }

  function resetForNewMatch() {
    state = createInitialState();
    history.length = 0;
    resetSetupInputs();
    els.winnerScreen.classList.remove('is-open');
    els.winnerScreen.setAttribute('aria-hidden', 'true');
    stopConfetti();
    render();
    openSetup();
  }

  function beginMatch() {
    const teamA = (els.inputA.value || '').trim() || 'Takım 1';
    const teamB = (els.inputB.value || '').trim() || 'Takım 2';
    const bestOf = formatSelection();

    state = createInitialState();
    state.teamNames = [teamA, teamB];
    state.bestOf = bestOf;
    state.setsToWin = Math.ceil(bestOf / 2);
    state.started = true;
    history.length = 0;
    state.eventLog = [];

    closeSetup();
    els.winnerScreen.classList.remove('is-open');
    els.winnerScreen.setAttribute('aria-hidden', 'true');
    stopConfetti();
    render();
  }

  function addLog(message) {
    state.eventLog.push(message);
    if (state.eventLog.length > 120) state.eventLog.shift();
  }

  function saveSnapshot() {
    history.push(deepClone(state));
    if (history.length > 500) history.shift();
  }

  function undo() {
    if (!history.length || state.finished) return;
    state = history.pop();
    render();
  }

  function addPoint(teamIndex) {
    if (!state.started || state.finished) return;
    saveSnapshot();
    addLog(`${state.teamNames[teamIndex]} puan kazandı`);

    if (state.tiebreak) {
      state.tbPoints[teamIndex] += 1;
      if (didWinTiebreak(teamIndex)) {
        completeSet(teamIndex, 7, 6);
      }
      render();
      flashTeam(teamIndex);
      return;
    }

    const other = teamIndex === 0 ? 1 : 0;

    if (state.advantage !== null) {
      if (state.advantage === teamIndex) {
        winGame(teamIndex);
      } else {
        state.advantage = null;
      }
      render();
      flashTeam(teamIndex);
      return;
    }

    if (state.currentPoints[teamIndex] <= 2) {
      state.currentPoints[teamIndex] += 1;
      render();
      flashTeam(teamIndex);
      return;
    }

    if (state.currentPoints[teamIndex] === 3) {
      if (state.currentPoints[other] < 3) {
        winGame(teamIndex);
      } else {
        state.advantage = teamIndex;
      }
      render();
      flashTeam(teamIndex);
    }
  }

  function didWinTiebreak(teamIndex) {
    const self = state.tbPoints[teamIndex];
    const other = state.tbPoints[teamIndex === 0 ? 1 : 0];
    return self >= 7 && self - other >= 2;
  }

  function winGame(teamIndex) {
    state.currentGames[teamIndex] += 1;
    addLog(`${state.teamNames[teamIndex]} oyun aldı`);
    state.currentPoints = [0, 0];
    state.advantage = null;

    const a = state.currentGames[0];
    const b = state.currentGames[1];

    if (a === 6 && b === 6) {
      state.tiebreak = true;
      state.tbPoints = [0, 0];
      return;
    }

    if (isSetWonNormally()) {
      const winner = a > b ? 0 : 1;
      completeSet(winner, a, b);
    }
  }

  function isSetWonNormally() {
    const [a, b] = state.currentGames;
    if (a >= 6 || b >= 6) {
      const diff = Math.abs(a - b);
      if (diff >= 2) return true;
      if ((a === 7 && b === 5) || (b === 7 && a === 5)) return true;
    }
    return false;
  }

  function completeSet(winnerIdx, scoreA, scoreB) {
    state.setResults.push([scoreA, scoreB]);
    state.setWins[winnerIdx] += 1;
    addLog(`${state.teamNames[winnerIdx]} set aldı (${scoreA}-${scoreB})`);

    state.currentGames = [0, 0];
    state.currentPoints = [0, 0];
    state.advantage = null;
    state.tiebreak = false;
    state.tbPoints = [0, 0];

    if (state.setWins[winnerIdx] >= state.setsToWin) {
      state.finished = true;
      state.winner = winnerIdx;
      addLog(`${state.teamNames[winnerIdx]} maçı kazandı`);
      announceWinner();
    }
  }

  function livePointLabel(teamIndex) {
    if (state.tiebreak) return String(state.tbPoints[teamIndex]);
    if (state.advantage === teamIndex) return 'AD';
    if (state.advantage !== null && state.advantage !== teamIndex) return '40';
    return POINT_LABELS[state.currentPoints[teamIndex]];
  }

  function statusLine() {
    if (!state.started) return 'Maç Hazır';
    if (state.finished) return 'Maç Bitti';
    if (state.tiebreak) return 'Tie-Break';
    if (state.advantage !== null) return `Avantaj: ${state.teamNames[state.advantage]}`;
    if (state.currentPoints[0] === 3 && state.currentPoints[1] === 3) return 'Deuce';
    return 'Oyun Devam Ediyor';
  }

  function metaLine() {
    if (!state.started) return 'Kurulum bekleniyor';
    if (state.finished) return `${state.teamNames[state.winner]} maçı kazandı`;

    const completed = state.setResults.length;
    const total = state.bestOf;
    const setNo = Math.min(completed + 1, total);

    if (state.tiebreak) {
      return `${setNo}. set tie-break: ${state.tbPoints[0]}-${state.tbPoints[1]}`;
    }

    return `${setNo}. set: ${state.currentGames[0]}-${state.currentGames[1]}`;
  }

  function renderSetsBoard() {
    const totalCols = state.bestOf;
    els.setsBoard.style.setProperty('--set-cols', String(totalCols));
    let html = '';

    html += '<div class="sb-row">';
    html += '<div class="sb-cell sb-cell--header sb-cell--team">Takım</div>';
    for (let i = 0; i < totalCols; i++) {
      html += `<div class="sb-cell sb-cell--header">S${i + 1}</div>`;
    }
    html += '</div>';

    const rows = [0, 1].map(team => {
      let row = '<div class="sb-row">';
      row += `<div class="sb-cell sb-cell--team">${escapeHtml(state.teamNames[team])}</div>`;
      for (let i = 0; i < totalCols; i++) {
        const setRes = state.setResults[i];
        if (setRes) {
          const own = setRes[team];
          const opp = setRes[team === 0 ? 1 : 0];
          row += `<div class="sb-cell ${own > opp ? 'sb-cell--won' : ''}">${own}</div>`;
        } else if (!state.finished && i === state.setResults.length) {
          row += `<div class="sb-cell">${state.currentGames[team]}</div>`;
        } else {
          row += '<div class="sb-cell">-</div>';
        }
      }
      row += '</div>';
      return row;
    });

    html += rows.join('');
    els.setsBoard.innerHTML = html;
  }

  function render() {
    els.teamAName.textContent = state.teamNames[0];
    els.teamBName.textContent = state.teamNames[1];

    els.teamALive.textContent = livePointLabel(0);
    els.teamBLive.textContent = livePointLabel(1);

    els.statusText.textContent = statusLine();
    els.metaText.textContent = metaLine();

    renderSetsBoard();

    els.btnUndo.disabled = history.length === 0 || state.finished;
    els.teamAButton.disabled = !state.started || state.finished;
    els.teamBButton.disabled = !state.started || state.finished;
  }

  function announceWinner() {
    const winnerName = state.teamNames[state.winner];
    els.winnerName.textContent = `Kazanan: ${winnerName}`;
    els.winnerScreen.classList.add('is-open');
    els.winnerScreen.setAttribute('aria-hidden', 'false');
    startConfetti();
    render();
  }

  function flashTeam(teamIndex) {
    const panel = teamIndex === 0 ? els.teamAButton : els.teamBButton;
    panel.classList.remove('is-flash');
    void panel.offsetWidth;
    panel.classList.add('is-flash');
    setTimeout(() => panel.classList.remove('is-flash'), 220);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Confetti
  let confettiAnimation = null;
  const confetti = [];

  function startConfetti() {
    const canvas = els.confettiCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    confetti.length = 0;
    for (let i = 0; i < 140; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: 2 + Math.random() * 4,
        c: Math.random() > 0.5 ? '#ccff00' : '#0077b6',
        vx: -1 + Math.random() * 2,
        vy: 2 + Math.random() * 4,
        a: Math.random() * Math.PI,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of confetti) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += 0.08;
        if (p.y > canvas.height + 12) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }
      confettiAnimation = requestAnimationFrame(draw);
    };

    stopConfetti();
    draw();
    window.addEventListener('resize', resize, { once: true });
  }

  function stopConfetti() {
    if (confettiAnimation) {
      cancelAnimationFrame(confettiAnimation);
      confettiAnimation = null;
    }
    const ctx = els.confettiCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, els.confettiCanvas.width, els.confettiCanvas.height);
  }

  // events
  els.btnStart.addEventListener('click', beginMatch);
  els.btnOpenSetup.addEventListener('click', openSetup);
  els.btnNewMatch.addEventListener('click', resetForNewMatch);
  els.btnUndo.addEventListener('click', undo);

  els.btnReset.addEventListener('click', () => {
    if (confirm('Maçı sıfırlamak istediğine emin misin?')) {
      resetForNewMatch();
    }
  });

  els.teamAButton.addEventListener('click', () => addPoint(0));
  els.teamBButton.addEventListener('click', () => addPoint(1));

  render();
  openSetup();
})();
