/* Boutou — application */
(function () {
  'use strict';
  var D = window.BT_DATA, B = window.Boutou;

  /* ================= Outils ================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var S = {
    get: function (k, d) { try { var v = localStorage.getItem('bt_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('bt_' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('bt_' + k); } catch (e) {} }
  };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var dk = function (d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var calm = function () { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var buzz = function (p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  var plural = function (n, w) { return n + ' ' + w + (n > 1 ? 's' : ''); };

  /* ================= Icônes ================= */
  var I = {
    home: 'M4 11.2 12 4.8l8 6.4V19a1.6 1.6 0 0 1-1.6 1.6H15v-5.6H9v5.6H5.6A1.6 1.6 0 0 1 4 19z',
    cut: 'M9 6.5h11|M9 12h8|M9 17.5h4.5|M4.5 6.5h.01|M4.5 12h.01|M4.5 17.5h.01',
    path: 'M6 20.5c0-4.6 12-3.4 12-8.4S9.5 8.3 9.5 4.5|M16 3.5v5|M16 3.5l4 1.5-4 1.5',
    box: 'M4 8.5h16v10A1.6 1.6 0 0 1 18.4 20H5.6A1.6 1.6 0 0 1 4 18.4zM3 4.5h18v4H3z|M10 12.5h4',
    sprout: 'M12 21v-8.5|M12 12.5c0-4.2 3-6.8 7.5-6.8 0 4.2-3 6.8-7.5 6.8z|M12 14.5c0-3.2-2.6-5.4-6.5-5.4 0 3.2 2.6 5.4 6.5 5.4z',
    wind: 'M3 8.5h11a3 3 0 1 0-3-3|M3 12.5h15a3 3 0 1 1-3 3|M3 16.5h6',
    timer: 'M12 21a7.8 7.8 0 1 0 0-15.6A7.8 7.8 0 0 0 12 21z|M12 9.5v3.8l2.4 1.8|M9.8 2.6h4.4',
    wave: 'M3 10c2.2 0 2.8-2.6 5-2.6s2.8 2.6 5 2.6 2.8-2.6 5-2.6 2.6 1.5 3 2|M3 16c2.2 0 2.8-2.6 5-2.6s2.8 2.6 5 2.6 2.8-2.6 5-2.6 2.6 1.5 3 2',
    mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z|M6 11a6 6 0 0 0 12 0|M12 17v4',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6.5 6.5l11 11|M17.5 6.5l-11 11',
    chevr: 'M9.5 5.5 16 12l-6.5 6.5',
    chevl: 'M14.5 5.5 8 12l6.5 6.5',
    trash: 'M4.5 7h15|M10 11v6|M14 11v6|M6.5 7l.9 12.2A1.6 1.6 0 0 0 9 20.7h6a1.6 1.6 0 0 0 1.6-1.5L17.5 7|M9.5 7V4.3h5V7',
    split: 'M12 3.5v6|M12 9.5l-6 5.5|M12 9.5l6 5.5|M6 15v5|M18 15v5',
    star: 'M12 3.6l2.6 5.2 5.8.9-4.2 4 1 5.7L12 16.7l-5.2 2.7 1-5.7-4.2-4 5.8-.9z',
    snow: 'M12 3v18|M4.2 7.5l15.6 9|M4.2 16.5l15.6-9',
    plus: 'M12 5v14|M5 12h14',
    lock: 'M7.5 11V8.2a4.5 4.5 0 0 1 9 0V11|M5.5 11h13v9.4h-13z',
    totask: 'M4 12h12.5|M12 6.5 17.5 12 12 17.5',
    share: 'M12 3.5v11|M8 7.3l4-3.8 4 3.8|M5.5 11.5v8A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5v-8',
    eye: 'M2.5 12S6 5.6 12 5.6 21.5 12 21.5 12 18 18.4 12 18.4 2.5 12 2.5 12z|M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    play: 'M8 5.5v13l10-6.5z'
  };
  function svgI(n) { return '<svg viewBox="0 0 24 24">' + (I[n] || '').split('|').map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>'; }
  function ic(n) { return '<span class="ic" aria-hidden="true">' + svgI(n) + '</span>'; }
  function hydrate(root) {
    $$('.ic[data-i]', root).forEach(function (e) { e.innerHTML = svgI(e.getAttribute('data-i')); e.setAttribute('aria-hidden', 'true'); e.removeAttribute('data-i'); });
    $$('[data-bt]', root).forEach(function (e) { B.render(e, { pose: e.getAttribute('data-bt'), level: lvl().i }); e.removeAttribute('data-bt'); });
  }

  /* Visages de météo */
  var MOOD_COL = ['#B8C4D6', '#CAD6B6', '#F6DA8C', '#F7C152', '#F4A23A'];
  function moodFace(i) {
    var eyes = i === 4 ? '<path d="M14.5 21q2.8-3.2 5.6 0M27.9 21q2.8-3.2 5.6 0" stroke="#2A170A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
      : '<circle cx="17.5" cy="21" r="2.7" fill="#2A170A"/><circle cx="30.5" cy="21" r="2.7" fill="#2A170A"/>';
    var mouth = ['<path d="M17.5 33.5q6.5-5 13 0" stroke="#2A170A" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
      '<path d="M17 31.5q3.5-2.2 7 0t7 0" stroke="#2A170A" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
      '<path d="M18.5 31h11" stroke="#2A170A" stroke-width="2.6" stroke-linecap="round"/>',
      '<path d="M17 29q7 6.5 14 0" stroke="#2A170A" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
      '<path d="M15.5 27.5q8.5 0 17 0q-1 8-8.5 8t-8.5-8z" fill="#6E2C16"/>'][i];
    var brows = i === 0 ? '<path d="M13.5 17.4l6-1.9M34.5 17.4l-6-1.9" stroke="#2A170A" stroke-width="2.2" stroke-linecap="round"/>' : '';
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="' + MOOD_COL[i] + '"/>' +
      '<ellipse cx="17" cy="14" rx="7" ry="4" fill="#fff" opacity=".35"/>' + brows + eyes + mouth + '</svg>';
  }

  /* ================= Sons & confettis ================= */
  var AC = null;
  function actx() {
    if (!S.get('sound', true)) return null;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; }
  }
  function tone(f, t0, dur, type, vol) {
    var a = actx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
    o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol || .14, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .05);
  }
  var sound = {
    pop: function () { tone(620, 0, .12, 'triangle', .11); tone(930, .05, .16, 'sine', .07); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .085, .34, 'triangle', .11); }); },
    end: function () { [784, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .16, .55, 'sine', .15); }); },
    soft: function () { tone(392, 0, .5, 'sine', .05); tone(587, .06, .5, 'sine', .04); }
  };

  var CONF = ['#F2B33D', '#5DAE6B', '#F59BB2', '#7FD3AE', '#FFE7A6', '#EF7F7A'];
  function confetti(n) {
    if (calm()) return;
    var cv = $('#confetti'), ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr, P = [];
    for (var i = 0; i < (n || 90); i++) P.push({
      x: W / 2 + (Math.random() - .5) * W * .3, y: H * .38, vx: (Math.random() - .5) * 15 * dpr, vy: (-Math.random() * 15 - 6) * dpr,
      r: (4 + Math.random() * 5) * dpr, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: CONF[i % CONF.length], s: i % 3
    });
    var t0 = performance.now();
    (function frame(t) {
      var k = (t - t0) / 1900; ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.vy += .42 * dpr; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * k); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        if (p.s === 0) ctx.fillRect(-p.r, -p.r * .45, p.r * 2, p.r * .9);
        else if (p.s === 1) { ctx.beginPath(); ctx.arc(0, 0, p.r * .6, 0, 7); ctx.fill(); }
        else { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .45, 0, 0, 7); ctx.fill(); }
        ctx.restore();
      });
      if (k < 1) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  }

  /* ================= Toast ================= */
  var toastT = null;
  function toast(msg, action, ms) {
    var el = $('#toast');
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (action ? '<button>' + esc(action.label) + '</button>' : '');
    if (action) el.querySelector('button').onclick = function () { el.classList.remove('on'); action.fn(); };
    el.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove('on'); }, ms || (action ? 4200 : 2200));
  }

  /* ================= Données ================= */
  function migrate() {
    if (S.get('v', 1) >= 3) return;
    var moods = S.get('moods', {}), m = S.get('mood', null);
    if (m && m.d != null && m.v != null) moods[m.d] = m.v;
    S.set('moods', moods); S.del('mood');
    var tasks = S.get('tasks', []), cur = S.get('cur', null);
    if (cur && cur.title && Array.isArray(cur.steps)) {
      var t = { id: uid(), title: cur.title, c: Date.now(), parked: false,
        steps: cur.steps.map(function (s) { return { id: uid(), t: s.t, m: s.m || 2, done: !!s.done }; }) };
      t.done = t.steps.length > 0 && t.steps.every(function (s) { return s.done; });
      tasks.unshift(t); if (!t.done) S.set('curId', t.id);
    }
    S.del('cur'); S.set('tasks', tasks);
    var old = S.get('lessons', null);
    if (Array.isArray(old)) {
      var map = ['c1-1', 'c1-2', 'c1-3', 'c1-4', 'c1-5', 'c3-2'], done = [];
      old.forEach(function (i) { if (map[i] && done.indexOf(map[i]) < 0) done.push(map[i]); });
      S.set('ldone', done); S.del('lessons');
    }
    var act = S.get('active', []);
    S.get('wins', []).forEach(function (w) { if (w.d && act.indexOf(w.d) < 0) act.push(w.d); });
    var last = S.get('last', null); if (last && act.indexOf(last) < 0) act.push(last);
    S.set('active', act.sort().slice(-400)); S.del('last'); S.del('streak');
    S.set('notes', S.get('notes', []).map(function (n) { return { id: n.id || uid(), t: n.t, d: n.d || '', ts: n.ts || 0 }; }));
    if (S.get('name', '') || tasks.length || S.get('wins', []).length) S.set('onboarded', true);
    S.set('v', 3);
  }

  function markActive() { var a = S.get('active', []), d = dk(); if (a.indexOf(d) < 0) { a.push(d); S.set('active', a.slice(-400)); } }
  function activeLast7() { var a = S.get('active', []), n = 0; for (var i = 0; i < 7; i++) if (a.indexOf(dk(addDays(new Date(), -i))) >= 0) n++; return n; }

  function lvl() {
    var n = S.get('wins', []).length, L = D.LEVELS, i = 0;
    for (var k = 0; k < L.length; k++) if (n >= L[k].at) i = k;
    var next = L[i + 1] || null;
    return { i: i, n: n, name: L[i].name, next: next, p: next ? (n - L[i].at) / (next.at - L[i].at) : 1, left: next ? next.at - n : 0 };
  }

  var pendingLevel = false;
  function addWin(t, k) {
    var before = lvl().i, w = S.get('wins', []);
    w.unshift({ t: t, d: dk(), k: k || '', ts: Date.now() }); S.set('wins', w.slice(0, 600)); markActive();
    var L = lvl();
    if (L.i > before) { if ($('#layer').hidden) openLevelUp(); else pendingLevel = true; }
    var pet = $('#homePet')._m; if (pet) B.setLevel(pet, L.i);
  }

  var tasks = function () { return S.get('tasks', []); };
  var saveTasks = function (t) { S.set('tasks', t); };
  function findTask(id) { return tasks().filter(function (t) { return t.id === id; })[0] || null; }
  function curTask() {
    var ts = tasks(), id = S.get('curId', null), live = ts.filter(function (t) { return !t.done && !t.parked && t.steps.some(function (s) { return !s.done; }); });
    return live.filter(function (t) { return t.id === id; })[0] || live[0] || null;
  }
  function mutTask(id, fn) {
    var ts = tasks(), t = ts.filter(function (x) { return x.id === id; })[0];
    if (!t) return null; fn(t, ts); saveTasks(ts); return t;
  }
  function createTask(title, steps) {
    title = title.trim().replace(/\s+/g, ' ');
    var t = { id: uid(), title: title, c: Date.now(), parked: false, done: false,
      steps: (steps || D.cut(title)).map(function (s) { return { id: uid(), t: s.t, m: s.m || 2, done: false }; }) };
    var ts = tasks(); ts.unshift(t); saveTasks(ts);
    if (!curTask() || !S.get('curId', null)) S.set('curId', t.id);
    markActive(); return t;
  }
  function completeStep(taskId, stepId) {
    var finished = false, label = '';
    var t = mutTask(taskId, function (t) {
      var s = t.steps.filter(function (x) { return x.id === stepId; })[0]; if (!s || s.done) return;
      s.done = true; label = s.t;
      if (t.steps.every(function (x) { return x.done; })) { t.done = true; t.doneAt = Date.now(); finished = true; }
    });
    if (!t || !label) return;
    addWin(label, 'step');
    if (finished) {
      addWin('Tâche finie : ' + t.title, 'task');
      if (S.get('curId', null) === t.id) S.del('curId');
      sound.win(); confetti(120); buzz([30, 40, 30]); toast('Tâche terminée, bravo !');
      petReact('cheer', 'Tâche finie ! Je pousse, regarde !');
    } else { sound.pop(); buzz(15); toast('Bien joué, une miette de moins'); petReact('happy'); }
  }
  function uncompleteStep(taskId, stepId) {
    mutTask(taskId, function (t) { t.steps.forEach(function (s) { if (s.id === stepId) s.done = false; }); t.done = false; });
  }
  function splitStep(taskId, stepId) {
    mutTask(taskId, function (t) {
      var i = -1; t.steps.forEach(function (s, k) { if (s.id === stepId) i = k; });
      if (i < 0) return;
      var parts = D.split(t.steps[i]).map(function (p) { return { id: uid(), t: p.t, m: p.m, done: false }; });
      t.steps.splice.apply(t.steps, [i, 1].concat(parts));
    });
    sound.soft(); toast('Coupée en 3 miettes plus petites');
  }

  /* ================= Navigation ================= */
  var tab = 'home', openTaskId = null;
  function go(t, opts) {
    tab = t;
    $$('.view').forEach(function (v) { v.classList.toggle('on', v.id === 'v-' + t); });
    $$('#tabs button').forEach(function (b) { var on = b.getAttribute('data-t') === t; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    if (!(opts && opts.keepScroll)) window.scrollTo(0, 0);
    render();
  }
  function render() {
    if (tab === 'home') renderHome(); else if (tab === 'cut') renderCut(); else if (tab === 'learn') renderJourney();
    else if (tab === 'mem') renderMem(); else if (tab === 'me') renderMe();
  }
  function act(code) {
    switch (code) {
      case 'breathe': return openBreathe({ p: 'coh', min: 1 });
      case 'sprint': return openSprint({ min: S.get('spLen', 2) });
      case 'sprint2': return openSprint({ min: 2, auto: true });
      case 'sprint5': return openSprint({ min: 5, auto: true });
      case 'sprint25': return openSprint({ min: 25, auto: true });
      case 'sos': return openSOS();
      case 'cut': openTaskId = null; go('cut'); setTimeout(function () { $('#taskIn').focus(); }, 60); return;
      case 'mem': go('mem'); setTimeout(function () { $('#memIn').focus(); }, 60); return;
    }
  }

  /* ================= Accueil ================= */
  var MOOD_LINES = ["Je suis là. On ira doucement.", "Petit pas aujourd'hui, c'est parfait.", "On fait une miette ?", "Belle énergie, profitons-en !", "Waouh ! Pense à boire de l'eau."];
  var firstHome = true, lineIdx = -1;
  function nightTime() { var h = new Date().getHours(); return h >= 23 || h < 5; }
  function todayMood() { var m = S.get('moods', {})[dk()]; return m == null ? null : m; }
  function homePose() {
    if (nightTime()) return 'sleep';
    var m = todayMood(); return m == null ? 'idle' : D.MOODS[m].pose;
  }
  function homeLine() {
    if (nightTime()) return "Il est tard. Une miette, puis dodo ?";
    var m = todayMood(); if (m != null) return MOOD_LINES[m];
    var name = S.get('name', '');
    return firstHome ? 'Coucou' + (name ? ' ' + name : '') + ' ! Ça va aujourd\'hui ?' : D.LINES[(new Date().getDate()) % D.LINES.length];
  }
  function bubble(text) {
    var b = $('#bubble'); b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  }
  var petT = null;
  function petReact(pose, line) {
    var pet = $('#homePet')._m; if (!pet) return;
    clearTimeout(petT); B.setPose(pet, pose); B.hop(pet); if (line && tab === 'home') bubble(line);
    petT = setTimeout(function () { B.setPose(pet, homePose()); }, 1800);
  }

  function renderHome() {
    var name = S.get('name', ''), h = new Date().getHours();
    $('#hello').textContent = (h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir') + (name ? ', ' + name : '');
    $('#today').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    var pet = $('#homePet'), L = lvl();
    if (!pet._m) {
      pet._m = document.createElement('div'); pet.appendChild(pet._m);
      B.render(pet._m, { pose: firstHome && !nightTime() ? 'wave' : homePose(), level: L.i });
      if (firstHome) petT = setTimeout(function () { B.setPose(pet._m, homePose()); }, 2600);
    } else { B.setPose(pet._m, homePose()); B.setLevel(pet._m, L.i); }
    bubble(homeLine()); firstHome = false;

    var a = S.get('active', []), dots = '', n = activeLast7();
    for (var i = 6; i >= 0; i--) { var d = dk(addDays(new Date(), -i)); dots += '<i class="' + (a.indexOf(d) >= 0 ? 'on' : '') + (i === 0 ? ' today' : '') + '"></i>'; }
    $('#elan').innerHTML = (n ? 'Élan : ' + plural(n, 'jour') + ' sur 7' : 'Élan : on démarre aujourd\'hui') + '<span class="dots" aria-hidden="true">' + dots + '</span>';
    $('#levelBtn').innerHTML = '<b>' + L.name + '</b>' + (L.next ? 'encore ' + plural(L.left, 'victoire') : 'Boutou est en fleur') +
      '<span class="meter"><i style="width:' + Math.round(L.p * 100) + '%"></i></span>';
    $('#levelBtn').setAttribute('aria-label', 'Niveau ' + L.name + ', voir mon jardin');

    var m = todayMood();
    $('#moods').innerHTML = D.MOODS.map(function (x, i) {
      return '<button class="mood" role="radio" aria-checked="' + (m === i) + '" data-m="' + i + '">' + moodFace(i) + x.label + '</button>';
    }).join('');
    var out = $('#moodOut');
    if (m != null) {
      out.hidden = false;
      out.innerHTML = '<p>' + esc(D.MOODS[m].msg) + '</p><button class="btn soft small" data-act="' + D.MOODS[m].act[1] + '">' + esc(D.MOODS[m].act[0]) + '</button>';
    } else out.hidden = true;

    renderNow(); renderLessonCard();
  }

  function renderNow() {
    var c = $('#nowCard'), t = curTask();
    if (!t) {
      c.innerHTML = '<div class="empty"><div data-bt="think" style="--bt-size:78px"></div><div><h2 style="margin:0 0 4px">Rien en cours</h2><p>Quelle tâche te bloque ? Écris-la, Boutou la découpe.</p></div></div>' +
        '<div class="row"><label class="sr" for="quickIn">Tâche</label><input id="quickIn" placeholder="Ex : appeler la banque" enterkeyhint="go" autocomplete="off">' +
        '<button class="btn primary icon-only" id="quickBtn" aria-label="Découper la tâche">' + ic('cut') + '</button></div>';
      hydrate(c);
      var q = function () { var v = $('#quickIn').value.trim(); if (!v) { $('#quickIn').focus(); return toast('Écris d\'abord une tâche'); } createTask(v); sound.pop(); petReact('happy', 'Hop, découpée en miettes !'); renderNow(); };
      $('#quickBtn').onclick = q;
      $('#quickIn').onkeydown = function (e) { if (e.key === 'Enter') q(); };
      return;
    }
    var i = 0; while (t.steps[i].done) i++;
    var s = t.steps[i], done = t.steps.filter(function (x) { return x.done; }).length;
    c.innerHTML = '<div class="kicker"><span>En ce moment</span><b>Étape ' + (i + 1) + ' sur ' + t.steps.length + '</b></div>' +
      '<button class="back" style="padding:0;color:var(--mute);font-weight:500" data-open="' + t.id + '">' + esc(t.title) + '</button>' +
      '<p class="now-step">' + esc(s.t) + '</p>' +
      '<div class="bar" aria-hidden="true"><i style="width:' + (done / t.steps.length * 100) + '%"></i></div>' +
      '<button class="btn primary wide" style="margin-top:14px" data-a="go">Je m\'y mets <span class="dur">' + s.m + ' min</span></button>' +
      '<div class="split-row"><button class="btn soft" data-a="split">' + ic('split') + 'Trop gros</button><button class="btn soft" data-a="done">' + ic('check') + 'Déjà fait</button></div>';
    c.querySelector('[data-a=go]').onclick = function () { openSprint({ min: s.m, ref: { task: t.id, step: s.id }, auto: true }); };
    c.querySelector('[data-a=split]').onclick = function () { splitStep(t.id, s.id); petReact('focus', 'Plus petit, plus facile.'); renderNow(); };
    c.querySelector('[data-a=done]').onclick = function () { completeStep(t.id, s.id); renderHome(); };
    c.querySelector('[data-open]').onclick = function () { openTaskId = t.id; go('cut'); };
  }

  function allLessons() {
    var out = [];
    D.CHAPTERS.forEach(function (c, ci) { c.lessons.forEach(function (l, li) { out.push({ l: l, c: c, ci: ci, li: li }); }); });
    return out;
  }
  function nextLessonIdx() { var d = S.get('ldone', []), all = allLessons(); for (var i = 0; i < all.length; i++) if (d.indexOf(all[i].l.id) < 0) return i; return -1; }

  function renderLessonCard() {
    var c = $('#lessonCard'), i = nextLessonIdx(), all = allLessons();
    if (i < 0) {
      c.innerHTML = '<div><small>Le voyage</small><h3>Voyage terminé, bravo !</h3><span class="go">Relire mes leçons ' + ic('chevr') + '</span></div><div data-bt="cheer"></div>';
      c.onclick = function () { go('learn'); };
    } else {
      var x = all[i];
      c.innerHTML = '<div><small>Leçon du jour, chapitre ' + (x.ci + 1) + '</small><h3>' + esc(x.l.title) + '</h3><span class="go">' + (i === 0 ? 'Commencer le voyage' : 'Continuer le voyage') + ' ' + ic('chevr') + '</span></div><div data-bt="' + (x.l.pose || 'think') + '"></div>';
      c.onclick = function () { openLesson(x.l.id); };
    }
    hydrate(c);
  }

  /* ================= Découper ================= */
  function ring(p, size) {
    var r = 15, C = 2 * Math.PI * r;
    return '<svg class="ring" width="' + (size || 40) + '" height="' + (size || 40) + '" viewBox="0 0 40 40" aria-hidden="true" style="transform:rotate(-90deg)">' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="var(--soft)" stroke-width="5"/>' +
      '<circle cx="20" cy="20" r="' + r + '" fill="none" stroke="var(--leaf)" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - p)) + '"/></svg>';
  }
  function taskItem(t, cur) {
    var d = t.steps.filter(function (s) { return s.done; }).length, n = t.steps.length;
    return '<button class="task' + (t.parked ? ' parked' : '') + (t.done ? ' done' : '') + '" data-open="' + t.id + '">' + ring(n ? d / n : 0) +
      '<span><b>' + esc(t.title) + '</b><small>' + (t.done ? 'Terminée' : t.parked ? 'Au frigo, ' + d + ' sur ' + n : d + ' étape' + (d > 1 ? 's' : '') + ' faite' + (d > 1 ? 's' : '') + ' sur ' + n) + '</small></span>' +
      (cur ? '<span class="star" title="Tâche du moment">' + ic('star') + '</span>' : '') + '</button>';
  }
  function renderCut() {
    if (openTaskId && findTask(openTaskId)) return renderTaskView(openTaskId);
    openTaskId = null; $('#cutList').hidden = false; $('#taskView').hidden = true;
    var ts = tasks(), cur = curTask(), html = '';
    var live = ts.filter(function (t) { return !t.done && !t.parked; }), parked = ts.filter(function (t) { return !t.done && t.parked; }), done = ts.filter(function (t) { return t.done; });
    if (cur) live.sort(function (a, b) { return (b.id === cur.id) - (a.id === cur.id); });
    if (!ts.length) html = '<div class="card empty" style="margin-top:18px"><div data-bt="idle" style="--bt-size:78px"></div><p>Tes tâches découpées apparaîtront ici. Commence par la plus agaçante.</p></div>';
    if (live.length) html += '<h3 class="list-title">Tes tâches</h3>' + live.map(function (t) { return taskItem(t, cur && cur.id === t.id); }).join('');
    if (parked.length) html += '<h3 class="list-title">Au frigo</h3>' + parked.map(function (t) { return taskItem(t); }).join('');
    if (done.length) html += '<details><summary class="list-title">Terminées (' + done.length + ')</summary>' + done.slice(0, 20).map(function (t) { return taskItem(t); }).join('') + '</details>';
    var box = $('#taskLists'); box.innerHTML = html; hydrate(box);
    $$('[data-open]', box).forEach(function (b) { b.onclick = function () { openTaskId = b.getAttribute('data-open'); renderCut(); window.scrollTo(0, 0); }; });
  }
  function doCut() {
    var v = $('#taskIn').value.trim();
    if (!v) { $('#taskIn').focus(); return toast('Écris d\'abord une tâche'); }
    var t = createTask(v); $('#taskIn').value = ''; sound.pop();
    openTaskId = t.id; renderCut(); window.scrollTo(0, 0);
  }

  var DURS = [1, 2, 3, 5, 10, 15, 20, 25];
  function renderTaskView(id) {
    var t = findTask(id); if (!t) { openTaskId = null; return renderCut(); }
    $('#cutList').hidden = true; var v = $('#taskView'); v.hidden = false;
    var cur = curTask(), isCur = cur && cur.id === t.id, d = t.steps.filter(function (s) { return s.done; }).length, n = t.steps.length;
    var ni = -1; t.steps.some(function (s, k) { if (!s.done) { ni = k; return true; } return false; });
    var s = ni >= 0 ? t.steps[ni] : null;
    var html = '<button class="back" data-a="back">' + ic('chevl') + 'Tes tâches</button>' +
      '<label class="sr" for="titleIn">Titre</label><input class="title-in" id="titleIn" value="' + esc(t.title) + '" enterkeyhint="done">' +
      '<div class="kicker" style="margin:4px 2px 0"><span>' + d + ' sur ' + n + ' étapes faites</span>' + (t.parked ? '<b>Au frigo</b>' : isCur ? '<b>Tâche du moment</b>' : '') + '</div>' +
      '<div class="bar" style="margin:8px 2px 0"><i style="width:' + (n ? d / n * 100 : 0) + '%"></i></div>';
    if (s) {
      html += '<div class="focus-step"><div class="kicker"><span class="num">' + (ni + 1) + '</span><span class="chip">' + ic('timer') + s.m + ' min</span></div>' +
        '<p class="now-step">' + esc(s.t) + '</p>' +
        '<button class="btn primary wide" style="margin-top:12px" data-a="go">Je m\'y mets <span class="dur">' + s.m + ' min</span></button>' +
        '<div class="split-row"><button class="btn soft" data-a="split">' + ic('split') + 'Trop gros</button><button class="btn soft" data-a="done">' + ic('check') + 'Déjà fait</button></div></div>';
    } else if (n) {
      html += '<div class="focus-step" style="text-align:center"><div data-bt="cheer" style="--bt-size:120px"></div><p class="now-step">Tâche terminée !</p><p class="date">Chaque miette a compté.</p></div>';
    }
    html += '<h3 class="list-title">Toutes les miettes</h3><div class="card" style="margin-top:0"><ol class="steps">' +
      t.steps.map(function (x, k) {
        return '<li class="step' + (x.done ? ' done' : '') + '" data-s="' + x.id + '">' +
          '<button class="chk" data-a="tick" aria-label="' + (x.done ? 'Décocher' : 'Cocher') + ' l\'étape ' + (k + 1) + '">' + ic('check') + '</button>' +
          '<span class="txt" data-a="edit" aria-label="Étape ' + (k + 1) + ', modifiable">' + esc(x.t) + '</span>' +
          '<span class="side"><button class="chip" data-a="dur" aria-label="Durée ' + x.m + ' minutes, changer">' + x.m + ' min</button>' +
          '<span class="mini">' + (x.done ? '' : '<button data-a="splitk" aria-label="Couper cette étape">' + ic('split') + '</button>') +
          '<button data-a="del" aria-label="Supprimer l\'étape">' + ic('trash') + '</button></span></span></li>';
      }).join('') + '</ol>' +
      '<div class="add-step"><label class="sr" for="stepIn">Nouvelle miette</label><input id="stepIn" placeholder="Ajouter une miette" enterkeyhint="done" autocomplete="off">' +
      '<label class="sr" for="stepMin">Durée</label><select id="stepMin">' + DURS.map(function (m) { return '<option value="' + m + '"' + (m === 2 ? ' selected' : '') + '>' + m + ' min</option>'; }).join('') + '</select>' +
      '<button class="btn soft icon-only" data-a="add" aria-label="Ajouter la miette">' + ic('plus') + '</button></div></div>' +
      '<div class="task-actions">' +
      (t.done ? '' : (isCur ? '<button class="btn ghost" disabled>' + ic('star') + 'Tâche du moment</button>' : '<button class="btn soft" data-a="cur">' + ic('star') + 'Pour maintenant</button>') +
        '<button class="btn soft" data-a="park">' + ic('snow') + (t.parked ? 'Ressortir' : 'Au frigo') + '</button>') +
      '<button class="btn danger full" data-a="deltask">' + ic('trash') + 'Supprimer la tâche</button></div>';
    v.innerHTML = html; hydrate(v);

    var on = function (a, fn) { $$('[data-a=' + a + ']', v).forEach(function (b) { b.onclick = fn; }); };
    on('back', function () { openTaskId = null; renderCut(); });
    on('go', function () { openSprint({ min: s.m, ref: { task: t.id, step: s.id }, auto: true }); });
    on('split', function () { splitStep(t.id, s.id); renderTaskView(id); });
    on('done', function () { completeStep(t.id, s.id); renderTaskView(id); });
    on('cur', function () { S.set('curId', t.id); mutTask(t.id, function (x) { x.parked = false; }); toast('C\'est ta tâche du moment'); renderTaskView(id); });
    on('park', function () { var p = !t.parked; mutTask(t.id, function (x) { x.parked = p; }); if (p && S.get('curId', null) === t.id) S.del('curId'); toast(p ? 'Au frigo : elle t\'attend au frais' : 'Ressortie du frigo'); renderTaskView(id); });
    on('deltask', function () {
      var all = tasks(), idx = all.findIndex(function (x) { return x.id === t.id; }), saved = all[idx];
      all.splice(idx, 1); saveTasks(all); openTaskId = null; renderCut();
      toast('Tâche supprimée', { label: 'Annuler', fn: function () { var a2 = tasks(); a2.splice(idx, 0, saved); saveTasks(a2); openTaskId = saved.id; renderCut(); } });
    });
    var addStep = function () {
      var inp = $('#stepIn'), tx = inp.value.trim(); if (!tx) return inp.focus();
      var m = +$('#stepMin').value || 2;
      mutTask(t.id, function (x) { x.steps.push({ id: uid(), t: tx, m: m, done: false }); x.done = false; });
      renderTaskView(id); $('#stepIn').focus();
    };
    on('add', addStep);
    $('#stepIn').onkeydown = function (e) { if (e.key === 'Enter') addStep(); };
    $('#titleIn').onchange = function () { var nt = this.value.trim(); if (nt) mutTask(t.id, function (x) { x.title = nt; }); };
    $('#titleIn').onkeydown = function (e) { if (e.key === 'Enter') this.blur(); };

    $$('.step', v).forEach(function (li) {
      var sid = li.getAttribute('data-s');
      li.querySelector('[data-a=tick]').onclick = function () {
        var st = t.steps.filter(function (x) { return x.id === sid; })[0];
        if (st.done) uncompleteStep(t.id, sid); else completeStep(t.id, sid);
        renderTaskView(id);
      };
      li.querySelector('[data-a=dur]').onclick = function () {
        mutTask(t.id, function (x) { x.steps.forEach(function (st) { if (st.id === sid) st.m = DURS[(DURS.indexOf(st.m) + 1) % DURS.length] || 2; }); });
        renderTaskView(id);
      };
      var sp = li.querySelector('[data-a=splitk]'); if (sp) sp.onclick = function () { splitStep(t.id, sid); renderTaskView(id); };
      li.querySelector('[data-a=del]').onclick = function () {
        var keep = null, pos = -1;
        mutTask(t.id, function (x) { x.steps.forEach(function (st, k) { if (st.id === sid) { keep = st; pos = k; } }); x.steps.splice(pos, 1); x.done = x.steps.length > 0 && x.steps.every(function (z) { return z.done; }); });
        renderTaskView(id);
        toast('Miette supprimée', { label: 'Annuler', fn: function () { mutTask(t.id, function (x) { x.steps.splice(pos, 0, keep); }); renderTaskView(id); } });
      };
      var tx = li.querySelector('.txt');
      try { tx.contentEditable = 'plaintext-only'; } catch (e) { tx.contentEditable = 'true'; }
      if (tx.contentEditable !== 'plaintext-only') tx.contentEditable = 'true';
      tx.setAttribute('role', 'textbox');
      tx.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); tx.blur(); } };
      tx.onblur = function () { var nt = tx.textContent.trim(); if (!nt) { tx.textContent = t.steps.filter(function (x) { return x.id === sid; })[0].t; return; } mutTask(t.id, function (x) { x.steps.forEach(function (st) { if (st.id === sid) st.t = nt; }); }); };
    });
  }

  /* ================= Voyage ================= */
  var OFFS = [0, 1, 2, 1, 0, -1, -2, -1];
  function renderJourney() {
    var done = S.get('ldone', []), all = allLessons(), ni = nextLessonIdx(), total = all.length;
    $('#journeyProg').innerHTML = '<div class="bar"><i style="width:' + (done.length / total * 100) + '%"></i></div><b>' + done.length + ' sur ' + total + ' leçons</b>';
    var g = 0, html = '';
    D.CHAPTERS.forEach(function (c, ci) {
      var cd = c.lessons.filter(function (l) { return done.indexOf(l.id) >= 0; }).length;
      html += '<div class="chapter"><div class="chapter-head"><div><small>Chapitre ' + (ci + 1) + '</small><h3>' + esc(c.name) + '</h3></div><span class="count">' + cd + '/' + c.lessons.length + '</span></div><div class="path">';
      c.lessons.forEach(function (l, li) {
        var isDone = done.indexOf(l.id) >= 0, isCur = g === ni, locked = !isDone && ni >= 0 && g > ni, off = OFFS[g % OFFS.length];
        html += '<div class="node-wrap ' + (off >= 0 ? 'l' : 'r') + '" style="transform:translateX(' + off * 34 + 'px)">' +
          (isCur ? '<div data-bt="' + (off >= 0 ? 'wave' : 'happy') + '"></div>' : '') +
          '<button class="node' + (isDone ? ' done' : isCur ? ' cur' : '') + '" data-l="' + l.id + '" data-lock="' + (locked ? 1 : 0) + '" aria-label="Leçon ' + (li + 1) + ' : ' + esc(l.title) + (isDone ? ', terminée' : locked ? ', verrouillée' : '') + '">' +
          (isDone ? ic('check') : locked ? ic('lock') : (li + 1)) + '</button><span class="node-label">' + esc(l.title) + '</span></div>';
        g++;
      });
      html += '</div></div>';
    });
    var j = $('#journey'); j.innerHTML = html; hydrate(j);
    $$('.node', j).forEach(function (b) {
      b.onclick = function () {
        if (b.getAttribute('data-lock') === '1') { var x = all[ni]; return toast('Termine d\'abord « ' + x.l.title + ' »'); }
        openLesson(b.getAttribute('data-l'));
      };
    });
    if (ni > 0) { var cn = $('.node.cur', j); if (cn && cn.scrollIntoView) setTimeout(function () { cn.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' }); }, 120); }
  }

  /* ================= Mémoire ================= */
  function noteDate(n) {
    if (!n.ts) return n.d || '';
    var d = new Date(n.ts), k = dk(d), hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (k === dk()) return 'Aujourd\'hui, ' + hm;
    if (k === dk(addDays(new Date(), -1))) return 'Hier, ' + hm;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }
  function addNote() {
    var v = $('#memIn').value.trim(); if (!v) { $('#memIn').focus(); return toast('Écris d\'abord quelque chose'); }
    var n = S.get('notes', []); n.unshift({ id: uid(), t: v, ts: Date.now() }); S.set('notes', n.slice(0, 1000));
    $('#memIn').value = ''; markActive(); sound.pop(); toast('Rangé dans la mémoire'); renderMem();
  }
  function renderMem() {
    var all = S.get('notes', []), q = ($('#memSearch').value || '').trim().toLowerCase();
    $('#memSearch').hidden = all.length < 7;
    var list = q ? all.filter(function (n) { return n.t.toLowerCase().indexOf(q) >= 0; }) : all, box = $('#notes');
    if (!all.length) box.innerHTML = '<div class="card empty"><div data-bt="think" style="--bt-size:78px"></div><p>Rien pour l\'instant. Note ici tout ce qui encombre ta tête : idées, choses à faire, rendez-vous.</p></div>';
    else if (!list.length) box.innerHTML = '<p class="date" style="padding:8px 4px">Aucune note ne contient « ' + esc(q) + ' ».</p>';
    else box.innerHTML = list.map(function (n) {
      return '<div class="note" data-n="' + n.id + '"><p>' + esc(n.t) + '<small>' + esc(noteDate(n)) + '</small></p><span class="mini">' +
        '<button data-a="task" aria-label="En faire une tâche">' + ic('totask') + '</button><button data-a="del" aria-label="Supprimer la note">' + ic('trash') + '</button></span></div>';
    }).join('');
    hydrate(box);
    $$('.note', box).forEach(function (el) {
      var id = el.getAttribute('data-n');
      el.querySelector('[data-a=del]').onclick = function () {
        var ns = S.get('notes', []), i = ns.findIndex(function (x) { return x.id === id; }), keep = ns[i];
        ns.splice(i, 1); S.set('notes', ns); renderMem();
        toast('Note supprimée', { label: 'Annuler', fn: function () { var a = S.get('notes', []); a.splice(i, 0, keep); S.set('notes', a); renderMem(); } });
      };
      el.querySelector('[data-a=task]').onclick = function () {
        var ns = S.get('notes', []), n = ns.filter(function (x) { return x.id === id; })[0];
        S.set('notes', ns.filter(function (x) { return x.id !== id; }));
        var t = createTask(n.t.split('\n')[0].slice(0, 140)); sound.pop(); toast('Transformée en tâche découpée');
        openTaskId = t.id; go('cut');
      };
    });
  }

  /* ================= Jardin (Moi) ================= */
  function renderMe() {
    var L = lvl(), wins = S.get('wins', []), done = S.get('ldone', []).length, total = allLessons().length;
    $('#meSub').textContent = 'Chaque victoire fait pousser Boutou.';
    var hero = $('#meHero');
    hero.innerHTML = '<div data-bt="happy"></div><div><b>' + L.name + '</b><p>' + (L.next ? 'Encore ' + plural(L.left, 'victoire') + ' avant « ' + L.next.name + ' »' : 'Niveau maximum. Boutou rayonne.') + '</p><span class="meter"><i style="width:' + Math.round(L.p * 100) + '%"></i></span></div>';
    hydrate(hero);
    $('#stats').innerHTML = '<div class="stat"><b>' + wins.length + '</b><span>victoires</span></div><div class="stat"><b>' + activeLast7() + '/7</b><span>jours actifs</span></div><div class="stat"><b>' + done + '/' + total + '</b><span>leçons</span></div>';

    var moods = S.get('moods', {}), cols = '', max = 3, counts = [];
    for (var i = 6; i >= 0; i--) { var k = dk(addDays(new Date(), -i)); var c = wins.filter(function (w) { return w.d === k; }).length; counts.push([k, c, i]); if (c > max) max = c; }
    counts.forEach(function (x) {
      var day = new Date(x[0] + 'T12:00:00'), lab = 'DLMMJVS'.charAt(day.getDay()), m = moods[x[0]];
      cols += '<div class="wcol' + (x[2] === 0 ? ' today' : '') + '" title="' + x[1] + ' victoire(s)"><div class="wbar"><i style="height:' + (x[1] / max * 100) + '%"></i></div>' +
        (m != null ? moodFace(m) : '<span class="nomood"></span>') + '<span>' + lab + '</span></div>';
    });
    $('#week').innerHTML = cols;
    $('#week').setAttribute('aria-label', 'Victoires des 7 derniers jours : ' + counts.map(function (x) { return x[1]; }).join(', '));

    var wb = $('#wins');
    if (!wins.length) wb.innerHTML = '<p class="date">Tes victoires apparaîtront ici. Une étape cochée, un sprint, une leçon : tout compte.</p>';
    else {
      var html = '', lastD = '';
      wins.slice(0, 40).forEach(function (w) {
        if (w.d !== lastD) {
          lastD = w.d;
          var lab = w.d === dk() ? 'Aujourd\'hui' : w.d === dk(addDays(new Date(), -1)) ? 'Hier' : new Date(w.d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          html += '<p class="win-day">' + esc(lab.charAt(0).toUpperCase() + lab.slice(1)) + '</p>';
        }
        html += '<div class="win">' + ic('check') + '<span>' + esc(w.t) + '</span></div>';
      });
      wb.innerHTML = html;
    }

    $('#nameIn').value = S.get('name', '');
    $('#soundIn').checked = S.get('sound', true);
    var th = S.get('theme', 'auto');
    $$('#themeSeg button').forEach(function (b) { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', b.getAttribute('data-v') === th); });
    var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var standalone = navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    var inst = $('#installCard');
    inst.hidden = !(ios && !standalone);
    if (!inst.hidden) inst.innerHTML = ic('share') + '<p>Installe Boutou sur ton iPhone : touche Partager, puis « Sur l\'écran d\'accueil ».</p>';
  }
  function applyTheme(v) {
    var r = document.documentElement;
    if (v === 'light' || v === 'dark') r.setAttribute('data-theme', v); else r.removeAttribute('data-theme');
    var col = v === 'dark' ? '#0F1613' : v === 'light' ? '#EEF2EA' : null;
    $$('meta[name=theme-color]').forEach(function (m, i) { m.setAttribute('content', col || (i ? '#0F1613' : '#EEF2EA')); });
  }

  /* ================= Calques ================= */
  var layerClean = null;
  function openLayer(cls, build) {
    var L = $('#layer');
    if (layerClean) { try { layerClean(); } catch (e) {} layerClean = null; }
    L.className = 'layer' + (cls ? ' ' + cls : ''); L.hidden = false; L.innerHTML = '';
    document.body.classList.add('layer-open');
    layerClean = build(L) || null; hydrate(L); L.scrollTop = 0;
    var f = L.querySelector('.sheet-foot .btn, .x'); if (f && window.matchMedia && matchMedia('(pointer: fine)').matches) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 50);
  }
  function closeLayer(after) {
    var L = $('#layer'); if (L.hidden) { if (after) after(); return; }
    if (layerClean) { try { layerClean(); } catch (e) {} layerClean = null; }
    L.classList.add('closing');
    setTimeout(function () {
      L.hidden = true; L.className = 'layer'; L.innerHTML = ''; document.body.classList.remove('layer-open');
      render();
      if (after) after();
      if (pendingLevel) { pendingLevel = false; openLevelUp(); }
    }, calm() ? 0 : 240);
  }
  function sheet(title, body, foot, opts) {
    return '<div class="sheet' + (opts && opts.cls ? ' ' + opts.cls : '') + '"><div class="sheet-top"><span class="f-d" style="font-size:17px">' + (title || '') + '</span>' +
      '<button class="x" data-a="close" aria-label="Fermer">' + ic('x') + '</button></div>' +
      '<div class="sheet-body">' + body + '</div><div class="sheet-foot">' + (foot || '') + '</div></div>';
  }
  function bindClose(L) { $$('[data-a=close]', L).forEach(function (b) { b.onclick = function () { closeLayer(); }; }); }

  /* ----- Sprint ----- */
  var SP = null, spInt = null, wake = null;
  function lockScreen() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }).catch(function () {}); } catch (e) {} }
  function unlockScreen() { try { if (wake) wake.release(); } catch (e) {} wake = null; }
  function fmt(s) { s = Math.max(0, s); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function spSave() { if (SP) S.set('sprint', SP); else S.del('sprint'); }
  function spLeft() { return SP.running ? Math.max(0, Math.ceil((SP.end - Date.now()) / 1000)) : SP.left; }
  function refStep() {
    if (!SP || !SP.ref) return null;
    var t = findTask(SP.ref.task); if (!t) return null;
    var s = t.steps.filter(function (x) { return x.id === SP.ref.step; })[0];
    return s ? { t: t, s: s } : null;
  }

  function openSprint(o) {
    o = o || {};
    if (!o.resume) SP = { len: (o.min || 2) * 60, left: (o.min || 2) * 60, end: 0, running: false, ref: o.ref || null };
    openLayer('', function (L) {
      var rs = refStep(), C = 2 * Math.PI * 52;
      L.innerHTML = sheet('Sprint',
        (rs ? '<p class="date" style="margin:0">' + esc(rs.t.title) + '</p><p class="sprint-for">' + esc(rs.s.t) + '</p>' : '<p class="lead">Juste commencer. Tu as le droit d\'arrêter après.</p>') +
        '<div class="ring-wrap"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" id="spRing" cx="60" cy="60" r="52" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg>' +
        '<div class="ring-in"><div id="spPet"></div><div class="clock" id="spClock" role="timer" aria-live="off">' + fmt(spLeft()) + '</div></div></div>' +
        '<div class="chips" id="spPresets" role="radiogroup" aria-label="Durée">' + [2, 5, 10, 25].map(function (m) { return '<button role="radio" data-m="' + m + '" aria-checked="' + (SP.len === m * 60) + '">' + m + ' min</button>'; }).join('') + '</div>' +
        '<div class="adjust" id="spAdj" hidden><button class="btn ghost small" data-d="-60">− 1 min</button><button class="btn ghost small" data-d="60">+ 1 min</button></div>',
        '<button class="btn primary wide" id="spMain">Démarrer</button><button class="btn ghost wide" id="spStop" hidden>Arrêter</button>');
      B.render($('#spPet', L), { pose: 'focus', level: lvl().i });
      bindClose(L);
      $$('#spPresets button', L).forEach(function (b) {
        b.onclick = function () { var m = +b.getAttribute('data-m'); SP.len = SP.left = m * 60; S.set('spLen', m); spPaint(); sound.soft(); };
      });
      $$('#spAdj button', L).forEach(function (b) {
        b.onclick = function () {
          var left = spLeft(), nl = Math.max(5, left + +b.getAttribute('data-d')), diff = nl - left;
          SP.len = Math.max(nl, SP.len + diff); if (SP.running) SP.end = Date.now() + nl * 1000; else SP.left = nl;
          spSave(); spPaint();
        };
      });
      $('#spMain', L).onclick = function () { if (SP.running) spPause(); else spStart(); };
      $('#spStop', L).onclick = spStopEarly;
      spPaint();
      if (o.auto && !SP.running && !o.resume) spStart();
      if (o.resume && SP.running) { spTickLoop(); lockScreen(); }
      var mine = SP;
      return function () { clearInterval(spInt); spInt = null; unlockScreen(); document.title = 'Boutou'; if (SP && SP === mine && !SP.running) { SP = null; spSave(); } };
    });
  }
  function spStart() {
    actx(); SP.end = Date.now() + SP.left * 1000; SP.running = true; spSave(); lockScreen(); buzz(20);
    var p = $('#spPet'); if (p) { B.setPose(p, 'focus'); B.hop(p); }
    spTickLoop(); spPaint();
  }
  function spPause() { SP.left = spLeft(); SP.running = false; spSave(); clearInterval(spInt); spInt = null; unlockScreen(); spPaint(); var p = $('#spPet'); if (p) B.setPose(p, 'calm'); }
  function spTickLoop() { clearInterval(spInt); spInt = setInterval(function () { if (spLeft() <= 0) spFinish(); else spPaint(); }, 250); }
  function spPaint() {
    if (!SP) return;
    var left = spLeft(), C = 2 * Math.PI * 52, ring = $('#spRing'), clock = $('#spClock');
    if (!ring) return;
    ring.style.strokeDashoffset = C * (1 - left / SP.len);
    clock.textContent = fmt(left);
    document.title = SP.running ? fmt(left) + ' · Boutou' : 'Boutou';
    var started = SP.running || left < SP.len;
    $('#spMain').textContent = SP.running ? 'Pause' : started ? 'Reprendre' : 'Démarrer';
    $('#spStop').hidden = !started;
    $('#spPresets').hidden = started;
    $('#spAdj').hidden = !started;
    $$('#spPresets button').forEach(function (b) { b.setAttribute('aria-checked', SP.len === +b.getAttribute('data-m') * 60); });
  }
  function spStopEarly() {
    var spent = SP.len - spLeft(), m = Math.max(1, Math.round(spent / 60));
    SP.running = false; spSave();
    if (spent >= 30) { addWin('Démarré : ' + plural(m, 'minute') + ' de sprint', 'sprint'); toast('Tu as commencé : c\'est gagné.'); }
    SP = null; spSave(); closeLayer();
  }
  function spFinish() {
    clearInterval(spInt); spInt = null; unlockScreen();
    var mins = Math.max(1, Math.round(SP.len / 60)), rs = refStep();
    SP.running = false; SP.left = 0; var ref = SP.ref; SP = null; spSave();
    document.title = 'Boutou';
    addWin('Sprint de ' + plural(mins, 'minute'), 'sprint');
    sound.end(); buzz([200, 100, 200]); confetti();
    var L = $('#layer');
    var stepOpen = rs && !rs.s.done;
    L.innerHTML = sheet('Sprint',
      '<div data-bt="cheer" style="--bt-size:180px"></div><h2>Sprint fini !</h2><p class="lead">' + (stepOpen ? 'Cette miette est faite ?<br><b>' + esc(rs.s.t) + '</b>' : plural(mins, 'minute') + ' de concentration. Ça compte.') + '</p>',
      stepOpen ? '<button class="btn primary wide" data-a="yes">' + ic('check') + 'Oui, je coche</button><button class="btn soft wide" data-a="more">Pas encore : 2 minutes de plus</button>'
        : '<button class="btn primary wide" data-a="close2">Terminer</button><button class="btn soft wide" data-a="more">Encore 2 minutes</button>');
    hydrate(L); bindClose(L);
    var b;
    if ((b = $('[data-a=yes]', L))) b.onclick = function () { completeStep(ref.task, ref.step); closeLayer(); };
    if ((b = $('[data-a=close2]', L))) b.onclick = function () { closeLayer(); };
    $('[data-a=more]', L).onclick = function () { openSprint({ min: 2, ref: ref, auto: true }); };
  }

  /* ----- Respiration ----- */
  function openBreathe(o) {
    o = o || {};
    var pid = o.p || S.get('breath', 'coh'), min = o.min || S.get('breathMin', 1), timers = [], running = false;
    openLayer('night', function (L) {
      var paintSetup = function () {
        var P = D.BREATHS.filter(function (x) { return x.id === pid; })[0] || D.BREATHS[0];
        L.innerHTML = sheet('Respirer',
          '<div class="orb" id="orb"><div id="brPet"></div></div><p class="phase" id="phase">Prêt ?</p><p class="phase-n" id="phaseN">' + esc(P.hint) + '</p>' +
          '<div class="chips" role="radiogroup" aria-label="Rythme">' + D.BREATHS.map(function (x) { return '<button role="radio" data-p="' + x.id + '" aria-checked="' + (x.id === pid) + '">' + x.name + '</button>'; }).join('') + '</div>' +
          '<div class="chips" role="radiogroup" aria-label="Durée">' + [1, 3, 5].map(function (m) { return '<button role="radio" data-min="' + m + '" aria-checked="' + (m === min) + '">' + m + ' min</button>'; }).join('') + '</div>',
          '<button class="btn primary wide" id="brGo">Commencer</button>');
        hydrate(L); bindClose(L);
        B.render($('#brPet', L), { pose: 'calm', level: lvl().i });
        $$('[data-p]', L).forEach(function (b) { b.onclick = function () { pid = b.getAttribute('data-p'); S.set('breath', pid); sound.soft(); paintSetup(); }; });
        $$('[data-min]', L).forEach(function (b) { b.onclick = function () { min = +b.getAttribute('data-min'); S.set('breathMin', min); paintSetup(); }; });
        $('#brGo', L).onclick = function () { start(P); };
      };
      var start = function (P) {
        running = true; actx(); lockScreen();
        var endAt = Date.now() + min * 60000, orb = $('#orb'), ph = $('#phase'), pn = $('#phaseN'), k = 0;
        $$('.chips', L).forEach(function (c) { c.remove(); });
        $('.sheet-foot', L).innerHTML = '<button class="btn ghost wide" id="brStop">Arrêter</button>';
        $('#brStop').onclick = function () { closeLayer(); };
        var next = function () {
          if (Date.now() >= endAt && k % P.seq.length === 0) return finish();
          var st = P.seq[k % P.seq.length], dur = st[1]; k++;
          ph.textContent = st[0]; buzz(st[0] === 'Garde' ? 10 : 35);
          if (st[0] !== 'Garde') { orb.style.transitionDuration = dur + 's'; orb.style.transform = st[2] ? 'scale(1.12)' : 'scale(.78)'; tone(st[2] ? 440 : 330, 0, .5, 'sine', .035); }
          var c = dur; pn.textContent = c;
          var cd = setInterval(function () { c--; if (c > 0) pn.textContent = c; else clearInterval(cd); }, 1000);
          timers.push(cd); timers.push(setTimeout(next, dur * 1000));
        };
        next();
      };
      var finish = function () {
        running = false; unlockScreen();
        addWin('Respiration ' + plural(min, 'minute'), 'breath'); sound.soft();
        $('#orb').style.transitionDuration = '1.2s'; $('#orb').style.transform = 'scale(.9)';
        B.setPose($('#brPet'), 'happy');
        $('#phase').textContent = 'Bien respiré';
        $('#phaseN').textContent = 'Ton corps a reçu le message : on ralentit.';
        $('.sheet-foot', L).innerHTML = '<button class="btn primary wide" id="brEnd">Terminer</button>';
        $('#brEnd').onclick = function () { closeLayer(); };
      };
      paintSetup();
      if (o.auto) start(D.BREATHS.filter(function (x) { return x.id === pid; })[0]);
      return function () { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); if (running) unlockScreen(); };
    });
  }

  /* ----- Ça déborde ----- */
  function openSOS() {
    openLayer('', function (L) {
      L.innerHTML = sheet('',
        '<div data-bt="tender" style="--bt-size:150px"></div><h2>Ça déborde ?</h2><p class="lead">On ralentit ensemble. Choisis une seule chose.</p>' +
        '<div class="sos-list">' +
        '<button class="sos-opt" data-a="breathe">' + ic('wind') + '<span><b>Respirer une minute</b><small>5 secondes pour inspirer, 5 pour expirer</small></span></button>' +
        '<button class="sos-opt" data-a="ground">' + ic('eye') + '<span><b>Ancrage 5-4-3-2-1</b><small>Revenir dans la pièce, sens par sens</small></span></button>' +
        '<button class="sos-opt" data-a="dump">' + ic('box') + '<span><b>Vider ma tête</b><small>Tout écrire, sans trier</small></span></button>' +
        '<button class="sos-opt" data-a="crumb">' + ic('sprout') + '<span><b>Une seule miette</b><small>La plus petite étape possible, rien d\'autre</small></span></button>' +
        '</div><p class="fine">Si tu te sens en danger ou que tes pensées deviennent trop sombres, appelle le 3114 (gratuit, 24 h/24) ou le 15.</p>', '');
      bindClose(L);
      $('[data-a=breathe]', L).onclick = function () { openBreathe({ p: 'coh', min: 1, auto: true }); };
      $('[data-a=ground]', L).onclick = function () { openGround(); };
      $('[data-a=dump]', L).onclick = function () { closeLayer(function () { act('mem'); }); };
      $('[data-a=crumb]', L).onclick = function () { closeLayer(function () { if (curTask()) { go('home'); var n = $('#nowCard'); n.scrollIntoView({ block: 'center' }); } else act('cut'); }); };
    });
  }
  function openGround() {
    var k = 0;
    openLayer('', function (L) {
      var paint = function () {
        if (k >= D.GROUND.length) {
          L.innerHTML = sheet('Ancrage', '<div data-bt="calm" style="--bt-size:170px"></div><h2>Tu es là, maintenant.</h2><p class="lead">Ton attention est revenue dans la pièce. Prends ton temps avant la suite.</p>',
            '<button class="btn primary wide" data-a="close">Terminer</button>');
          hydrate(L); bindClose(L); addWin('Ancrage 5-4-3-2-1', 'calm'); sound.soft(); return;
        }
        var g = D.GROUND[k];
        L.innerHTML = sheet('Ancrage',
          '<div class="big-n">' + g[0] + '</div><h2>' + g[1] + '</h2><p class="lead">' + esc(g[2]) + '</p>' +
          '<div class="dotrow" aria-hidden="true">' + D.GROUND.map(function (x, i) { return '<i class="' + (i === k ? 'on' : '') + '"></i>'; }).join('') + '</div>',
          '<button class="btn primary wide" data-a="next">' + (k === D.GROUND.length - 1 ? 'J\'ai fini' : 'Suivant') + '</button>');
        hydrate(L); bindClose(L);
        $('[data-a=next]', L).onclick = function () { k++; buzz(15); paint(); };
      };
      paint();
    });
  }

  /* ----- Leçon ----- */
  function openLesson(id) {
    var all = allLessons(), x = all.filter(function (z) { return z.l.id === id; })[0]; if (!x) return;
    var l = x.l, step = 0, total = l.slides.length + 1, answered = -1;
    var poses = [l.pose || 'think', 'think', 'happy'];
    openLayer('', function (L) {
      var paint = function () {
        var segs = '<div class="segs" aria-hidden="true">' + Array.apply(null, Array(total)).map(function (_, i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
        var body = '', foot = '';
        if (step < l.slides.length) {
          body = '<div data-bt="' + poses[step % 3] + '"></div>' + (step === 0 ? '<p class="ch">Chapitre ' + (x.ci + 1) + ', ' + esc(x.c.name) + '</p><h2>' + esc(l.title) + '</h2>' : '') +
            '<p class="lesson-text">' + esc(l.slides[step]) + '</p>';
          foot = '<button class="btn primary wide" data-a="next">Suivant</button>' + (step ? '<button class="btn ghost wide" data-a="prev">Précédent</button>' : '');
        } else if (step === l.slides.length) {
          body = '<div data-bt="think" style="--bt-size:110px"></div><h2 style="font-size:22px">' + esc(l.quiz.q) + '</h2><div class="answers">' +
            l.quiz.a.map(function (a, i) {
              var cls = answered < 0 ? '' : i === l.quiz.ok ? ' ok' : i === answered ? ' ko' : '';
              return '<button class="answer' + cls + '" data-i="' + i + '"' + (answered >= 0 ? ' disabled' : '') + '>' + esc(a) + '</button>';
            }).join('') + '</div>' +
            (answered >= 0 ? '<p class="why"><b>' + (answered === l.quiz.ok ? 'Exactement. ' : 'Presque ! ') + '</b>' + esc(l.quiz.why) + '</p>' : '');
          foot = answered >= 0 ? '<button class="btn primary wide" data-a="next">Continuer</button>' : '';
        } else {
          var first = S.get('ldone', []).indexOf(l.id) < 0;
          if (first) { var d = S.get('ldone', []); d.push(l.id); S.set('ldone', d); addWin('Leçon : ' + l.title, 'lesson'); }
          confetti(70); sound.win();
          body = '<div data-bt="cheer" style="--bt-size:160px"></div><h2>Leçon terminée !</h2><p class="lead">Une astuce de plus dans ton sac.</p>' +
            '<div class="try"><b>À essayer</b>' + esc(l.tryIt.text) + '</div>';
          foot = '<button class="btn primary wide" data-a="try">' + esc(l.tryIt.label) + '</button><button class="btn ghost wide" data-a="back">Retour au voyage</button>';
        }
        L.innerHTML = '<div class="sheet"><div class="sheet-top">' + segs + '<button class="x" data-a="close" aria-label="Fermer la leçon">' + ic('x') + '</button></div>' +
          '<div class="lesson-body">' + body + '</div><div class="sheet-foot">' + foot + '</div></div>';
        hydrate(L); bindClose(L); L.scrollTop = 0;
        var b;
        if ((b = $('[data-a=next]', L))) b.onclick = function () { step++; paint(); };
        if ((b = $('[data-a=prev]', L))) b.onclick = function () { step--; paint(); };
        if ((b = $('[data-a=try]', L))) b.onclick = function () { var g = l.tryIt.go; closeLayer(function () { act(g); }); };
        if ((b = $('[data-a=back]', L))) b.onclick = function () { closeLayer(function () { go('learn'); }); };
        $$('.answer', L).forEach(function (a) {
          a.onclick = function () { answered = +a.getAttribute('data-i'); if (answered === l.quiz.ok) { sound.pop(); buzz(20); } else { sound.soft(); } paint(); };
        });
      };
      paint();
    });
  }

  /* ----- Niveau ----- */
  function openLevelUp() {
    var L0 = lvl();
    openLayer('', function (L) {
      L.innerHTML = sheet('', '<div data-bt="cheer" style="--bt-size:210px"></div><h2>Je grandis !</h2><p class="lead">Grâce à tes ' + L0.n + ' victoires, je suis maintenant : <b>' + L0.name + '</b>.</p>',
        '<button class="btn primary wide" data-a="close">Trop bien</button>');
      hydrate(L); bindClose(L);
      setTimeout(function () { confetti(140); sound.win(); }, 250);
    });
  }

  /* ----- Intro ----- */
  function openIntro() {
    var k = 0;
    openLayer('', function (L) {
      var dots = function () { return '<div class="dotrow" aria-hidden="true">' + [0, 1, 2].map(function (i) { return '<i class="' + (i === k ? 'on' : '') + '"></i>'; }).join('') + '</div>'; };
      var paint = function () {
        var body, foot;
        if (k === 0) {
          body = '<div data-bt="wave"></div><h2>Salut, moi c\'est Boutou !</h2><p class="lead">Je suis une petite graine. Chaque fois que tu avances, même d\'une miette, je pousse un peu.</p>' + dots();
          foot = '<button class="btn primary wide" data-a="n">Enchanté</button>';
        } else if (k === 1) {
          body = '<h2>Ce qu\'on fera ensemble</h2><div class="feat">' +
            '<div>' + ic('cut') + '<span>Découper ce qui bloque en miettes de deux minutes</span></div>' +
            '<div>' + ic('timer') + '<span>Démarrer sans attendre la motivation</span></div>' +
            '<div>' + ic('wind') + '<span>Respirer et se poser quand ça déborde</span></div>' +
            '<div>' + ic('path') + '<span>Comprendre ton cerveau, une leçon à la fois</span></div></div>' + dots();
          foot = '<button class="btn primary wide" data-a="n">Super</button>';
        } else {
          body = '<div data-bt="happy" style="--bt-size:150px"></div><h2>Comment je t\'appelle ?</h2><label class="sr" for="introName">Prénom</label><input id="introName" placeholder="Ton prénom" autocomplete="given-name" enterkeyhint="go" value="' + esc(S.get('name', '')) + '">' + dots();
          foot = '<button class="btn primary wide" data-a="n">C\'est parti</button>';
        }
        L.innerHTML = '<div class="sheet intro"><div class="sheet-top"><span></span><button class="btn ghost small" data-a="skip">Passer</button></div><div class="sheet-body">' + body + '</div><div class="sheet-foot">' + foot + '</div></div>';
        hydrate(L);
        var end = function () { var n = $('#introName'); if (n) S.set('name', n.value.trim().slice(0, 30)); S.set('onboarded', true); closeLayer(function () { petReact('wave', 'On commence quand tu veux.'); }); };
        $('[data-a=skip]', L).onclick = end;
        $('[data-a=n]', L).onclick = function () { if (k < 2) { k++; sound.soft(); paint(); } else end(); };
        var n = $('#introName', L); if (n) n.onkeydown = function (e) { if (e.key === 'Enter') end(); };
      };
      paint();
    });
  }

  /* ================= Dictée ================= */
  function dictate(btn) {
    var R = window.SpeechRecognition || window.webkitSpeechRecognition, target = $('#' + btn.getAttribute('data-mic'));
    if (!R) return toast('Dictée indisponible ici : utilise le micro du clavier');
    try {
      var r = new R(); r.lang = 'fr-FR'; r.interimResults = false;
      btn.classList.add('listening');
      r.onresult = function (e) { var t = e.results[0][0].transcript; target.value += (target.value ? ' ' : '') + t; target.focus(); };
      r.onerror = function () { toast('Dictée interrompue'); };
      r.onend = function () { btn.classList.remove('listening'); };
      r.start(); toast('Je t\'écoute…');
    } catch (e) { btn.classList.remove('listening'); toast('Dictée indisponible ici : utilise le micro du clavier'); }
  }

  /* ================= Sauvegarde ================= */
  function exportData() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('bt_') === 0) out[k] = localStorage.getItem(k); }
    var blob = new Blob([JSON.stringify({ app: 'boutou', at: new Date().toISOString(), data: out }, null, 1)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'boutou-sauvegarde-' + dk() + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Sauvegarde exportée');
  }
  function importData(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var j = JSON.parse(fr.result); if (!j || j.app !== 'boutou' || typeof j.data !== 'object') throw 0;
        if (!confirm('Remplacer les données de cet appareil par cette sauvegarde ?')) return;
        Object.keys(localStorage).filter(function (k) { return k.indexOf('bt_') === 0; }).forEach(function (k) { localStorage.removeItem(k); });
        Object.keys(j.data).forEach(function (k) { if (k.indexOf('bt_') === 0 && typeof j.data[k] === 'string') localStorage.setItem(k, j.data[k]); });
        location.reload();
      } catch (e) { toast('Ce fichier n\'est pas une sauvegarde Boutou'); }
    };
    fr.readAsText(file);
  }

  /* ================= Démarrage ================= */
  function bind() {
    $$('#tabs button').forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-t'); if (t === 'cut' && tab === 'cut') openTaskId = null; go(t); }; });
    $$('[data-go]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-go')); }; });
    $$('[data-mic]').forEach(function (b) { b.onclick = function () { dictate(b); }; });
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-act]'); if (a) act(a.getAttribute('data-act')); });
    $('#moods').addEventListener('click', function (e) {
      var b = e.target.closest('.mood'); if (!b) return;
      var i = +b.getAttribute('data-m'), m = S.get('moods', {}); m[dk()] = i; S.set('moods', m); markActive();
      sound.pop(); buzz(12); renderHome(); petReact(D.MOODS[i].pose, MOOD_LINES[i]);
    });
    $('#homePet').onclick = function () {
      var pet = this._m; if (!pet) return;
      var i; do { i = Math.floor(Math.random() * D.LINES.length); } while (i === lineIdx && D.LINES.length > 1); lineIdx = i;
      petReact(Math.random() < .5 ? 'happy' : 'wow', D.LINES[i]); sound.soft(); buzz(10);
    };
    $('#levelBtn').onclick = function () { go('me'); };
    $('#cutBtn').onclick = doCut;
    $('#taskIn').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doCut(); } };
    $('#memBtn').onclick = addNote;
    $('#memIn').onkeydown = function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(); };
    $('#memSearch').oninput = renderMem;
    $('#nameIn').onchange = function () { S.set('name', this.value.trim().slice(0, 30)); toast('Prénom enregistré'); };
    $('#soundIn').onchange = function () { S.set('sound', this.checked); if (this.checked) sound.pop(); };
    $$('#themeSeg button').forEach(function (b) { b.onclick = function () { var v = b.getAttribute('data-v'); S.set('theme', v); applyTheme(v); renderMe(); }; });
    $('#introBtn').onclick = openIntro;
    $('#exportBtn').onclick = exportData;
    $('#importIn').onchange = function () { if (this.files[0]) importData(this.files[0]); this.value = ''; };
    $('#wipeBtn').onclick = function () {
      if (!confirm('Tout effacer ? Tâches, notes, victoires et progression seront supprimées de cet appareil.')) return;
      Object.keys(localStorage).filter(function (k) { return k.indexOf('bt_') === 0; }).forEach(function (k) { localStorage.removeItem(k); });
      location.reload();
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#layer').hidden) closeLayer(); });
    var lastDay = dk();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      if (SP && SP.running) { if (spLeft() <= 0) spFinish(); else { spPaint(); lockScreen(); } }
      if (dk() !== lastDay) { lastDay = dk(); if (tab === 'home' && $('#layer').hidden) renderHome(); }
    });
  }

  migrate();
  hydrate(document);
  applyTheme(S.get('theme', 'auto'));
  bind();
  go('home');
  var saved = S.get('sprint', null);
  if (saved && saved.running) {
    SP = saved;
    if (spLeft() > 0) openSprint({ resume: true });
    else { SP.left = 0; openSprint({ resume: true }); spFinish(); }
  } else S.del('sprint');
  if (!S.get('onboarded', false) && $('#layer').hidden) openIntro();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(function () {});
})();
