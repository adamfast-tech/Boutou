/* ==========================================================================
   Brio 1.0 — micro-interactions en HTML / CSS / JavaScript vanilla
   Lot 1 : chargeurs (data-brio). Lot 2 : texte (data-brio-texte), entrées
   (data-brio-entree, data-brio-cascade), progression, défilement collant,
   transitions de page, ressorts, vibrations. Lot 3 : interrupteurs et formulaires
   (contrôles natifs améliorés, data-brio sur l'input ou son conteneur). Lot 4 : scènes physiques,
   kit d'interface (menus, onglets, étapes, jauges, bulles…) et effets de pointeur. Lot 5 : cartes en éventail,
   carrousels 3D et morphings. Lot 6 : graphiques (monochromes et tramés) et composants d'IA.
   Démarrage automatique.
   API : Brio.init(racine), Brio.monter(el), Brio.rejouer(el), Brio.def(nom, def),
         Brio.liste(), Brio.listeTexte(), Brio.listeEntrees(), Brio.listeControles(), Brio.listeComposants(famille),
         Brio.transition(action, options), Brio.Ressort,
         Brio.surProgression(source, rappel), Brio.suivrePointeur(el, rappel),
         Brio.courbeRessort(options), Brio.vibre(motif), Brio.calme()
   ========================================================================== */
(function () {
  'use strict';

  var BR = window.Brio = window.Brio || {};
  BR.version = '1.0.0';
  var defs = {}, ordre = [];
  var mqCalme = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  // arrivée après une transition de page : voile posé avant le premier rendu si possible
  try { if (sessionStorage.getItem('brio-transition')) document.documentElement.classList.add('br-arrivee'); } catch (_) {}

  function calme() { return mqCalme.matches; }
  function alea(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function enfant(el, i, n) {
    var c = document.createElement('i');
    c.style.setProperty('--i', i);
    c.style.setProperty('--c', Math.abs(i - (n - 1) / 2));
    c.style.setProperty('--r', alea(i + 1).toFixed(3));
    el.appendChild(c);
    return c;
  }
  function texte(el, def) { return (el.dataset.texte || el.textContent || '').trim() || def; }

  var filtrePret = false;
  function filtreGluant() {
    if (filtrePret) return;
    filtrePret = true;
    var d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0"><filter id="br-gluant" x="-50%" y="-50%" width="200%" height="200%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="flou"/>' +
      '<feColorMatrix in="flou" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="colle"/>' +
      '<feComposite in="SourceGraphic" in2="colle" operator="atop"/></filter></svg>';
    document.body.appendChild(d);
  }

  /* def : { c: catégorie, f: famille (rang|barres|grille|pose|rayons|orbite|texte),
             n: enfants, g: côté de grille, html: chaîne ou fonction(el), init: fonction(el),
             gluant: true, miroir: true } */
  BR.def = function (nom, d) { if (!defs[nom]) ordre.push(nom); defs[nom] = d; };
  BR.liste = function () {
    return ordre.filter(function (n) { return !defs[n].composant; }).map(function (n) { return { nom: n, categorie: defs[n].c }; });
  };
  BR.calme = calme;

  function monter(el) {
    if (el._br) return el._br;
    var nom = el.getAttribute('data-brio'), d = defs[nom];
    if (!d) return null;
    if (d.composant) {
      el.classList.add('br', 'br-' + nom);
      el._br = d.init(el) || {};
      return el._br;
    }
    el.classList.add('br', 'br-chargeur', 'br-' + nom);
    if (d.f) el.classList.add('br-' + d.f);
    var t = el.dataset.taille;
    if (t) el.style.setProperty('--br-taille', /^\d+(\.\d+)?$/.test(t) ? t + 'px' : t);
    var v = parseFloat(el.dataset.vitesse);
    if (v > 0) el.style.setProperty('--br-v', v);
    if (!el.hasAttribute('role')) el.setAttribute('role', 'status');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.dataset.label || 'Chargement');
    var lu = d.f === 'texte' ? texte(el, d.defaut || 'Chargement') : '';
    el.textContent = '';
    if (d.n) {
      el.style.setProperty('--n', d.n);
      for (var i = 0; i < d.n; i++) { var c = enfant(el, i, d.n); if (d.miroir) c.className = 'br-miroir'; }
    }
    if (d.g) {
      el.style.setProperty('--g', d.g);
      for (var k = 0; k < d.g * d.g; k++) {
        var e = enfant(el, k, d.g * d.g);
        e.style.setProperty('--x', k % d.g);
        e.style.setProperty('--y', Math.floor(k / d.g));
      }
    }
    if (d.html) el.insertAdjacentHTML('beforeend', typeof d.html === 'function' ? d.html(el, lu) : d.html);
    if (d.gluant) { filtreGluant(); el.classList.add('br-gluant'); }
    if (d.f !== 'texte') [].forEach.call(el.children, function (x) { x.setAttribute('aria-hidden', 'true'); });
    el._br = (d.init && d.init(el, lu)) || {};
    return el._br;
  }
  BR.monter = monter;

  var SELECTEUR = '[data-brio],[data-brio-texte],[data-brio-entree],[data-brio-cascade]';
  // une erreur sur un élément ne bloque pas le montage des suivants
  function monterTout(el) {
    try {
      if (el.hasAttribute('data-brio')) monter(el);
      if (el.hasAttribute('data-brio-texte')) monterTexte(el);
      if (el.hasAttribute('data-brio-entree')) monterEntree(el);
      if (el.hasAttribute('data-brio-cascade')) monterCascade(el);
    } catch (e) { if (window.console) console.error('Brio :', el.getAttribute('data-brio') || '', e); }
  }
  BR.init = function (racine) {
    racine = racine || document;
    if (racine.nodeType === 1 && racine.matches(SELECTEUR)) monterTout(racine);
    var l = racine.querySelectorAll ? racine.querySelectorAll(SELECTEUR) : [];
    for (var i = 0; i < l.length; i++) monterTout(l[i]);
  };

  // boucle d'animation suspendue hors écran
  function boucleVisible(el, dessiner) {
    var raf = 0, vu = true, t0 = performance.now();
    function pas(t) { dessiner((t - t0) / 1000); raf = requestAnimationFrame(pas); }
    function go() { if (!raf && vu) raf = requestAnimationFrame(pas); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vu = e[0].isIntersecting; if (vu) go(); else stop(); }).observe(el);
    go();
  }
  function vitesse(el) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue('--br-v')) || 1;
    return calme() ? v / 2.5 : v;
  }
  function decouper(txt) {
    return txt.split('').map(function (ch, i) { return '<i style="--i:' + i + '">' + (ch === ' ' ? ' ' : echapper(ch)) + '</i>'; }).join('');
  }
  function echapper(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ==========================================================================
     CHARGEURS — définitions (137)
     ========================================================================== */
  function D(c, f, n, x) { var o = { c: c, f: f, n: n || 0 }; if (x) for (var k in x) o[k] = x[k]; return o; }
  function SVG(vb, corps) { return '<svg viewBox="' + vb + '" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' + corps + '</svg>'; }

  /* ---------- Points ---------- */
  var P = 'points';
  BR.def('points-flottants', D(P, 'rang', 3));
  BR.def('points-rebond', D(P, 'rang', 3));
  BR.def('points-sauts', D(P, 'rang', 3));
  BR.def('points-fondu', D(P, 'rang', 3));
  BR.def('points-pouls', D(P, 'rang', 3));
  BR.def('points-respirent', D(P, 'rang', 4));
  BR.def('point-pouls', D(P, 'pose', 1));
  BR.def('points-vague', D(P, 'rang', 5));
  BR.def('points-trainee', D(P, 'rang', 5));
  BR.def('trois-points-tour', D(P, 'orbite', 3));
  BR.def('points-echange', D(P, 'orbite', 2));
  BR.def('point-glisse', D(P, 'rang', 3));
  BR.def('points-liquides', D(P, 'rang', 3, { gluant: true }));
  BR.def('points-aimantes', D(P, 'rang', 3));
  BR.def('grille-points', D(P, 'grille', 0, { g: 3 }));
  BR.def('matrice-ressort', D(P, 'grille', 0, { g: 4 }));
  BR.def('matrice', D(P, 'grille', 0, { g: 5 }));
  BR.def('bulle-ecriture', D(P, 'rang', 3));
  BR.def('couronne-points', D(P, 'orbite', 8));
  BR.def('points-tournants', D(P, 'orbite', 8));
  BR.def('anneau-points-morph', D(P, 'orbite', 8));
  BR.def('goutte', D(P, 'pose', 2));
  BR.def('orbite-fluide', D(P, 'orbite', 4, { gluant: true }));
  BR.def('point-orbite', D(P, 'orbite', 1));
  BR.def('orbite-double', D(P, 'orbite', 2));
  BR.def('cercles-orbite', D(P, 'orbite', 3));
  BR.def('points-doux', D(P, 'rang', 3));
  BR.def('pouls-orbite', D(P, 'orbite', 6));
  BR.def('zigzag', D(P, 'pose', 5));

  /* ---------- Barres ---------- */
  var B = 'barres';
  BR.def('barres-rebond', D(B, 'barres', 4));
  BR.def('barres-cascade', D(B, 'barres', 5));
  BR.def('barres-balayage', D(B, 'barres', 5));
  BR.def('barres-elastiques', D(B, 'barres', 5));
  BR.def('barres-fluides', D(B, 'barres', 5));
  BR.def('barres-morph', D(B, 'barres', 4));
  BR.def('barres-glissantes', D(B, '', 3));
  BR.def('barres-ressort', D(B, 'barres', 5));
  BR.def('barres-empilees', D(B, '', 4));
  BR.def('onde-symetrique', D(B, 'barres', 7));
  BR.def('forme-onde', D(B, 'barres', 9));
  BR.def('egaliseur', D(B, 'barres', 5));
  BR.def('onde-sonore', D(B, 'barres', 7));
  BR.def('lignes-rebond', D(B, '', 3));
  BR.def('accordeon', D(B, 'barres', 5));
  BR.def('ligne-scintillante', D(B, '', 0));
  BR.def('onde-physique', D(B, 'rang', 13, {
    init: function (el) {
      [].forEach.call(el.children, function (c, i) { c.style.setProperty('--a', Math.sin(Math.PI * i / 12).toFixed(3)); });
    }
  }));
  BR.def('onde-voix', D(B, '', 0, {
    html: '<canvas></canvas>',
    init: function (el) {
      var cv = el.querySelector('canvas'), ctx = cv.getContext('2d');
      var ondes = [{ f: 1.6, v: 2.2, a: 1, o: 1 }, { f: 2.4, v: -1.7, a: .7, o: .55 }, { f: 3.1, v: 1.3, a: .45, o: .35 }];
      boucleVisible(el, function (t) {
        var r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
        var w = Math.max(1, Math.round(r.width * d)), hh = Math.max(1, Math.round(r.height * d));
        if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; }
        var cs = getComputedStyle(el), coul = cs.color, ac = cs.getPropertyValue('--br-accent').trim() || coul, s = vitesse(el);
        ctx.clearRect(0, 0, w, hh);
        ctx.lineWidth = 2 * d;
        ondes.forEach(function (o, k) {
          ctx.beginPath();
          for (var x = 0; x <= w; x += 2 * d) {
            var u = x / w, env = Math.sin(Math.PI * u);
            var y = hh / 2 + Math.sin(u * Math.PI * 2 * o.f + t * o.v * s * 2) * env * env * hh * .38 * o.a * (.75 + .25 * Math.sin(t * s * 1.3 + k));
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.globalAlpha = o.o;
          ctx.strokeStyle = k === 1 ? ac : coul;
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      });
    }
  }));
  BR.def('convoyeur', D(B, 'pose', 4));

  /* ---------- Anneaux ---------- */
  var A = 'anneaux';
  BR.def('anneau-classique', D(A));
  BR.def('anneau-double', D(A));
  BR.def('anneau-tirets', D(A, '', 0, { html: SVG('0 0 40 40', '<circle cx="20" cy="20" r="16" stroke-width="3.5" stroke-dasharray="7 5"/>') }));
  BR.def('spirale-tirets', D(A, '', 0, {
    html: function () {
      var d = '', tours = 3, pas = 120;
      for (var k = 0; k <= pas; k++) {
        var a = k / pas * tours * Math.PI * 2, r = 2 + 15 * k / pas;
        d += (k ? 'L' : 'M') + (20 + Math.cos(a) * r).toFixed(2) + ' ' + (20 + Math.sin(a) * r).toFixed(2);
      }
      return SVG('0 0 40 40', '<path d="' + d + '" stroke-width="2.4" stroke-dasharray="4 4"/>');
    }
  }));
  BR.def('deux-arcs', D(A));
  BR.def('arc-fondu', D(A));
  BR.def('arc-degrade', D(A));
  BR.def('comete', D(A));
  BR.def('traceur', D(A, '', 0, { html: SVG('0 0 40 40', '<circle cx="20" cy="20" r="16" stroke-width="4" stroke-opacity=".18"/><circle cx="20" cy="20" r="16" stroke-width="4" pathLength="100"/>') }));
  BR.def('balayage-anneau', D(A, '', 0, { html: SVG('0 0 40 40', '<circle cx="20" cy="20" r="16" stroke-width="4" stroke-opacity=".18"/><circle cx="20" cy="20" r="16" stroke-width="4" pathLength="100" stroke-dasharray="28 72"/>') }));
  BR.def('anneau-lisse', D(A));
  BR.def('anneaux-decales', D(A, 'pose', 3));
  BR.def('anneaux-concentriques', D(A, 'pose', 3));
  BR.def('pouls-concentrique', D(A, 'pose', 3));
  BR.def('anneaux-croises', D(A, 'pose', 2));
  BR.def('anneau-morph', D(A));
  BR.def('anneau-respire', D(A));
  BR.def('anneau-vibrant', D(A));
  BR.def('ondulation', D(A, 'pose', 2));
  BR.def('anneau-ressort', D(A));
  BR.def('respiration', D(A));
  BR.def('lueur-respire', D(A));
  BR.def('systeme-radial', D(A, 'pose', 3));
  BR.def('tourbillon', D(A, 'pose', 4));
  BR.def('spirale', D(A, 'orbite', 10));

  /* ---------- Rayons ---------- */
  var R = 'rayons';
  BR.def('petales', D(R, 'rayons', 12));
  BR.def('rayons-ligne', D(R, 'rayons', 8));
  BR.def('barres-circulaires', D(R, 'rayons', 12));
  BR.def('croix-tournante', D(R, 'pose', 2));
  BR.def('croix-rotation', D(R, 'pose', 2));
  BR.def('croix-expansion', D(R, 'rayons', 4));
  BR.def('montre', D(R, 'rayons', 12));
  BR.def('horloge', D(R));

  /* ---------- Formes ---------- */
  var F = 'formes';
  BR.def('carre-rebond', D(F));
  BR.def('carre-respire', D(F));
  BR.def('carre-elastique', D(F));
  BR.def('carre-retourne', D(F));
  BR.def('carre-pouls', D(F));
  BR.def('carre-arrondi', D(F));
  BR.def('carres-tournants', D(F));
  BR.def('carres-concentriques', D(F, 'pose', 3));
  BR.def('grille-carres', D(F, 'grille', 0, { g: 3 }));
  BR.def('serpent', D(F, 'grille', 0, {
    g: 3,
    init: function (el) {
      var tour = [0, 1, 2, 5, 8, 7, 6, 3];
      tour.forEach(function (idx, k) { var c = el.children[idx]; c.classList.add('br-anneau-case'); c.style.setProperty('--k', k); });
    }
  }));
  BR.def('carre-tournant', D(F));
  BR.def('carres-accordeon', D(F, 'rang', 4));
  BR.def('cube-ressort', D(F));
  BR.def('cubes-errants', D(F, 'pose', 2));
  BR.def('grille-losanges', D(F, 'grille', 0, { g: 3 }));
  BR.def('losange-ressort', D(F));
  BR.def('losange-fluide', D(F));
  BR.def('losanges-flottants', D(F, 'pose', 3));
  BR.def('triangle', D(F, '', 0, { html: SVG('0 0 40 40', '<polygon points="20,6 35,32 5,32" stroke-width="3" pathLength="100"/>') }));
  BR.def('triangle-tournant', D(F, '', 0, {
    html: SVG('0 0 40 40', '<polygon points="20,5 33,27.5 7,27.5" stroke-width="2.5" stroke-opacity=".35"/>' +
      '<circle cx="20" cy="5" r="3.5" fill="currentColor" stroke="none"/><circle cx="33" cy="27.5" r="3.5" fill="currentColor" stroke="none"/>' +
      '<circle cx="7" cy="27.5" r="3.5" stroke="none" style="fill:var(--br-accent)"/>')
  }));
  BR.def('hexagone', D(F, '', 0, {
    html: SVG('0 0 40 40', '<polygon points="20,4 33.9,12 33.9,28 20,36 6.1,28 6.1,12" stroke-width="3" stroke-opacity=".2"/>' +
      '<polygon points="20,4 33.9,12 33.9,28 20,36 6.1,28 6.1,12" stroke-width="3" pathLength="100" stroke-dasharray="30 70"/>')
  }));
  BR.def('hexagone-ressort', D(F, 'orbite', 6));
  BR.def('origami', D(F, 'pose', 4));
  BR.def('forme-morph', D(F));
  BR.def('morph-cercle-carre', D(F));
  BR.def('gouttes-gluantes', D(F, 'pose', 2, { gluant: true }));
  var INFINI = 'M32 20C24 8 8 8 8 20s16 12 24 0 24-12 24 0-16 12-24 0Z';
  BR.def('infini', D(F, '', 0, { html: SVG('0 0 64 40', '<path d="' + INFINI + '" stroke-width="3.5" stroke-opacity=".18"/><path d="' + INFINI + '" stroke-width="3.5" pathLength="100"/>') }));
  BR.def('infini-morph', D(F, '', 0, {
    gluant: true,
    html: SVG('0 0 64 40', '<path d="' + INFINI + '" stroke-width="2" stroke-opacity=".15"/><path d="' + INFINI + '" stroke-width="6" pathLength="100"/><path d="' + INFINI + '" stroke-width="5" pathLength="100" style="stroke:var(--br-accent)"/>')
  }));
  BR.def('grille-mutante', D(F, 'grille', 0, { g: 2 }));

  /* ---------- Texte ---------- */
  var T = 'texte';
  function mot(el, lu) { return '<span class="br-mot">' + echapper(lu) + '</span>'; }
  BR.def('texte-clignote', D(T, 'texte', 0, { html: mot, init: function (el) { el.classList.add('br-caret'); } }));
  BR.def('texte-points', D(T, 'texte', 0, { html: function (el, lu) { return mot(el, lu) + '<i style="--i:0">.</i><i style="--i:1">.</i><i style="--i:2">.</i>'; } }));
  BR.def('texte-morph', D(T, 'texte', 0, {
    html: '<span class="br-mot"></span>',
    init: function (el, lu) {
      var mots = el.dataset.mots ? el.dataset.mots.split('|') : [lu, 'Préparation', 'Presque prêt'], i = 0, span = el.firstChild;
      span.textContent = mots[0];
      (function suivant() {
        setTimeout(function () {
          if (!el.isConnected) return;
          span.classList.add('sort');
          setTimeout(function () {
            i = (i + 1) % mots.length;
            span.textContent = mots[i];
            span.classList.remove('sort'); span.classList.add('entre');
            void span.offsetWidth;
            span.classList.remove('entre');
            suivant();
          }, 350 / vitesse(el));
        }, 1600 / vitesse(el));
      })();
    }
  }));
  BR.def('texte-reflet', D(T, 'texte', 0, { html: mot }));
  BR.def('texte-vague', D(T, 'texte', 0, { html: function (el, lu) { return decouper(lu); } }));
  BR.def('frappe', D(T, 'texte', 0, {
    html: '<span class="br-mot"></span>',
    init: function (el, lu) {
      el.classList.add('br-caret');
      var phrases = el.dataset.mots ? el.dataset.mots.split('|') : [lu + '…', 'Connexion au serveur…', 'Presque fini…'];
      var span = el.firstChild, p = 0, k = 0, efface = false;
      (function pas() {
        if (!el.isConnected) return;
        var cible = phrases[p], v = vitesse(el), attente = 55;
        if (!efface) { k++; if (k > cible.length) { efface = true; attente = 1100; k = cible.length; } }
        else { k--; attente = 28; if (k <= 0) { efface = false; p = (p + 1) % phrases.length; attente = 300; } }
        span.textContent = cible.slice(0, Math.max(0, k));
        setTimeout(pas, attente / v);
      })();
    }
  }));
  BR.def('texte-ressort', D(T, 'texte', 0, { html: function (el, lu) { return decouper(lu); } }));
  BR.def('texte-revele', D(T, 'texte', 0, { html: mot }));
  BR.def('invite', D(T, 'texte', 0, {
    defaut: 'install',
    html: function (el, lu) { return '<span class="br-mot"><b>$</b> ' + echapper(lu) + '</span><span class="br-progres"></span>'; }
  }));

  /* ---------- Objets ---------- */
  var O = 'objets';
  function roue(cx, cy, rExt, rInt, dents, trou) {
    var d = '', n = dents * 4;
    for (var k = 0; k < n; k++) {
      var a = k / n * Math.PI * 2 - Math.PI / 2, r = (k % 4 < 2) ? rExt : rInt;
      d += (k ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2);
    }
    d += 'Z M' + (cx + trou) + ' ' + cy + 'a' + trou + ' ' + trou + ' 0 1 0 ' + (-2 * trou) + ' 0a' + trou + ' ' + trou + ' 0 1 0 ' + (2 * trou) + ' 0Z';
    return d;
  }
  BR.def('engrenages', D(O, '', 0, {
    html: SVG('0 0 40 40', '<g class="br-roue-1"><path d="' + roue(14, 25, 12, 9, 10, 3.2) + '" fill="currentColor" stroke="none" fill-rule="evenodd"/></g>' +
      '<g class="br-roue-2"><path d="' + roue(28.6, 11.2, 8.6, 6.2, 7, 2.4) + '" stroke="none" fill-rule="evenodd" style="fill:var(--br-accent)"/></g>')
  }));
  BR.def('sablier', D(O, '', 0, {
    html: SVG('0 0 40 40', '<path d="M10 5h20M10 35h20" stroke-width="3"/>' +
      '<path d="M12.5 6c0 8 6.5 10.5 6.5 14s-6.5 6-6.5 14M27.5 6c0 8-6.5 10.5-6.5 14s6.5 6 6.5 14" stroke-width="2.2"/>' +
      '<polygon class="br-sable-haut" points="14.5,10 25.5,10 20,18.5" stroke="none" style="fill:var(--br-accent)"/>' +
      '<line class="br-filet" x1="20" y1="19" x2="20" y2="32" stroke-width="1.2" style="stroke:var(--br-accent)"/>' +
      '<polygon class="br-sable-bas" points="20,24.5 26.5,33 13.5,33" stroke="none" style="fill:var(--br-accent)"/>')
  }));
  var ECG = '0,22 18,22 23,22 26,14 30,30 34,6 38,34 41,22 50,22 54,18 58,22 80,22';
  BR.def('ecg', D(O, '', 0, { html: SVG('0 0 80 40', '<polyline points="' + ECG + '" stroke-width="2.5" stroke-opacity=".15"/><polyline points="' + ECG + '" stroke-width="2.5" pathLength="100"/>') }));
  BR.def('coeur', D(O, '', 0, {
    html: SVG('0 0 40 40', '<path d="M20 34C8 25 3 18 3 12.5 3 7.5 7 4 11.5 4c3.5 0 6.5 2 8.5 5 2-3 5-5 8.5-5C33 4 37 7.5 37 12.5 37 18 32 25 20 34Z" stroke="none" style="fill:var(--br-coeur,#ff4d6d)"/>')
  }));
  BR.def('pendule', D(O, 'pose', 1));
  BR.def('berceau', D(O, 'pose', 5));
  BR.def('radar', D(O, 'pose', 1));
  BR.def('terminal', D(O, 'pose', 3));
  BR.def('ilot', D(O));
  BR.def('scan', D(O, 'pose', 4));
  BR.def('cadenas', D(O, '', 0, {
    html: SVG('0 0 40 40', '<path class="br-anse" d="M13 18v-6a7 7 0 0 1 14 0v6" stroke-width="3.5"/>' +
      '<g class="br-corps"><rect x="9" y="17" width="22" height="17" rx="4" fill="currentColor" stroke="none"/>' +
      '<circle cx="20" cy="25.5" r="2.6" stroke="none" style="fill:var(--br-fond)"/></g>')
  }));
  BR.def('icone-app', D(O));
  BR.def('icone-morph', D(O));
  BR.def('echelle-pouls', D(O));

  /* ---------- Squelettes ---------- */
  var S = 'squelettes';
  BR.def('squelette', D(S, '', 3, { miroir: true }));
  BR.def('squelette-profil', D(S, '', 3, { miroir: true }));
  BR.def('squelette-fluide', D(S, '', 4));
  BR.def('carte-verre', D(S, '', 3, { miroir: true }));
  BR.def('pouls', D(S));

  /* ==========================================================================
     LOT 2 — OUTILS COMMUNS
     ========================================================================== */
  function emit(el, type, detail) { el.dispatchEvent(new CustomEvent('brio:' + type, { bubbles: true, detail: detail || {} })); }
  function borne01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ms(cs, prop, def) {
    var x = cs.getPropertyValue(prop).trim();
    if (!x) return def;
    var n = parseFloat(x);
    return isNaN(n) ? def : /ms$/.test(x) ? n : n * 1000;
  }
  function optionsTemps(el) {
    ['pas', 'duree', 'retard'].forEach(function (k) {
      var v = parseFloat(el.dataset[k]);
      if (!isNaN(v)) el.style.setProperty('--br-' + k, v + 'ms');
    });
    var v = parseFloat(el.dataset.vitesse);
    if (v > 0) el.style.setProperty('--br-v', v);
  }
  // déclencheur commun : vue (défaut), charge, manuel ; data-repete="true" rejoue à chaque entrée
  function declencher(el, entrer, sortir) {
    var mode = el.dataset.declencheur || 'vue';
    if (mode === 'manuel') return;
    if (mode === 'charge' || !('IntersectionObserver' in window)) { entrer(); return; }
    var repete = el.dataset.repete === 'true', vu = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!vu) { vu = true; entrer(); } if (!repete) io.disconnect(); }
        else if (vu && repete) { vu = false; if (sortir) sortir(); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
  }

  /* ==========================================================================
     LOT 2 — TEXTE : data-brio-texte="effet"
     Options : data-pas, data-duree, data-retard (ms), data-vitesse,
               data-declencheur (vue | charge | manuel), data-repete="true"
     ========================================================================== */
  var TX = {}, txOrdre = [];
  var SEG = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter('fr', { granularity: 'grapheme' }) : null;
  var INTERACTIF = 'a,button,input,select,textarea,label,[tabindex],[contenteditable]';
  function graphemes(s) { return SEG ? Array.from(SEG.segment(s), function (x) { return x.segment; }) : Array.from(s); }

  // niv : lettre | mot | ligne | bloc ; mode : entree | machine | boucle | survol
  function defTexte(nom, niv, mode, cat, x) {
    var d = { niv: niv, mode: mode, c: cat };
    if (x) for (var k in x) d[k] = x[k];
    if (!TX[nom]) txOrdre.push(nom);
    TX[nom] = d;
  }
  BR.defTexte = defTexte;
  BR.listeTexte = function () { return txOrdre.map(function (n) { return { nom: n, categorie: TX[n].c, mode: TX[n].mode }; }); };

  function parcourir(src, dst, d, unites) {
    [].forEach.call(src.childNodes, function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { dst.appendChild(document.createTextNode(p)); return; }
          var m = document.createElement('span');
          m.className = 'br-m';
          if (d.niv === 'lettre') {
            graphemes(p).forEach(function (g) {
              var l = document.createElement('span');
              l.className = 'br-l br-u';
              l.textContent = g;
              m.appendChild(l);
              unites.push(l);
            });
            dst.appendChild(m);
          } else {
            m.textContent = p;
            m.classList.add('br-u');
            unites.push(m);
            if (d.masque) { var w = document.createElement('span'); w.className = 'br-masque'; w.appendChild(m); dst.appendChild(w); }
            else dst.appendChild(m);
          }
        });
      } else if (n.nodeType === 1) {
        var c = n.cloneNode(false);
        dst.appendChild(c);
        if (n.tagName !== 'BR') parcourir(n, c, d, unites);
      }
    });
  }

  // lignes : mesure la position de chaque mot puis regroupe par ligne (texte simple)
  function construireLignes(st, vis, unites) {
    var mots = st.source.textContent.replace(/\s+/g, ' ').trim().split(' ');
    var spans = mots.map(function (m) {
      var s = document.createElement('span');
      s.textContent = m;
      vis.appendChild(s);
      vis.appendChild(document.createTextNode(' '));
      return s;
    });
    var lignes = [], haut = null;
    spans.forEach(function (s, i) {
      var t = s.offsetTop;
      if (haut === null || Math.abs(t - haut) > 2) { lignes.push([]); haut = t; }
      lignes[lignes.length - 1].push(mots[i]);
    });
    vis.textContent = '';
    lignes.forEach(function (l) {
      var b = document.createElement('span'), u = document.createElement('span');
      b.className = 'br-ligne';
      u.className = 'br-u';
      u.textContent = l.join(' ');
      b.appendChild(u);
      vis.appendChild(b);
      unites.push(u);
    });
  }

  function construireTexte(el) {
    var st = el._brTx, d = st.d;
    if (!st.source) {
      st.source = document.createDocumentFragment();
      while (el.firstChild) st.source.appendChild(el.firstChild);
    } else {
      el.textContent = '';
    }
    var unites = [];
    if (d.niv === 'bloc') {
      el.appendChild(st.source.cloneNode(true));
      el.classList.add('br-u');
      el.style.setProperty('--i', 0);
      unites.push(el);
    } else {
      var lecteur = !st.source.querySelector(INTERACTIF);
      var vis = document.createElement('span');
      vis.className = 'br-tx-vis';
      if (lecteur) {
        var sr = document.createElement('span');
        sr.className = 'br-sr';
        sr.textContent = st.source.textContent.replace(/\s+/g, ' ').trim();
        el.appendChild(sr);
        vis.setAttribute('aria-hidden', 'true');
      }
      el.appendChild(vis);
      if (d.niv === 'ligne') construireLignes(st, vis, unites);
      else parcourir(st.source, vis, d, unites);
    }
    var n = unites.length;
    if (d.niv !== 'bloc') unites.forEach(function (u, i) {
      u.style.setProperty('--i', i);
      u.style.setProperty('--c', Math.abs(i - (n - 1) / 2));
    });
    el.style.setProperty('--n', n);
    st.unites = unites;
    st.max = d.ordre === 'centre' ? (n - 1) / 2 : Math.max(0, n - 1);
  }

  function monterTexte(el) {
    if (el._brTx) return el._brTx;
    var nom = el.getAttribute('data-brio-texte'), d = TX[nom];
    if (!d) return null;
    var st = el._brTx = { d: d, nom: nom };
    el.classList.add('br-tx', 'br-tx-' + nom, 'br-niv-' + d.niv, 'br-mode-' + d.mode);
    optionsTemps(el);
    construireTexte(el);
    if (d.niv === 'ligne' && 'ResizeObserver' in window) {
      var largeur = el.clientWidth;
      new ResizeObserver(function () {
        var w = el.clientWidth;
        if (Math.abs(w - largeur) < 2) return;
        largeur = w;
        var deja = el.classList.contains('br-fini') || el.classList.contains('br-joue');
        construireTexte(el);
        if (deja) { clearTimeout(st.tFin); el.classList.remove('br-joue'); el.classList.add('br-fini'); }
      }).observe(el);
    }
    if (d.mode === 'entree' || d.mode === 'machine') {
      el.classList.add('br-attend');
      declencher(el, function () { jouerTexte(el); }, function () {
        clearTimeout(st.tFin); clearTimeout(st.tMachine);
        el.classList.remove('br-joue', 'br-fini', 'br-tape');
        el.classList.add('br-attend');
      });
    }
    return st;
  }

  function jouerTexte(el) {
    var st = el._brTx;
    if (!st || (st.d.mode !== 'entree' && st.d.mode !== 'machine')) return;
    clearTimeout(st.tFin);
    clearTimeout(st.tMachine);
    el.classList.remove('br-attend', 'br-fini', 'br-joue');
    if (st.d.mode === 'machine') { machine(el); return; }
    el.style.setProperty('--tx-c', getComputedStyle(el).color);
    void el.offsetWidth;
    el.classList.add('br-joue');
    var cs = getComputedStyle(el), v = parseFloat(cs.getPropertyValue('--br-v')) || 1;
    var total = calme() ? 30 : (ms(cs, '--br-retard', 0) + st.max * ms(cs, '--br-pas', 30) + ms(cs, '--br-duree', 700)) / v;
    st.tFin = setTimeout(function () {
      el.classList.remove('br-joue');
      el.classList.add('br-fini');
      emit(el, 'fin');
    }, total + 80);
  }

  // machine à écrire : lettres révélées une à une, place réservée (aucun décalage)
  function machine(el) {
    var st = el._brTx, u = st.unites;
    if (!u.length) return;
    if (!st.caret) {
      st.caret = document.createElement('span');
      st.caret.className = 'br-caret-tx';
    }
    if (calme()) {
      u.forEach(function (x) { x.classList.remove('br-cache'); });
      u[u.length - 1].after(st.caret);
      emit(el, 'fin');
      return;
    }
    el.classList.add('br-tape');
    u.forEach(function (x) { x.classList.add('br-cache'); });
    u[0].before(st.caret);
    var k = 0, cs = getComputedStyle(el), v = parseFloat(cs.getPropertyValue('--br-v')) || 1, pas = ms(cs, '--br-pas', 45) / v;
    (function suite() {
      if (k >= u.length) { el.classList.remove('br-tape'); emit(el, 'fin'); return; }
      var x = u[k++];
      x.classList.remove('br-cache');
      x.after(st.caret);
      var attente = /[.,;:!?…]/.test(x.textContent) ? pas * 6 : pas * (0.55 + Math.random() * 0.9);
      st.tMachine = setTimeout(suite, attente);
    })();
  }

  var LET = 'lettres', MOT = 'mots', BLC = 'bloc', BCL = 'boucles', SVL = 'survol';
  ['fondu-lettres', 'flou-lettres', 'monte-lettres', 'descend-lettres', 'gauche-lettres', 'droite-lettres',
   'chute-lettres', 'rebond-lettres', 'echelle-lettres', 'bascule-y', 'bascule-x', 'rotation-lettres',
   'etire-x', 'etire-y', 'penche-lettres', 'ressort-lettres', 'aurore'
  ].forEach(function (n) { defTexte(n, 'lettre', 'entree', LET); });
  defTexte('cascade', 'lettre', 'entree', LET, { ordre: 'centre' });
  ['fondu-mots', 'flou-mots', 'monte-mots', 'descend-mots', 'echelle-mots', 'balance-mots', 'lecture-mots'
  ].forEach(function (n) { defTexte(n, 'mot', 'entree', MOT); });
  defTexte('leve-mots', 'mot', 'entree', MOT, { masque: true });
  ['fondu', 'monte', 'echelle', 'zoom-avant', 'zoom-arriere', 'resserre', 'ecarte', 'flou'
  ].forEach(function (n) { defTexte(n, 'bloc', 'entree', BLC); });
  defTexte('lignes', 'ligne', 'entree', BLC);
  defTexte('machine', 'lettre', 'machine', BLC);
  defTexte('reflet', 'bloc', 'boucle', BCL);
  defTexte('lueur', 'bloc', 'boucle', BCL);
  defTexte('flotte-lettres', 'lettre', 'boucle', BCL);
  defTexte('flotte-mots', 'mot', 'boucle', BCL);
  defTexte('pulse-lettres', 'lettre', 'boucle', BCL);
  defTexte('pulse-mots', 'mot', 'boucle', BCL);
  defTexte('survol-leve-lettres', 'lettre', 'survol', SVL);
  defTexte('survol-leve-mots', 'mot', 'survol', SVL);
  defTexte('survol-zoom-lettres', 'lettre', 'survol', SVL);
  defTexte('survol-zoom-mots', 'mot', 'survol', SVL);
  defTexte('survol-vague', 'lettre', 'survol', SVL);

  /* ==========================================================================
     LOT 2 — ENTRÉES : data-brio-entree="effet" ; data-brio-cascade="effet" (enfants décalés)
     ========================================================================== */
  var EN = ['fondu', 'fondu-haut', 'fondu-bas', 'glisse-gauche', 'glisse-droite', 'echelle', 'zoom-profond', 'bascule', 'revele', 'rideau'];
  BR.listeEntrees = function () { return EN.slice(); };

  function preparerEntree(el, nom, i) {
    el.classList.add('br-en', 'br-en-' + nom, 'br-attend');
    el.style.setProperty('--i', i);
    el.addEventListener('animationend', function (e) {
      if (e.target === el && el.classList.contains('br-joue')) {
        el.classList.remove('br-joue');
        el.classList.add('br-fini');
        emit(el, 'fin');
      }
    });
  }
  function jouerEntree(el) {
    el.classList.remove('br-attend', 'br-fini', 'br-joue');
    void el.offsetWidth;
    el.classList.add('br-joue');
  }
  function remettre(el) { el.classList.remove('br-joue', 'br-fini'); el.classList.add('br-attend'); }

  function monterEntree(el) {
    if (el._brEn) return;
    var nom = el.getAttribute('data-brio-entree');
    if (EN.indexOf(nom) < 0) return;
    el._brEn = { nom: nom };
    optionsTemps(el);
    preparerEntree(el, nom, 0);
    declencher(el, function () { jouerEntree(el); }, function () { remettre(el); });
  }
  function monterCascade(el) {
    if (el._brCa) return;
    var nom = el.getAttribute('data-brio-cascade');
    if (EN.indexOf(nom) < 0) nom = 'fondu-haut';
    var enfants = [].slice.call(el.children);
    el._brCa = { nom: nom, enfants: enfants };
    optionsTemps(el);
    enfants.forEach(function (c, i) { preparerEntree(c, nom, i); });
    declencher(el, function () { enfants.forEach(jouerEntree); }, function () { enfants.forEach(remettre); });
  }

  BR.rejouer = function (el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    if (el._brTx) jouerTexte(el);
    if (el._brEn) jouerEntree(el);
    if (el._brCa) el._brCa.enfants.forEach(jouerEntree);
  };

  /* ==========================================================================
     LOT 2 — PROGRESSION DE DÉFILEMENT
     ========================================================================== */
  function defilable(s) {
    if (!s || s.nodeType !== 1) return false;
    var o = getComputedStyle(s).overflowY;
    return o === 'auto' || o === 'scroll';
  }
  function racineDefilement(el) {
    for (var p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      if (defilable(p) && p.scrollHeight > p.clientHeight + 1) return p;
    }
    return null;
  }
  function lireProgression(source) {
    if (!source) {
      var h = document.documentElement, m = h.scrollHeight - innerHeight;
      return m > 0 ? borne01((window.scrollY || h.scrollTop) / m) : 0;
    }
    if (defilable(source)) {
      var mm = source.scrollHeight - source.clientHeight;
      return mm > 0 ? borne01(source.scrollTop / mm) : 0;
    }
    var r = source.getBoundingClientRect(), vh = innerHeight, total = r.height - vh;
    if (total <= 0) return borne01((vh - r.top) / (vh + r.height));
    return borne01(-r.top / total);
  }
  // rappel(p) avec p entre 0 et 1 ; source : rien (page), élément défilant, ou article lu dans la page
  BR.surProgression = function (source, rappel) {
    if (typeof source === 'string') source = document.querySelector(source);
    var raf = 0;
    function maj() { raf = 0; rappel(lireProgression(source)); }
    function planifier() { if (!raf) raf = requestAnimationFrame(maj); }
    document.addEventListener('scroll', planifier, { passive: true, capture: true });
    addEventListener('resize', planifier);
    maj();
    return function () { document.removeEventListener('scroll', planifier, true); removeEventListener('resize', planifier); };
  };

  BR.def('progression', {
    composant: true,
    init: function (el) {
      var forme = el.dataset.forme === 'cercle' ? 'cercle' : 'barre';
      var source = el.dataset.source ? document.querySelector(el.dataset.source) : null;
      var pos = el.dataset.position || (source ? 'statique' : forme === 'cercle' ? 'coin' : 'haut');
      var remonter = forme === 'cercle' && el.dataset.remonter !== 'false';
      var t = el.dataset.taille;
      if (t) el.style.setProperty('--br-taille', /^\d+(\.\d+)?$/.test(t) ? t + 'px' : t);
      if (parseFloat(el.dataset.epaisseur) > 0) el.style.setProperty('--br-epaisseur', parseFloat(el.dataset.epaisseur) + 'px');
      el.classList.add('br-pg-' + forme, 'br-pg-' + pos);
      var cible = el, pc = null;
      if (forme === 'cercle') {
        el.innerHTML = (remonter ? '<button type="button" class="br-pg-bouton">' : '<span class="br-pg-bouton">') +
          '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="br-pg-piste" cx="22" cy="22" r="19"/>' +
          '<circle class="br-pg-arc" cx="22" cy="22" r="19" pathLength="100"/></svg><span class="br-pg-pc" aria-hidden="true">0</span>' +
          (remonter ? '</button>' : '</span>');
        pc = el.querySelector('.br-pg-pc');
        if (remonter) {
          cible = el.firstChild;
          cible.addEventListener('click', function () {
            var o = { top: 0, behavior: calme() ? 'auto' : 'smooth' };
            if (source && defilable(source)) source.scrollTo(o);
            else if (source) source.scrollIntoView({ behavior: o.behavior });
            else window.scrollTo(o);
          });
        }
      }
      if (!remonter) {
        el.setAttribute('role', 'progressbar');
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '100');
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Progression de lecture');
      }
      var dernier = -1;
      var arret = BR.surProgression(source, function (p) {
        el.style.setProperty('--br-p', p.toFixed(4));
        el.classList.toggle('br-visible', pos === 'statique' || p > 0.03);
        var n = Math.round(p * 100);
        if (n === dernier) return;
        dernier = n;
        if (pc) pc.textContent = n;
        if (remonter) cible.setAttribute('aria-label', 'Remonter (' + n + ' % lu)');
        else el.setAttribute('aria-valuenow', n);
      });
      return { arreter: arret };
    }
  });

  /* ==========================================================================
     LOT 2 — DÉFILEMENT COLLANT : visuel collant + étapes qui défilent
     <div data-brio="defilement-collant"><div data-visuels>…</div><div data-etapes>…</div></div>
     ========================================================================== */
  BR.def('defilement-collant', {
    composant: true,
    init: function (el) {
      var vis = el.querySelector('[data-visuels]') || el.children[0];
      var et = el.querySelector('[data-etapes]') || el.children[1];
      if (!vis || !et) return {};
      vis.classList.add('br-dc-visuels');
      et.classList.add('br-dc-etapes');
      var visuels = [].slice.call(vis.children), etapes = [].slice.call(et.children);
      var points = document.createElement('span');
      points.className = 'br-dc-points';
      points.setAttribute('aria-hidden', 'true');
      etapes.forEach(function () { points.appendChild(document.createElement('i')); });
      vis.appendChild(points);
      var actif = -1;
      function activer(i) {
        if (i === actif) return;
        actif = i;
        var iv = Math.min(i, visuels.length - 1);
        etapes.forEach(function (x, k) { x.classList.toggle('br-actif', k === i); });
        visuels.forEach(function (x, k) {
          x.classList.toggle('br-actif', k === iv);
          if (k === iv) x.removeAttribute('aria-hidden'); else x.setAttribute('aria-hidden', 'true');
        });
        [].forEach.call(points.children, function (p, k) { p.classList.toggle('br-actif', k === i); });
        el.style.setProperty('--br-dc-i', i);
        emit(el, 'etape', { index: i });
      }
      var raf = 0;
      function mesurer() {
        raf = 0;
        var racine = racineDefilement(el), ligne;
        if (racine) { var rr = racine.getBoundingClientRect(); ligne = rr.top + rr.height * 0.5; }
        else ligne = innerHeight * 0.5;
        var meilleur = 0, dist = Infinity;
        etapes.forEach(function (x, k) {
          var r = x.getBoundingClientRect(), dd = Math.abs(r.top + r.height / 2 - ligne);
          if (dd < dist) { dist = dd; meilleur = k; }
        });
        activer(meilleur);
      }
      function planifier() { if (!raf) raf = requestAnimationFrame(mesurer); }
      document.addEventListener('scroll', planifier, { passive: true, capture: true });
      addEventListener('resize', planifier);
      if ('ResizeObserver' in window) new ResizeObserver(function () {
        el.classList.toggle('br-etroit', el.clientWidth < 560);
        planifier();
      }).observe(el);
      else el.classList.toggle('br-etroit', el.clientWidth < 560);
      mesurer();
      return { aller: function (i) { if (etapes[i]) etapes[i].scrollIntoView({ behavior: calme() ? 'auto' : 'smooth', block: 'center' }); } };
    }
  });

  /* ==========================================================================
     LOT 2 — TRANSITIONS DE PAGE
     Brio.transition(action, { style: rideau|iris|volets|fondu, x, y, couleur }) → Promise
     Liens automatiques : data-brio-transition="style" sur le lien ou un ancêtre (ex. <body>)
     ========================================================================== */
  var VOILES = { rideau: 600, iris: 620, volets: 740, fondu: 220 };
  function creerVoile(style, x, y) {
    var v = document.createElement('div');
    v.className = 'br-voile br-voile-' + style;
    v.setAttribute('aria-hidden', 'true');
    if (style === 'volets') for (var i = 0; i < 5; i++) { var b = document.createElement('i'); b.style.setProperty('--i', i); v.appendChild(b); }
    v.style.setProperty('--vx', (x == null ? innerWidth / 2 : x) + 'px');
    v.style.setProperty('--vy', (y == null ? innerHeight / 2 : y) + 'px');
    document.body.appendChild(v);
    return v;
  }
  function phase(v, style, classe) {
    return new Promise(function (ok) {
      v.classList.remove('br-couvre', 'br-decouvre', 'br-plein');
      void v.offsetWidth;
      v.classList.add(classe);
      setTimeout(ok, VOILES[style] + 30);
    });
  }
  BR.transition = function (action, o) {
    o = o || {};
    var style = VOILES[o.style] ? o.style : 'rideau';
    if (calme()) style = 'fondu';
    var v = creerVoile(style, o.x, o.y);
    if (o.couleur) v.style.setProperty('--br-voile', o.couleur);
    return phase(v, style, 'br-couvre')
      .then(function () { return action ? action() : null; })
      .then(function () { return phase(v, style, 'br-decouvre'); })
      .then(function () { v.remove(); });
  };
  function initTransitions() {
    var arrivee = null;
    try { arrivee = sessionStorage.getItem('brio-transition'); sessionStorage.removeItem('brio-transition'); } catch (_) {}
    if (arrivee) {
      var style = calme() || !VOILES[arrivee] ? 'fondu' : arrivee;
      var v = creerVoile(style);
      v.classList.add('br-plein');
      document.documentElement.classList.remove('br-arrivee');
      requestAnimationFrame(function () { phase(v, style, 'br-decouvre').then(function () { v.remove(); }); });
    } else {
      document.documentElement.classList.remove('br-arrivee');
    }
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var hote = a.closest('[data-brio-transition]');
      if (!hote || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      var st = hote.getAttribute('data-brio-transition') || 'rideau';
      try { sessionStorage.setItem('brio-transition', st); } catch (_) {}
      BR.transition(function () { location.href = url.href; return new Promise(function () {}); }, { style: st, x: e.clientX, y: e.clientY });
    });
    addEventListener('pageshow', function (e) {
      if (e.persisted) [].forEach.call(document.querySelectorAll('.br-voile'), function (x) { x.remove(); });
    });
  }

  /* ==========================================================================
     LOT 2 — RESSORTS, POINTEUR, VIBRATIONS
     ========================================================================== */
  // courbe de ressort pour CSS : linear(…) ; amorti 0–1 (petit = plus de rebond), frequence ≈ 8–20
  BR.courbeRessort = function (o) {
    o = o || {};
    var z = o.amorti == null ? 0.5 : o.amorti, w = o.frequence || 12, n = o.points || 48, pts = [];
    var wd = w * Math.sqrt(Math.max(1e-6, 1 - z * z));
    for (var k = 0; k <= n; k++) {
      var t = k / n;
      var x = z < 1
        ? 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t))
        : 1 - Math.exp(-w * t) * (1 + w * t);
      pts.push(k === n ? 1 : +x.toFixed(3));
    }
    return 'linear(' + pts.join(', ') + ')';
  };

  // rappel({ x, y, nx, ny, dedans }) — coordonnées du pointeur relatives à l'élément
  BR.suivrePointeur = function (el, rappel) {
    function f(e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      rappel({ x: x, y: y, nx: r.width ? x / r.width : 0, ny: r.height ? y / r.height : 0, dedans: x >= 0 && y >= 0 && x <= r.width && y <= r.height });
    }
    addEventListener('pointermove', f, { passive: true });
    return function () { removeEventListener('pointermove', f); };
  };

  var MOTIFS = { selection: [6], leger: [10], moyen: [20], fort: [35], succes: [12, 70, 20], alerte: [25, 90, 25], erreur: [40, 60, 40, 60, 40] };
  BR.motifsVibration = Object.keys(MOTIFS);
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var bascule = null;
  // Android / Chrome : navigator.vibrate. iOS 18+ : petit tic via un interrupteur natif caché (non garanti).
  BR.vibre = function (motif) {
    var p = Array.isArray(motif) ? motif : (MOTIFS[motif] || MOTIFS.leger);
    if (typeof navigator.vibrate === 'function') {
      try { return navigator.vibrate(p); } catch (_) { return false; }
    }
    if (IOS && document.body) {
      if (!bascule) {
        bascule = document.createElement('label');
        bascule.setAttribute('aria-hidden', 'true');
        bascule.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
        bascule.innerHTML = '<input type="checkbox" switch tabindex="-1">';
        document.body.appendChild(bascule);
      }
      var t = 0;
      for (var i = 0; i < p.length; i += 2) {
        (function (d) { setTimeout(function () { bascule.click(); }, d); })(t);
        t += p[i] + (p[i + 1] || 0);
      }
      return true;
    }
    return false;
  };

  /* ==========================================================================
     LOT 3 — CONTRÔLES : interrupteurs et formulaires (contrôles natifs améliorés)
     ========================================================================== */
  var nCtl = 0;
  function idCtl(p) { return 'br' + p + (++nCtl); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function relancer(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  BR.listeControles = function () {
    return ordre.filter(function (n) { return defs[n].controle; }).map(function (n) { return { nom: n, categorie: defs[n].c }; });
  };
  function controle(nom, cat, init) { BR.def(nom, { composant: true, controle: true, c: cat, init: init }); }
  // enveloppe un <input> dans un <span> de décor ; l'input reste au-dessus, transparent, cliquable et focalisable
  function envelopper(input, cls, deco) {
    var w = document.createElement('span');
    w.className = 'br-ctl ' + cls;
    input.parentNode.insertBefore(w, input);
    w.appendChild(input);
    if (deco) w.insertAdjacentHTML('beforeend', deco);
    [].forEach.call(w.children, function (c) { if (c !== input) c.setAttribute('aria-hidden', 'true'); });
    return w;
  }
  function SVC(corps, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + corps + '</svg>';
  }
  var COCHE = '<path d="M5.5 12.5l4 4L18.5 7.5" pathLength="100"/>';
  var CHEVRON = SVC('<path d="M7 10l5 5 5-5"/>', 'br-chev');

  /* ---------- Interrupteurs (input type=checkbox) ---------- */
  function interrupteur(nom, deco, x) {
    x = x || {};
    controle(nom, 'interrupteurs', function (el) {
      if (el.tagName !== 'INPUT') return {};
      var w = envelopper(el, 'br-it br-it-' + nom + (x.cls ? ' ' + x.cls : ''), deco);
      if (x.role !== false) el.setAttribute('role', 'switch');
      var cpt = w.querySelector('.br-it-cpt'), n = parseFloat(el.dataset.nombre);
      if (cpt) { if (isNaN(n)) cpt.remove(); else cpt.textContent = n; }
      el.addEventListener('change', function () {
        relancer(w, 'br-tic');
        if (cpt && !isNaN(n)) { n += el.checked ? 1 : -1; cpt.textContent = n; relancer(cpt, 'br-tic'); }
        emit(el, 'change', { actif: el.checked });
        if (x.change) x.change(el, w);
      });
      if (x.init) x.init(el, w);
      return {};
    });
  }
  interrupteur('interrupteur-rebond', '<span class="br-it-piste"><span class="br-it-bouton"></span></span>');
  interrupteur('interrupteur-plein', '<span class="br-it-piste"><span class="br-it-bouton"></span></span>');
  interrupteur('interrupteur-carre', '<span class="br-it-piste"><span class="br-it-on">I</span><span class="br-it-off">O</span><span class="br-it-bouton"></span></span>');
  interrupteur('interrupteur-courbe',
    '<svg class="br-it-arc" viewBox="0 0 60 34"><path class="br-it-arc-fond" d="M8 27A22 22 0 0 1 52 27"/><path class="br-it-arc-plein" d="M8 27A22 22 0 0 1 52 27" pathLength="100"/></svg><span class="br-it-bouton"></span>');
  interrupteur('bascule-morph', '<span class="br-it-piste"><span class="br-it-bouton">' + SVC('<path class="br-bm-tiret" d="M8 12h8"/><path class="br-bm-coche" d="M7 12.5l3.2 3.2L17 9" pathLength="100"/>') + '</span></span>');
  interrupteur('coche-trace', '<span class="br-ct-rond"></span>' + SVC(COCHE, 'br-ct-svg'), { role: false });
  interrupteur('bascule-theme',
    '<span class="br-it-piste"><i class="br-bt-nuage n1"></i><i class="br-bt-nuage n2"></i><i class="br-bt-etoile e1"></i><i class="br-bt-etoile e2"></i><i class="br-bt-etoile e3"></i>' +
    '<span class="br-it-bouton"><i class="br-bt-cratere c1"></i><i class="br-bt-cratere c2"></i></span></span>', {
      init: function (el) {
        if (!el.hasAttribute('data-applique')) return;
        var t = document.documentElement.getAttribute('data-theme');
        el.checked = t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
      },
      change: function (el) {
        if (!el.hasAttribute('data-applique')) return;
        document.documentElement.setAttribute('data-theme', el.checked ? 'dark' : 'light');
        try { localStorage.setItem('brio-theme', el.checked ? 'dark' : 'light'); } catch (_) {}
      }
    });
  var COEUR24 = 'M12 20.3C6.4 16.4 3 13 3 9.4 3 6.9 5 5 7.4 5c1.9 0 3.5 1 4.6 2.6C13.1 6 14.7 5 16.6 5 19 5 21 6.9 21 9.4c0 3.6-3.4 7-9 10.9Z';
  var SIGNET = 'M6.5 3.5h11v17l-5.5-4-5.5 4Z';
  var POUCE = 'M7.5 13.5V4.5h-3v9ZM7.5 13.5l3.6 6.5c1.4 0 2.4-1.2 2.1-2.5L12.6 14h5.3a2 2 0 0 0 2-2.3l-1.1-5.6a2 2 0 0 0-2-1.6H7.5';
  function action(nom, forme, extra, cls) {
    interrupteur(nom, SVC(extra + '<path class="br-ac-trait" d="' + forme + '"/><path class="br-ac-plein" d="' + forme + '" fill="currentColor" stroke="none"/>', 'br-ac-svg') +
      '<span class="br-it-cpt"></span>', { role: false, cls: 'br-action' + (cls ? ' ' + cls : '') });
  }
  var ECLATS = (function () {
    var s = '<circle class="br-ac-onde" cx="12" cy="12.5" r="9"/>';
    for (var k = 0; k < 6; k++) {
      var a = (k * 60 - 90) * Math.PI / 180;
      s += '<line class="br-ac-eclat" x1="' + (12 + Math.cos(a) * 9.5).toFixed(2) + '" y1="' + (12.5 + Math.sin(a) * 9.5).toFixed(2) + '" x2="' + (12 + Math.cos(a) * 12).toFixed(2) + '" y2="' + (12.5 + Math.sin(a) * 12).toFixed(2) + '"/>';
    }
    return s;
  })();
  action('action-signet', SIGNET, '');
  action('action-jaime', COEUR24, ECLATS);
  action('action-jaime-pas', POUCE, '');
  interrupteur('action-repartage', SVC('<g class="br-rp-fleches"><path d="M5 11V9a2 2 0 0 1 2-2h11"/><path d="M15.5 4.5 18 7l-2.5 2.5"/><path d="M19 13v2a2 2 0 0 1-2 2H6"/><path d="M8.5 19.5 6 17l2.5-2.5"/></g>', 'br-ac-svg') +
    '<span class="br-it-cpt"></span>', { role: false, cls: 'br-action' });

  /* ---------- Onglets en pilule (groupe de boutons radio) ---------- */
  controle('onglets-pilule', 'interrupteurs', function (el) {
    el.classList.add('br-op');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'radiogroup');
    var ind = document.createElement('span');
    ind.className = 'br-op-indicateur';
    ind.setAttribute('aria-hidden', 'true');
    el.insertBefore(ind, el.firstChild);
    var radios = [].slice.call(el.querySelectorAll('input[type="radio"]'));
    var premier = true;
    function placer() {
      var r = radios.filter(function (x) { return x.checked; })[0];
      var lab = r && r.closest('label');
      radios.forEach(function (x) { var l = x.closest('label'); if (l) l.classList.toggle('br-actif', x === r); });
      if (!lab) { ind.style.opacity = '0'; return; }
      ind.style.opacity = '1';
      ind.style.width = lab.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + lab.offsetLeft + 'px)';
      if (premier) { premier = false; return; }
      relancer(ind, 'br-tic');
    }
    radios.forEach(function (x) {
      x.addEventListener('change', function () { placer(); emit(el, 'change', { valeur: x.value }); });
    });
    if ('ResizeObserver' in window) new ResizeObserver(function () { premier = true; placer(); }).observe(el);
    placer();
    return { placer: placer };
  });

  /* ---------- Champs ---------- */
  function champDe(el, sel) { return el.matches(sel) ? el : el.querySelector(sel); }
  function emballage(el, champ, cls) {
    if (el !== champ) { el.classList.add(cls); return el; }
    var w = document.createElement('div');
    w.className = cls;
    champ.parentNode.insertBefore(w, champ);
    w.appendChild(champ);
    return w;
  }

  controle('champ-flottant', 'formulaires', function (el) {
    var c = champDe(el, 'input, textarea');
    if (!c) return {};
    var w = emballage(el, c, 'br-cf');
    if (c.tagName === 'TEXTAREA') w.classList.add('br-cf-zone');
    if (!c.getAttribute('placeholder')) c.setAttribute('placeholder', ' ');
    else if (c.getAttribute('placeholder').trim()) w.classList.add('br-cf-garde');
    return {};
  });

  controle('champ-lueur', 'formulaires', function (el) {
    var c = champDe(el, 'input, textarea, select');
    if (!c) return {};
    emballage(el, c, 'br-cl');
    return {};
  });

  controle('mot-de-passe', 'formulaires', function (el) {
    var c = champDe(el, 'input');
    if (!c) return {};
    var w = emballage(el, c, 'br-mdp');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'br-mdp-oeil';
    b.setAttribute('aria-label', 'Afficher le mot de passe');
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = SVC('<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>' +
      '<path class="br-mdp-barre" d="M4 4l16 16" pathLength="100"/>');
    c.insertAdjacentElement('afterend', b);
    b.addEventListener('click', function () {
      var voir = c.type === 'password', s = c.selectionStart, f = c.selectionEnd;
      c.type = voir ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(voir));
      b.setAttribute('aria-label', voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      relancer(c, 'br-mdp-bascule');
      try { if (s != null) c.setSelectionRange(s, f); } catch (_) {}
    });
    var forceAttr = el.hasAttribute('data-force') || c.hasAttribute('data-force');
    if (forceAttr) {
      var m = document.createElement('div');
      m.className = 'br-mdp-force';
      m.innerHTML = '<span class="br-mdp-barres" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="br-mdp-txt" aria-live="polite"></span>';
      w.insertAdjacentElement('afterend', m);
      var NIV = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'];
      c.addEventListener('input', function () {
        var v = c.value, sc = 0;
        if (v.length >= 8) sc++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) sc++;
        if (/\d/.test(v)) sc++;
        if (/[^A-Za-z0-9]/.test(v)) sc++;
        if (v.length >= 12) sc++;
        var niv = v ? Math.max(1, Math.min(4, sc)) : 0;
        m.dataset.niveau = niv;
        m.querySelector('.br-mdp-txt').textContent = NIV[niv];
      });
    }
    return {};
  });

  controle('recherche-extensible', 'formulaires', function (el) {
    var c = champDe(el, 'input');
    if (!c) return {};
    var w = emballage(el, c, 'br-re');
    if (!c.getAttribute('aria-label') && !(c.id && document.querySelector('label[for="' + c.id + '"]'))) c.setAttribute('aria-label', 'Rechercher');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'br-re-loupe';
    b.setAttribute('aria-label', 'Ouvrir la recherche');
    b.setAttribute('aria-expanded', 'false');
    b.innerHTML = SVC('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>');
    w.insertBefore(b, c);
    c.tabIndex = -1;
    function ouvrir(v) {
      w.classList.toggle('br-ouvert', v);
      b.setAttribute('aria-expanded', String(v));
      b.setAttribute('aria-label', v ? 'Lancer la recherche' : 'Ouvrir la recherche');
      c.tabIndex = v ? 0 : -1;
      if (v) setTimeout(function () { c.focus(); }, 30);
    }
    b.addEventListener('click', function () {
      if (!w.classList.contains('br-ouvert')) { ouvrir(true); return; }
      if (c.value.trim()) emit(el, 'recherche', { valeur: c.value.trim() });
      else ouvrir(false);
    });
    c.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (c.value.trim()) emit(el, 'recherche', { valeur: c.value.trim() }); }
      if (e.key === 'Escape') { c.value = ''; ouvrir(false); b.focus(); }
    });
    c.addEventListener('blur', function () {
      setTimeout(function () { if (!c.value && !w.contains(document.activeElement)) ouvrir(false); }, 120);
    });
    return { ouvrir: ouvrir };
  });

  controle('case-trace', 'formulaires', function (el) {
    var c = champDe(el, 'input[type="checkbox"]');
    if (!c) return {};
    var boite = 'M6 3.5h12a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z';
    var w = envelopper(c, 'br-ct', SVC('<path class="br-ct-fond" d="' + boite + '"/><path class="br-ct-trace" d="' + boite + '" pathLength="100"/>' +
      '<path class="br-ct-coche" d="M7.5 12.3l3 3L16.8 9" pathLength="100"/>'));
    c.addEventListener('change', function () { relancer(w, 'br-tic'); emit(c, 'change', { actif: c.checked }); });
    return {};
  });

  controle('radio-echelle', 'formulaires', function (el) {
    var c = champDe(el, 'input[type="radio"]');
    if (!c) return {};
    var w = envelopper(c, 'br-re-radio', '<span class="br-rd-anneau"></span><span class="br-rd-point"></span>');
    c.addEventListener('change', function () {
      relancer(w, 'br-tic');
      emit(c, 'change', { valeur: c.value });
    });
    return {};
  });

  controle('champ-verifie', 'formulaires', function (el) {
    var c = champDe(el, 'input, textarea, select');
    if (!c) return {};
    var w = emballage(el, c, 'br-cv');
    var msg = document.createElement('p');
    msg.className = 'br-cv-msg';
    msg.id = idCtl('cv');
    msg.setAttribute('aria-live', 'polite');
    var ic = document.createElement('span');
    ic.className = 'br-cv-ic';
    ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = SVC('<circle cx="12" cy="12" r="9.2" pathLength="100"/><path d="M8 12.3l2.7 2.7L16.2 9.4" pathLength="100"/>');
    c.insertAdjacentElement('afterend', ic);
    w.insertAdjacentElement('afterend', msg);
    var ids = (c.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    ids.push(msg.id);
    c.setAttribute('aria-describedby', ids.join(' '));
    var touche = false;
    function verifier(montrer) {
      var vide = !String(c.value).trim(), valide = c.validity.valid;
      var ok = valide && !vide;
      w.classList.toggle('br-ok', ok);
      if (valide) {
        w.classList.remove('br-erreur');
        c.removeAttribute('aria-invalid');
        msg.textContent = '';
        msg.classList.remove('br-visible');
      } else if (montrer) {
        var deja = w.classList.contains('br-erreur');
        w.classList.add('br-erreur');
        c.setAttribute('aria-invalid', 'true');
        msg.textContent = c.dataset.message || c.validationMessage;
        msg.classList.add('br-visible');
        if (!deja || montrer === 'secoue') relancer(w, 'br-secoue');
      }
    }
    c.addEventListener('blur', function () { touche = true; verifier(true); });
    c.addEventListener('input', function () { verifier(touche && w.classList.contains('br-erreur')); });
    c.addEventListener('invalid', function (e) {
      e.preventDefault();
      touche = true;
      verifier('secoue');
      var f = c.form;
      if (f && !f._brFocus) { f._brFocus = true; c.focus(); setTimeout(function () { f._brFocus = false; }, 50); }
    });
    return { verifier: verifier };
  });

  controle('liste-deroulante', 'formulaires', function (el) {
    var sel = champDe(el, 'select');
    if (!sel || sel.multiple) return {};
    var w = document.createElement('div');
    w.className = 'br-ld';
    sel.parentNode.insertBefore(w, sel);
    w.appendChild(sel);
    sel.classList.add('br-natif');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    var id = idCtl('ld'), options = [].slice.call(sel.options);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'br-ld-bouton';
    b.id = id + '-b';
    b.setAttribute('aria-haspopup', 'listbox');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', id + '-l');
    b.innerHTML = '<span class="br-ld-valeur" id="' + id + '-v"></span>' + CHEVRON;
    var lab = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null;
    var liste = document.createElement('ul');
    liste.className = 'br-ld-liste';
    liste.id = id + '-l';
    liste.setAttribute('role', 'listbox');
    liste.tabIndex = -1;
    if (lab) {
      if (!lab.id) lab.id = id + '-e';
      b.setAttribute('aria-labelledby', lab.id + ' ' + id + '-v');
      liste.setAttribute('aria-labelledby', lab.id);
      lab.addEventListener('click', function (e) { e.preventDefault(); b.focus(); });
    } else if (sel.getAttribute('aria-label')) {
      b.setAttribute('aria-label', sel.getAttribute('aria-label'));
      liste.setAttribute('aria-label', sel.getAttribute('aria-label'));
    }
    options.forEach(function (o, i) {
      var li = document.createElement('li');
      li.id = id + '-o' + i;
      li.setAttribute('role', 'option');
      li.dataset.i = i;
      li.innerHTML = SVC(COCHE, 'br-ld-coche') + '<span>' + esc(o.textContent) + '</span>';
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      liste.appendChild(li);
    });
    w.appendChild(b);
    w.appendChild(liste);
    var actif = 0, ouvert = false, tampon = '', tT = 0;
    function maj() {
      var o = options[sel.selectedIndex];
      w.querySelector('.br-ld-valeur').textContent = o ? o.textContent : '';
      w.classList.toggle('br-vide', !o || o.value === '');
      [].forEach.call(liste.children, function (li, i) { li.setAttribute('aria-selected', String(i === sel.selectedIndex)); });
    }
    function surligner(i) {
      if (!options[i]) return;
      actif = i;
      [].forEach.call(liste.children, function (li, k) { li.classList.toggle('br-actif', k === i); });
      liste.setAttribute('aria-activedescendant', liste.children[i].id);
      var li = liste.children[i];
      if (li.offsetTop < liste.scrollTop) liste.scrollTop = li.offsetTop - 4;
      else if (li.offsetTop + li.offsetHeight > liste.scrollTop + liste.clientHeight) liste.scrollTop = li.offsetTop + li.offsetHeight - liste.clientHeight + 4;
    }
    function ouvrir() {
      if (ouvert) return;
      ouvert = true;
      var r = b.getBoundingClientRect(), bas = innerHeight - r.bottom;
      w.classList.toggle('br-haut', bas < 240 && r.top > bas);
      w.classList.add('br-ouvert');
      b.setAttribute('aria-expanded', 'true');
      surligner(Math.max(0, sel.selectedIndex));
      liste.focus({ preventScroll: true });
    }
    function fermer(focus) {
      if (!ouvert) return;
      ouvert = false;
      w.classList.remove('br-ouvert');
      b.setAttribute('aria-expanded', 'false');
      if (focus) b.focus();
    }
    function choisir(i) {
      var o = options[i];
      if (!o || o.disabled) return;
      if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      maj();
      fermer(true);
    }
    function deplacer(d) {
      var i = actif;
      do { i += d; } while (options[i] && options[i].disabled);
      if (options[i]) surligner(i);
    }
    b.addEventListener('click', function () { if (ouvert) fermer(true); else ouvrir(); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) >= 0) { e.preventDefault(); ouvrir(); }
    });
    liste.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); deplacer(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); deplacer(-1); }
      else if (k === 'Home') { e.preventDefault(); actif = -1; deplacer(1); }
      else if (k === 'End') { e.preventDefault(); actif = options.length; deplacer(-1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choisir(actif); }
      else if (k === 'Escape') { e.preventDefault(); fermer(true); }
      else if (k === 'Tab') fermer(false);
      else if (k.length === 1 && /\S/.test(k)) {
        tampon += k.toLowerCase();
        clearTimeout(tT);
        tT = setTimeout(function () { tampon = ''; }, 600);
        for (var j = 1; j <= options.length; j++) {
          var idx = (actif + (tampon.length > 1 ? 0 : j)) % options.length;
          if (!options[idx].disabled && options[idx].textContent.trim().toLowerCase().indexOf(tampon) === 0) { surligner(idx); break; }
        }
      }
    });
    liste.addEventListener('click', function (e) { var li = e.target.closest('[role="option"]'); if (li) choisir(+li.dataset.i); });
    liste.addEventListener('pointermove', function (e) {
      var li = e.target.closest('[role="option"]');
      if (li && +li.dataset.i !== actif && li.getAttribute('aria-disabled') !== 'true') surligner(+li.dataset.i);
    });
    document.addEventListener('pointerdown', function (e) { if (ouvert && !w.contains(e.target)) fermer(false); });
    sel.addEventListener('change', maj);
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(maj, 0); });
    maj();
    return { ouvrir: ouvrir, fermer: fermer };
  });

  controle('choix-multiples', 'formulaires', function (el) {
    var sel = champDe(el, 'select');
    if (!sel || !sel.multiple) return {};
    var w = document.createElement('div');
    w.className = 'br-cm';
    sel.parentNode.insertBefore(w, sel);
    w.appendChild(sel);
    sel.classList.add('br-natif');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    var id = idCtl('cm'), options = [].slice.call(sel.options);
    var lab = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null;
    if (lab && !lab.id) lab.id = id + '-e';
    var puces = document.createElement('div');
    puces.className = 'br-cm-puces';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'br-cm-bouton';
    b.setAttribute('aria-haspopup', 'listbox');
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', id + '-l');
    if (lab) b.setAttribute('aria-labelledby', lab.id);
    else b.setAttribute('aria-label', sel.getAttribute('aria-label') || 'Choisir');
    b.innerHTML = '<span>' + esc(sel.dataset.indice || el.dataset.indice || 'Ajouter…') + '</span>' + CHEVRON;
    puces.appendChild(b);
    var liste = document.createElement('ul');
    liste.className = 'br-ld-liste br-cm-liste';
    liste.id = id + '-l';
    liste.setAttribute('role', 'listbox');
    liste.setAttribute('aria-multiselectable', 'true');
    liste.tabIndex = -1;
    if (lab) liste.setAttribute('aria-labelledby', lab.id);
    options.forEach(function (o, i) {
      var li = document.createElement('li');
      li.id = id + '-o' + i;
      li.setAttribute('role', 'option');
      li.dataset.i = i;
      li.innerHTML = '<span class="br-cm-case">' + SVC(COCHE) + '</span><span>' + esc(o.textContent) + '</span>';
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      liste.appendChild(li);
    });
    w.appendChild(puces);
    w.appendChild(liste);
    var actif = 0, ouvert = false, presentes = {};
    function rendre() {
      options.forEach(function (o, i) {
        liste.children[i].setAttribute('aria-selected', String(o.selected));
        var p = presentes[i];
        if (o.selected && !p) {
          p = document.createElement('span');
          p.className = 'br-cm-puce br-entre';
          p.innerHTML = '<span>' + esc(o.textContent) + '</span><button type="button" aria-label="Retirer ' + esc(o.textContent) + '">' + SVC('<path d="M7 7l10 10M17 7 7 17"/>') + '</button>';
          p.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); basculer(i); b.focus(); });
          puces.insertBefore(p, b);
          presentes[i] = p;
          setTimeout(function () { p.classList.remove('br-entre'); }, 400);
        } else if (!o.selected && p) {
          delete presentes[i];
          p.classList.add('br-sort');
          setTimeout(function () { p.remove(); }, calme() ? 0 : 220);
        }
      });
      w.classList.toggle('br-vide', !options.some(function (o) { return o.selected; }));
    }
    function basculer(i) {
      var o = options[i];
      if (!o || o.disabled) return;
      o.selected = !o.selected;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      rendre();
      emit(sel, 'change', { valeurs: options.filter(function (x) { return x.selected; }).map(function (x) { return x.value; }) });
    }
    function surligner(i) {
      if (!options[i]) return;
      actif = i;
      [].forEach.call(liste.children, function (li, k) { li.classList.toggle('br-actif', k === i); });
      liste.setAttribute('aria-activedescendant', liste.children[i].id);
    }
    function ouvrir() {
      if (ouvert) return;
      ouvert = true;
      w.classList.add('br-ouvert');
      b.setAttribute('aria-expanded', 'true');
      surligner(actif);
      liste.focus({ preventScroll: true });
    }
    function fermer(focus) {
      if (!ouvert) return;
      ouvert = false;
      w.classList.remove('br-ouvert');
      b.setAttribute('aria-expanded', 'false');
      if (focus) b.focus();
    }
    b.addEventListener('click', function () { if (ouvert) fermer(true); else ouvrir(); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'Enter', ' '].indexOf(e.key) >= 0) { e.preventDefault(); ouvrir(); }
      else if (e.key === 'Backspace') {
        var dern = options.map(function (o, i) { return o.selected ? i : -1; }).filter(function (i) { return i >= 0; }).pop();
        if (dern != null) basculer(dern);
      }
    });
    liste.addEventListener('keydown', function (e) {
      var k = e.key, i = actif;
      if (k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        do { i += k === 'ArrowDown' ? 1 : -1; } while (options[i] && options[i].disabled);
        surligner(i);
      }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); basculer(actif); }
      else if (k === 'Escape') { e.preventDefault(); fermer(true); }
      else if (k === 'Tab') fermer(false);
    });
    liste.addEventListener('click', function (e) { var li = e.target.closest('[role="option"]'); if (li) { surligner(+li.dataset.i); basculer(+li.dataset.i); } });
    document.addEventListener('pointerdown', function (e) { if (ouvert && !w.contains(e.target)) fermer(false); });
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(rendre, 0); });
    rendre();
    return { ouvrir: ouvrir, fermer: fermer };
  });

  controle('zone-auto', 'formulaires', function (el) {
    var ta = champDe(el, 'textarea');
    if (!ta) return {};
    var w = emballage(el, ta, 'br-za');
    var max = parseFloat(el.dataset.max || ta.dataset.max) || 320;
    ta.style.resize = 'none';
    ta.style.overflowY = 'hidden';
    var compte = null, txt = null, arc = null;
    if (ta.maxLength > 0) {
      compte = document.createElement('span');
      compte.className = 'br-za-compte';
      compte.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" pathLength="100"/><circle class="br-za-arc" cx="10" cy="10" r="7.5" pathLength="100"/></svg><span aria-live="polite"></span>';
      w.appendChild(compte);
      txt = compte.querySelector('span');
      arc = compte.querySelector('.br-za-arc');
    }
    var prem = true;
    function ajuster() {
      var avant = ta.offsetHeight;
      ta.style.transition = 'none';
      ta.style.height = 'auto';
      var cible = Math.min(max, ta.scrollHeight + (ta.offsetHeight - ta.clientHeight));
      ta.style.height = avant + 'px';
      void ta.offsetHeight;
      ta.style.transition = prem ? 'none' : '';
      ta.style.height = cible + 'px';
      ta.style.overflowY = ta.scrollHeight > cible + 1 ? 'auto' : 'hidden';
      prem = false;
      if (compte) {
        var n = ta.value.length, r = n / ta.maxLength;
        txt.textContent = r >= .8 ? (ta.maxLength - n) : '';
        compte.dataset.niveau = r >= 1 ? 'plein' : r >= .8 ? 'proche' : r >= .5 ? '' : 'cache';
        arc.style.strokeDashoffset = (100 - Math.min(1, r) * 100).toFixed(1);
      }
    }
    ta.addEventListener('input', ajuster);
    if (ta.form) ta.form.addEventListener('reset', function () { setTimeout(ajuster, 0); });
    if ('ResizeObserver' in window) {
      var larg = 0;
      new ResizeObserver(function () { if (ta.clientWidth !== larg) { larg = ta.clientWidth; ajuster(); } }).observe(ta);
    }
    ajuster();
    return { ajuster: ajuster };
  });

  controle('code-otp', 'formulaires', function (el) {
    var n = Math.max(2, Math.min(10, parseInt(el.dataset.longueur, 10) || 4));
    el.classList.add('br-otp');
    el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) el.setAttribute('aria-label', 'Code de vérification');
    var champ = document.createElement('input');
    champ.type = 'hidden';
    champ.name = el.dataset.nom || 'code';
    el.appendChild(champ);
    var cases = [];
    for (var i = 0; i < n; i++) {
      var c = document.createElement('input');
      c.type = 'text';
      c.inputMode = 'numeric';
      c.autocomplete = i === 0 ? 'one-time-code' : 'off';
      c.maxLength = n;
      c.className = 'br-otp-case';
      c.setAttribute('aria-label', 'Chiffre ' + (i + 1) + ' sur ' + n);
      el.appendChild(c);
      cases.push(c);
    }
    function valeur() { return cases.map(function (x) { return x.value; }).join(''); }
    function remplir(depuis, texte) {
      var chiffres = String(texte).replace(/\D/g, '').split('');
      for (var k = depuis; k < n && chiffres.length; k++) { cases[k].value = chiffres.shift(); relancer(cases[k], 'br-pop'); }
      var vide = cases.filter(function (x) { return !x.value; })[0];
      (vide || cases[n - 1]).focus();
      verifier();
    }
    function verifier() {
      var v = valeur();
      champ.value = v;
      el.classList.toggle('br-complet', v.length === n);
      el.classList.remove('br-valide');
      if (v.length !== n) return;
      emit(el, 'complet', { code: v });
      var att = el.dataset.attendu;
      if (!att) return;
      if (v === att) { el.classList.add('br-valide'); return; }
      relancer(el, 'br-faux');
      setTimeout(function () {
        cases.forEach(function (x) { x.value = ''; });
        el.classList.remove('br-faux', 'br-complet');
        champ.value = '';
        cases[0].focus();
      }, 650);
    }
    cases.forEach(function (c, i) {
      c.addEventListener('input', function (e) {
        var v = (e.inputType === 'insertText' && e.data && e.data.length === 1 ? e.data : c.value).replace(/\D/g, '');
        if (v.length > 1) { c.value = ''; remplir(i, v); return; }
        c.value = v;
        if (v) { relancer(c, 'br-pop'); if (cases[i + 1]) cases[i + 1].focus(); }
        verifier();
      });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !c.value && cases[i - 1]) { e.preventDefault(); cases[i - 1].value = ''; cases[i - 1].focus(); verifier(); }
        else if (e.key === 'ArrowLeft' && cases[i - 1]) { e.preventDefault(); cases[i - 1].focus(); }
        else if (e.key === 'ArrowRight' && cases[i + 1]) { e.preventDefault(); cases[i + 1].focus(); }
      });
      c.addEventListener('paste', function (e) {
        var t = (e.clipboardData || window.clipboardData).getData('text');
        if (t) { e.preventDefault(); remplir(i, t); }
      });
      c.addEventListener('focus', function () { try { c.setSelectionRange(0, c.value.length); } catch (_) {} });
    });
    return { vider: function () { cases.forEach(function (x) { x.value = ''; }); verifier(); } };
  });

  controle('depot-fichiers', 'formulaires', function (el) {
    var input = champDe(el, 'input[type="file"]');
    var zone = el;
    if (el.tagName === 'INPUT') { zone = document.createElement('div'); el.parentNode.insertBefore(zone, el); zone.appendChild(el); }
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      if (el.hasAttribute('data-multiple')) input.multiple = true;
      if (el.dataset.accepte) input.accept = el.dataset.accepte;
      if (el.dataset.nom) input.name = el.dataset.nom;
    }
    zone.classList.add('br-df');
    if (!input.id) input.id = idCtl('df');
    var lab = document.createElement('label');
    lab.className = 'br-df-zone';
    lab.htmlFor = input.id;
    lab.innerHTML = SVC('<path class="br-df-fleche" d="M12 15.5V5M7.5 9.5 12 5l4.5 4.5"/><path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>', 'br-df-ic') +
      '<span class="br-df-titre">' + esc(el.dataset.texte || (input.multiple ? 'Glisse tes fichiers ici' : 'Glisse un fichier ici')) + '</span>' +
      '<span class="br-df-sous">ou <u>parcourir</u>' + (input.accept ? ' · ' + esc(input.accept.replace(/,/g, ', ')) : '') + '</span>';
    lab.insertBefore(input, lab.firstChild);
    input.classList.add('br-natif');
    zone.appendChild(lab);
    var ul = document.createElement('ul');
    ul.className = 'br-df-liste';
    ul.setAttribute('aria-live', 'polite');
    zone.appendChild(ul);
    var fichiers = [];
    function taille(o) { return o < 1024 ? o + ' o' : o < 1048576 ? (o / 1024).toFixed(o < 10240 ? 1 : 0).replace('.', ',') + ' Ko' : (o / 1048576).toFixed(1).replace('.', ',') + ' Mo'; }
    function synchroniser() {
      try { var dt = new DataTransfer(); fichiers.forEach(function (f) { dt.items.add(f); }); input.files = dt.files; } catch (_) {}
    }
    function rendre(nouveaux) {
      ul.textContent = '';
      fichiers.forEach(function (f, i) {
        var li = document.createElement('li');
        li.className = 'br-df-fichier' + (nouveaux && nouveaux.indexOf(f) >= 0 ? ' br-entre' : '');
        li.style.setProperty('--i', i);
        li.innerHTML = SVC('<path d="M7 3.5h6.5l4.5 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M13 3.5V8.5h5"/>', 'br-df-doc') +
          '<span class="br-df-nom"></span><span class="br-df-poids">' + taille(f.size) + '</span>' +
          '<button type="button" class="br-df-retirer">' + SVC('<path d="M7 7l10 10M17 7 7 17"/>') + '</button>';
        li.querySelector('.br-df-nom').textContent = f.name;
        var bt = li.querySelector('button');
        bt.setAttribute('aria-label', 'Retirer ' + f.name);
        bt.addEventListener('click', function () {
          li.classList.add('br-sort');
          setTimeout(function () {
            fichiers.splice(fichiers.indexOf(f), 1);
            synchroniser();
            rendre();
            emit(el, 'fichiers', { fichiers: fichiers.slice() });
            input.focus();
          }, calme() ? 0 : 220);
        });
        ul.appendChild(li);
      });
      zone.classList.toggle('br-plein', fichiers.length > 0);
    }
    function ajouter(liste) {
      liste = [].slice.call(liste || []);
      if (!liste.length) return;
      fichiers = input.multiple ? fichiers.concat(liste) : liste.slice(0, 1);
      synchroniser();
      rendre(liste);
      emit(el, 'fichiers', { fichiers: fichiers.slice() });
    }
    var avant = [];
    input.addEventListener('click', function () { avant = fichiers.slice(); });
    input.addEventListener('change', function (e) {
      if (!e.isTrusted) return;
      var choisis = [].slice.call(input.files || []);
      fichiers = avant;
      ajouter(choisis);
    });
    var prof = 0;
    lab.addEventListener('dragenter', function (e) { e.preventDefault(); prof++; zone.classList.add('br-survol'); });
    lab.addEventListener('dragover', function (e) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
    lab.addEventListener('dragleave', function () { if (--prof <= 0) { prof = 0; zone.classList.remove('br-survol'); } });
    lab.addEventListener('drop', function (e) {
      e.preventDefault();
      prof = 0;
      zone.classList.remove('br-survol');
      relancer(zone, 'br-depose');
      if (e.dataTransfer) ajouter(e.dataTransfer.files);
    });
    if (input.form) input.form.addEventListener('reset', function () { fichiers = []; setTimeout(function () { synchroniser(); rendre(); }, 0); });
    return { fichiers: function () { return fichiers.slice(); }, ajouter: ajouter };
  });

  controle('curseur-ressort', 'formulaires', function (el) {
    var r = champDe(el, 'input[type="range"]');
    if (!r) return {};
    var w = r === el ? envelopper(r, 'br-cr') : el;
    w.classList.add('br-cr');
    var bulle = document.createElement('span');
    bulle.className = 'br-cr-bulle';
    bulle.setAttribute('aria-hidden', 'true');
    w.appendChild(bulle);
    var min = r.min === '' ? 0 : +r.min, max = r.max === '' ? 100 : +r.max;
    var unite = el.dataset.unite || r.dataset.unite || '';
    var vit = 0, ang = 0, dernier = +r.value, raf = 0;
    function placer() {
      var p = (r.value - min) / ((max - min) || 1);
      w.style.setProperty('--br-pc', p.toFixed(4));
      bulle.textContent = String(r.value).replace('.', ',') + unite;
    }
    function balancer() {
      ang += (Math.max(-28, Math.min(28, vit * -1.6)) - ang) * .25;
      vit *= .8;
      bulle.style.setProperty('--br-incl', ang.toFixed(2) + 'deg');
      if (Math.abs(ang) > .05 || Math.abs(vit) > .05) raf = requestAnimationFrame(balancer);
      else { raf = 0; bulle.style.setProperty('--br-incl', '0deg'); }
    }
    r.addEventListener('input', function () {
      var v = +r.value;
      vit += (v - dernier) / ((max - min) || 1) * 70;
      dernier = v;
      placer();
      if (!raf && !calme()) raf = requestAnimationFrame(balancer);
    });
    placer();
    return { placer: placer };
  });

  controle('envoi-formulaire', 'formulaires', function (form) {
    if (form.tagName !== 'FORM') return {};
    form.classList.add('br-ef');
    var corps = document.createElement('div');
    corps.className = 'br-ef-corps';
    while (form.firstChild) corps.appendChild(form.firstChild);
    form.appendChild(corps);
    var bouton = form.querySelector('[type="submit"]');
    var largeur = 0;
    if (bouton) {
      bouton.classList.add('br-ef-bouton');
      if (!bouton.querySelector('.br-ef-l')) {
        var l = document.createElement('span');
        l.className = 'br-ef-l';
        while (bouton.firstChild) l.appendChild(bouton.firstChild);
        bouton.appendChild(l);
      }
      bouton.insertAdjacentHTML('beforeend', '<span class="br-ef-ic" aria-hidden="true"><svg class="br-ef-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6" opacity=".25"/><path d="M14 8a6 6 0 0 0-6-6"/></svg></span>');
    }
    var erreur = document.createElement('p');
    erreur.className = 'br-ef-erreur';
    erreur.setAttribute('role', 'alert');
    corps.appendChild(erreur);
    var succes = document.createElement('div');
    succes.className = 'br-ef-succes';
    succes.setAttribute('role', 'status');
    succes.tabIndex = -1;
    succes.hidden = true;
    succes.innerHTML = SVC('<circle cx="12" cy="12" r="9.5" pathLength="100"/><path d="M7.8 12.4l2.9 2.9 5.6-6" pathLength="100"/>', 'br-ef-coche') +
      '<p class="br-ef-merci">' + esc(form.dataset.succes || 'Merci, c’est envoyé.') + '</p>' +
      (form.dataset.retour === 'false' ? '' : '<button type="button" class="br-ef-retour">' + esc(form.dataset.retour || 'Envoyer une autre réponse') + '</button>');
    form.appendChild(succes);
    function bouger(apres) {
      var h1 = form.offsetHeight;
      apres();
      var h2 = form.offsetHeight;
      if (calme() || h1 === h2) return;
      form.style.height = h1 + 'px';
      form.style.overflow = 'hidden';
      void form.offsetHeight;
      form.style.transition = 'height .5s var(--br-ressort-doux)';
      form.style.height = h2 + 'px';
      setTimeout(function () { form.style.height = form.style.overflow = form.style.transition = ''; }, 520);
    }
    function etatBouton(e) {
      if (!bouton) return;
      if (e === 'chargement') { largeur = bouton.offsetWidth; bouton.style.width = largeur + 'px'; void bouton.offsetWidth; bouton.style.width = bouton.offsetHeight + 'px'; }
      else { bouton.style.width = largeur + 'px'; setTimeout(function () { bouton.style.width = ''; }, 450); }
      bouton.dataset.etat = e;
    }
    var envoi = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (envoi) return;
      if (form.noValidate && !form.checkValidity()) { form.reportValidity(); return; }
      envoi = true;
      erreur.textContent = '';
      var donnees = new FormData(form);
      form.classList.add('br-envoi');
      form.setAttribute('aria-busy', 'true');
      corps.inert = true;
      etatBouton('chargement');
      var fini = false;
      function terminer(ok, message) {
        if (fini) return;
        fini = true;
        envoi = false;
        form.classList.remove('br-envoi');
        form.removeAttribute('aria-busy');
        corps.inert = false;
        etatBouton('repos');
        if (ok) {
          bouger(function () { corps.hidden = true; succes.hidden = false; });
          relancer(succes, 'br-tic');
          succes.focus({ preventScroll: true });
          emit(form, 'envoye', {});
        } else {
          erreur.textContent = message || form.dataset.erreur || 'L’envoi a échoué. Réessaie dans un instant.';
          if (bouton) relancer(bouton, 'br-secoue');
        }
      }
      form.dispatchEvent(new CustomEvent('brio:envoi', { bubbles: true, detail: { donnees: donnees, terminer: terminer } }));
      if (form.hasAttribute('data-demo')) setTimeout(function () { terminer(Math.random() < .8, 'Le serveur ne répond pas. Réessaie.'); }, calme() ? 300 : 1500);
    });
    succes.addEventListener('click', function (e) {
      if (!e.target.closest('.br-ef-retour')) return;
      form.reset();
      bouger(function () { succes.hidden = true; corps.hidden = false; });
      var premier = corps.querySelector('input, textarea, select, button');
      if (premier) premier.focus();
    });
    return {};
  });

  /* ==========================================================================
     LOT 4 — SCÈNES PHYSIQUES (data-brio sur un conteneur, vide ou non)
     Modes : bascule (clic = ouvre / ferme, aria-pressed), jeu (joue à l'entrée
     dans l'écran, clic = rejoue), boucle (clic = pause), libre (pointeur + ressorts).
     Options : data-taille (facteur, 1 = 180 × 130 px), data-vitesse, data-label,
     data-ouvert (bascule), data-declencheur="clic" et data-boucle (jeu).
     ========================================================================== */
  function composant(nom, famille, cat, mode, init) {
    BR.def(nom, { composant: true, famille: famille, c: cat, mode: mode, init: init });
  }
  BR.listeComposants = function (famille) {
    return ordre.filter(function (n) { return defs[n].famille && (!famille || defs[n].famille === famille); })
      .map(function (n) { return { nom: n, categorie: defs[n].c, famille: defs[n].famille, mode: defs[n].mode }; });
  };
  var rejouerAvant = BR.rejouer;
  BR.rejouer = function (el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    if (el._br && el._br.rejouer) el._br.rejouer();
    rejouerAvant(el);
  };

  // ressort amorti (Euler semi-implicite, 4 sous-pas) : x tend vers cible
  function Ressort(x, k, c) { this.x = this.cible = x || 0; this.v = 0; this.k = k || 170; this.c = c || 14; }
  Ressort.prototype.pas = function (dt) {
    for (var i = 0, h = dt / 4; i < 4; i++) {
      this.v += (-this.k * (this.x - this.cible) - this.c * this.v) * h;
      this.x += this.v * h;
    }
    return Math.abs(this.v) > .01 || Math.abs(this.x - this.cible) > .01;
  };
  BR.Ressort = Ressort;
  // boucle rAF qui s'endort au repos ; renvoie la fonction « réveiller »
  function moteur(pas) {
    var raf = 0, avant = 0;
    function tic(t) {
      var dt = Math.min(.034, Math.max(0, (t - avant) / 1000)); avant = t;
      raf = pas(dt) ? requestAnimationFrame(tic) : 0;
    }
    return function () { if (!raf) { avant = performance.now(); raf = requestAnimationFrame(tic); } };
  }
  function borne(v, a, b) { return v < a ? a : v > b ? b : v; }
  function echelle(el) { return (parseFloat(getComputedStyle(el).fontSize) || 10) / 10; }
  function svgSc(corps, vb) { return '<svg viewBox="' + (vb || '0 0 180 130') + '" fill="none" aria-hidden="true">' + corps + '</svg>'; }

  var obsSc = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target;
      el.classList.toggle('br-hors', !e.isIntersecting);
      el._brVu = e.isIntersecting;
      if (e.isIntersecting && el._brAuto && el._br && el._br.rejouer) { el._brAuto = false; el._br.rejouer(); }
    });
  }, { threshold: .35 }) : null;

  var LIB = { bascule: 'Ouvrir ou fermer', jeu: 'Rejouer l’animation', boucle: 'Mettre en pause l’animation', libre: 'Donner une impulsion' };
  function scene(nom, cat, mode, html, x) {
    x = x || {};
    composant(nom, x.famille || 'physique', cat, mode, function (el) {
      var contenu = el.innerHTML.trim(), api = {};
      el.classList.add('br-sc', 'br-sc-' + mode);
      var t = parseFloat(el.dataset.taille); if (t > 0) el.style.setProperty('--br-sc-taille', t);
      var v = parseFloat(el.dataset.vitesse); if (v > 0) el.style.setProperty('--br-v', v);
      el.innerHTML = typeof html === 'function' ? html(el, contenu) : html;
      [].forEach.call(el.children, function (c) { c.setAttribute('aria-hidden', 'true'); });
      var lab = el.getAttribute('aria-label') || el.dataset.label || x.label || LIB[mode];
      el.setAttribute('aria-label', lab);
      if (!x.roleLibre) {
        el.setAttribute('role', 'button');
        if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      }
      function activer() {
        if (mode === 'bascule') api.basculer();
        else if (mode === 'jeu') api.rejouer();
        else if (mode === 'boucle') api.pause(!el.classList.contains('br-pause'));
        else if (api.impulsion) api.impulsion();
      }
      if (!x.roleLibre) {
        el.addEventListener('click', function (e) { if (!el._brGlisse) activer(); el._brGlisse = false; });
        el.addEventListener('keydown', function (e) {
          if (e.target !== el || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault(); activer();
        });
      }
      if (mode === 'bascule') {
        api.basculer = function (f) {
          var o = el.classList.toggle('br-ouvert', f);
          el.setAttribute('aria-pressed', String(o));
          if (x.change) x.change(el, o);
          emit(el, 'change', { ouvert: o });
        };
        var o0 = el.hasAttribute('data-ouvert') && el.dataset.ouvert !== 'false';
        el.classList.toggle('br-ouvert', o0);
        el.setAttribute('aria-pressed', String(o0));
      }
      if (mode === 'jeu') {
        var minuteur = 0, vit = v > 0 ? v : 1;
        api.rejouer = function () {
          clearTimeout(minuteur);
          if (x.debut) x.debut(el);
          relancer(el, 'br-joue');
          minuteur = setTimeout(function fin() {
            if (x.fin) x.fin(el);
            emit(el, 'fin', {});
            if (el.hasAttribute('data-boucle') && el._brVu !== false && !calme()) minuteur = setTimeout(api.rejouer, 1200);
          }, x.duree / vit);
        };
        if (el.dataset.declencheur !== 'clic' && !calme()) el._brAuto = true;
      }
      if (mode === 'boucle') {
        api.pause = function (p) {
          el.classList.toggle('br-pause', p);
          el.setAttribute('aria-pressed', String(p));
        };
        api.pause(calme());
      }
      if (obsSc) obsSc.observe(el); else if (api.rejouer && el._brAuto) setTimeout(api.rejouer, 60);
      if (x.init) {
        var r = x.init(el, api);
        if (r) for (var k in r) api[k] = r[k];
      }
      if (x.debut && mode === 'jeu') x.debut(el);
      return api;
    });
  }

  /* ---------- Ressorts et élasticité ---------- */
  var DOCK = [
    ['Fichiers', '<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5Z"/>', '#4c8dff', '#2f5fe0'],
    ['Messages', '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V16h-.5A1.5 1.5 0 0 1 4 14.5Z"/>', '#3fd27f', '#18a65a'],
    ['Photos', '<rect x="4" y="5.5" width="16" height="13" rx="2"/><path d="M4 15l4.5-4.5 4 4 2.5-2.5 5 5"/><circle cx="15.5" cy="9.5" r="1.2"/>', '#ffb648', '#f2733a'],
    ['Musique', '<path d="M9 17.5V6.5l10-2v11"/><circle cx="6.8" cy="17.5" r="2.2"/><circle cx="16.8" cy="15.5" r="2.2"/>', '#ff6a8d', '#e0335f'],
    ['Agenda', '<rect x="5" y="6" width="14" height="13.5" rx="2"/><path d="M5 10.5h14M9 4.5v3M15 4.5v3"/>', '#a678ff', '#6a45ff'],
    ['Réglages', '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M6 18l1.8-1.8M16.2 7.8 18 6"/>', '#8d96a8', '#59606e']
  ];
  scene('dock-ressort', 'ressorts', 'libre', function (el) {
    var enfants = [].filter.call(el.children, function (c) { return c.nodeType === 1; });
    if (enfants.length) {
      var b = document.createElement('div');
      b.className = 'br-dk-barre';
      enfants.forEach(function (c) { c.classList.add('br-dk-app'); b.appendChild(c); });
      el.textContent = '';
      return b.outerHTML;
    }
    return '<div class="br-dk-barre">' + DOCK.map(function (d) {
      return '<button type="button" class="br-dk-app" style="--a:' + d[2] + ';--b:' + d[3] + '" aria-label="' + d[0] + '">' + SVC(d[1]) + '<i class="br-dk-pt"></i></button>';
    }).join('') + '</div>';
  }, {
    roleLibre: true,
    init: function (el) {
      var barre = el.querySelector('.br-dk-barre');
      barre.removeAttribute('aria-hidden');
      barre.setAttribute('role', 'toolbar');
      barre.setAttribute('aria-label', el.dataset.label || 'Dock');
      el.removeAttribute('aria-label');
      var apps = [].slice.call(barre.children), R = apps.map(function () { return new Ressort(1, 300, 26); }), px = null, foc = null;
      apps.forEach(function (a, i) {
        a.tabIndex = i ? -1 : 0;
        a.addEventListener('focus', function () { foc = i; cibles(); });
        a.addEventListener('blur', function () { foc = null; cibles(); });
        a.addEventListener('click', function () { relancer(a, 'br-saute'); a.classList.add('br-actif'); emit(el, 'change', { app: a.getAttribute('aria-label') || a.textContent.trim(), index: i }); });
      });
      barre.addEventListener('keydown', function (e) {
        var i = apps.indexOf(document.activeElement); if (i < 0) return;
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? apps.length - 1 : -2;
        if (j === -2) return;
        e.preventDefault(); j = (j + apps.length) % apps.length;
        apps[i].tabIndex = -1; apps[j].tabIndex = 0; apps[j].focus();
      });
      // grossissement selon la distance au pointeur (ou à l'icône focalisée), positions de repos
      function cibles() {
        var k = echelle(el), u = 30 * k, pasL = 37 * k, n = apps.length;
        var p = px != null ? px : foc != null ? (foc - (n - 1) / 2) * pasL : null;
        apps.forEach(function (a, i) {
          if (p == null) { R[i].cible = 1; return; }
          var d = (p - (i - (n - 1) / 2) * pasL) / (u * 1.45);
          R[i].cible = 1 + .85 * Math.exp(-d * d);
        });
        reveil();
      }
      var reveil = moteur(function (dt) {
        var actif = false;
        R.forEach(function (r, i) { actif = r.pas(dt) || actif; apps[i].style.setProperty('--s', r.x.toFixed(3)); });
        return actif;
      });
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = el.getBoundingClientRect();
        px = e.clientX - (r.left + r.width / 2); cibles();
      });
      el.addEventListener('pointerleave', function () { px = null; cibles(); });
      return {};
    }
  });

  scene('etiquette-elastique', 'ressorts', 'libre', function (el) {
    return '<i class="br-ee-crochet"></i><div class="br-ee-bras"><i class="br-ee-fil"></i><div class="br-ee-tag"><i class="br-ee-trou"></i><b>' +
      esc(el.dataset.titre || 'Soldes') + '</b><span>' + esc(el.dataset.texte || '−30 %') + '</span></div></div>';
  }, {
    label: 'Tirer l’étiquette',
    init: function (el, api) {
      var Y = new Ressort(0, 190, 5), A = new Ressort(0, 110, 3.6), tag = el.querySelector('.br-ee-tag'), g = null;
      var reveil = moteur(function (dt) {
        var a = g ? false : Y.pas(dt), b = A.pas(dt);
        el.style.setProperty('--y', Y.x.toFixed(2) + 'px');
        el.style.setProperty('--r', A.x.toFixed(2) + 'deg');
        el.style.setProperty('--e', (1 + borne(Y.v / 5000, -.06, .1)).toFixed(3));
        return a || b || !!g;
      });
      tag.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button) return;
        try { tag.setPointerCapture(e.pointerId); } catch (_) {}
        g = { y: e.clientY, x: e.clientX, py: e.clientY, t: performance.now(), vy: 0, bouge: false };
        reveil();
      });
      tag.addEventListener('pointermove', function (e) {
        if (!g) return;
        var k = echelle(el), dy = e.clientY - g.y, now = performance.now();
        if (Math.abs(dy) > 4 || Math.abs(e.clientX - g.x) > 4) g.bouge = true;
        Y.x = dy < 0 ? dy * .25 : 46 * k * (1 - Math.exp(-dy / (46 * k)));
        g.vy = (e.clientY - g.py) / Math.max(.008, (now - g.t) / 1000); g.py = e.clientY; g.t = now;
        A.cible = borne((e.clientX - g.x) * .3, -24, 24);
      });
      function lacher() {
        if (!g) return;
        el._brGlisse = g.bouge;
        Y.v = borne(g.vy * .4, -1500, 1500); Y.cible = 0; A.cible = 0; g = null; reveil();
      }
      tag.addEventListener('pointerup', lacher);
      tag.addEventListener('pointercancel', lacher);
      return { impulsion: function () { Y.v = 560 * echelle(el); A.v = (Math.random() < .5 ? -1 : 1) * 90; reveil(); } };
    }
  });

  scene('capsule-tension', 'ressorts', 'libre',
    '<div class="br-tn"><i class="br-tn-ancre"></i><div class="br-tn-bande"><i></i><i></i><i></i></div><i class="br-tn-poignee"></i></div>', {
    label: 'Étirer la capsule',
    init: function (el) {
      var S = new Ressort(0, 260, 6.5), N = [new Ressort(0, 420, 16), new Ressort(0, 330, 13), new Ressort(0, 250, 10)];
      var poignee = el.querySelector('.br-tn-poignee'), noeuds = el.querySelectorAll('.br-tn-bande i'), g = null;
      var reveil = moteur(function (dt) {
        var k = echelle(el), a = g ? false : S.pas(dt), b = false;
        N.forEach(function (n, i) { n.cible = S.x * (i + 1) / 4; b = n.pas(dt) || b; noeuds[i].style.setProperty('--n', (n.x - n.cible).toFixed(2) + 'px'); });
        el.style.setProperty('--s', S.x.toFixed(2) + 'px');
        el.style.setProperty('--h', borne(1 / (1 + S.x / (55 * k)), .34, 1.32).toFixed(3));
        return a || b || !!g;
      });
      poignee.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button) return;
        try { poignee.setPointerCapture(e.pointerId); } catch (_) {}
        g = { x: e.clientX - S.x, px: e.clientX, t: performance.now(), vx: 0, x0: e.clientX };
        reveil();
      });
      poignee.addEventListener('pointermove', function (e) {
        if (!g) return;
        var k = echelle(el), dx = e.clientX - g.x, now = performance.now();
        S.x = dx < 0 ? Math.max(-22 * k, dx * .35) : 62 * k * (1 - Math.exp(-dx / (62 * k)));
        g.vx = (e.clientX - g.px) / Math.max(.008, (now - g.t) / 1000); g.px = e.clientX; g.t = now;
      });
      function lacher(e) {
        if (!g) return;
        el._brGlisse = Math.abs(e.clientX - g.x0) > 4;
        S.v = borne(g.vx * .3, -1200, 1200); S.cible = 0; g = null; reveil();
      }
      poignee.addEventListener('pointerup', lacher);
      poignee.addEventListener('pointercancel', lacher);
      return { impulsion: function () { S.v = 950 * echelle(el); reveil(); } };
    }
  });

  scene('goutte-ecrasee', 'ressorts', 'boucle', '<div class="br-gt"><i class="br-gt-flaque"></i><i class="br-gt-ombre"></i><i class="br-gt-goutte"></i></div>');
  scene('cube-gelatine', 'ressorts', 'jeu', '<div class="br-cg"><i class="br-cg-ombre"></i><i class="br-cg-cube"><i></i></i></div>', { duree: 1500 });
  scene('ressort-spirale', 'ressorts', 'boucle', function () {
    var s = '<div class="br-rs"><i class="br-rs-socle"></i>';
    for (var i = 0; i < 14; i++) s += '<i class="br-rs-a" style="--i:' + i + '"></i>';
    return s + '<i class="br-rs-poignee" style="--i:13"></i></div>';
  });
  scene('balle-rebond', 'ressorts', 'boucle', '<div class="br-bb"><i class="br-bb-ombre"></i><i class="br-bb-balle"></i></div>');

  /* ---------- Papier, plis et impressions ---------- */
  scene('pile-cartes', 'papier', 'bascule', function (el) {
    return '<div class="br-pc"><i class="br-pc-f f2"></i><i class="br-pc-f f1"></i><div class="br-pc-dessous"><b>' + esc(el.dataset.texte || 'Révélé') +
      '</b><i></i><i></i></div><div class="br-pc-dessus"><span class="br-pc-onglet">' + esc(el.dataset.titre || 'Index') + '</span><i></i><i></i><i></i></div></div>';
  }, { label: 'Ouvrir la pile' });

  scene('coin-corne', 'papier', 'bascule', function (el) {
    return '<div class="br-ce"><div class="br-ce-dessous"><b>✦</b><span>' + esc(el.dataset.texte || 'Bonus caché') + '</span></div>' +
      '<div class="br-ce-face"><i class="t"></i><i></i><i></i><i class="c"></i></div><i class="br-ce-rabat"><i></i></i></div>';
  }, { label: 'Soulever le coin' });

  scene('enveloppe-origami', 'papier', 'bascule', function (el) {
    return '<div class="br-eo"><i class="br-eo-dos"></i><div class="br-eo-lettre"><b>' + esc(el.dataset.texte || 'Bonjour !') +
      '</b><i></i><i></i><i class="c"></i></div><i class="br-eo-poche"></i><i class="br-eo-rabat"></i></div>';
  }, { label: 'Ouvrir l’enveloppe' });

  var NOTES = ['Appeler Léa', 'Acheter du pain', 'Sport à 18 h', 'Envoyer le devis'], TEINTES = ['#ffd84d', '#ffa3b8', '#8fe3c1', '#a7c7ff'];
  scene('post-it', 'papier', 'jeu', '<div class="br-pi"><i class="br-pi-bloc"></i><div class="br-pi-note s"><span></span></div><div class="br-pi-note d"><span></span></div></div>', {
    duree: 1050, label: 'Détacher la note',
    debut: function (el) {
      var l = el.dataset.notes ? el.dataset.notes.split('|') : NOTES, k = el._brK || 0;
      [['.d', k], ['.s', k + 1]].forEach(function (p) {
        var n = el.querySelector('.br-pi-note' + p[0]);
        n.firstChild.textContent = l[p[1] % l.length];
        n.style.setProperty('--c', TEINTES[p[1] % TEINTES.length]);
      });
    },
    fin: function (el) { el._brK = (el._brK || 0) + 1; el.classList.remove('br-joue'); this.debut(el); }
  });

  var RECU = [['Café × 2', '5,60'], ['Croissant', '1,90'], ['Salade', '12,90']];
  scene('ticket-caisse', 'papier', 'jeu', function (el) {
    return '<div class="br-tc"><div class="br-tc-sortie"><div class="br-tc-papier"><b>' + esc(el.dataset.titre || 'Merci !') + '</b>' +
      RECU.map(function (r) { return '<p><span>' + r[0] + '</span><span>' + r[1] + '</span></p>'; }).join('') +
      '<p class="t"><span>Total</span><span>' + esc(el.dataset.total || '20,40 €') + '</span></p></div></div><div class="br-tc-imprimante"><i></i></div></div>';
  }, { duree: 2400, label: 'Imprimer le ticket' });

  scene('parchemin', 'papier', 'bascule', function (el) {
    return '<div class="br-pa"><div class="br-pa-papier"><b>' + esc(el.dataset.texte || 'Bienvenue') + '</b><i></i><i></i></div><i class="br-pa-r g"></i><i class="br-pa-r d"></i></div>';
  }, { label: 'Dérouler le parchemin' });

  scene('page-cornee', 'papier', 'bascule', '<div class="br-pg"><i class="br-pg-ombre"></i><div class="br-pg-feuille"><i class="t"></i><i></i><i></i><i></i><i class="c"></i><i class="br-pg-boucle"></i></div></div>', { label: 'Soulever la page' });

  scene('banniere-ruban', 'papier', 'jeu', function (el) {
    return '<div class="br-br"><i class="br-br-q g"></i><i class="br-br-q d"></i><div class="br-br-bande"><b>' + esc(el.dataset.texte || 'Nouveau') + '</b></div></div>';
  }, { duree: 1100, label: 'Déplier la bannière' });

  /* ---------- Révélations mécaniques ---------- */
  var BOUCLIER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6Z"/><path d="m8.8 12 2.3 2.3 4.4-4.6"/></svg>';
  scene('portail-fendu', 'revelations', 'bascule', function (el, c) {
    return '<div class="br-pf"><div class="br-pf-dessous">' + (c || BOUCLIER + '<b>' + esc(el.dataset.texte || 'Accès autorisé') + '</b>') +
      '</div><i class="br-pf-v g"><i></i></i><i class="br-pf-v d"><i></i></i><i class="br-pf-verrou"></i></div>';
  }, { label: 'Ouvrir le portail' });

  scene('volets-glissants', 'revelations', 'bascule', function (el, c) {
    return '<div class="br-vg"><div class="br-vg-dessous">' + (c || '<b class="br-vg-badge">' + esc(el.dataset.texte || 'Nouveau') + '</b>') + '</div><i class="br-vg-p h"></i><i class="br-vg-p b"></i></div>';
  }, { label: 'Ouvrir les volets' });

  scene('distributeur-carte', 'revelations', 'bascule', '<div class="br-dc"><div class="br-dc-sortie"><div class="br-dc-carte"><i class="br-dc-puce"></i><i class="br-dc-num"></i></div></div>' +
    '<div class="br-dc-boitier"><i class="br-dc-fente"></i><i class="br-dc-ecran"><span class="a">Insérez</span><span class="b">Retirez la carte</span></i><i class="br-dc-led"></i></div></div>', { label: 'Éjecter la carte' });

  scene('store-enrouleur', 'revelations', 'bascule', '<div class="br-se"><div class="br-se-fenetre"><i class="br-se-soleil"></i><i class="br-se-colline"></i></div><i class="br-se-toile"></i>' +
    '<i class="br-se-barre"><i class="br-se-cordon"></i></i><i class="br-se-coffre"></i></div>', { label: 'Baisser le store' });

  scene('store-accordeon', 'revelations', 'bascule', function () {
    var s = '<div class="br-sa"><i class="br-sa-vue"></i><i class="br-sa-cordon"></i>';
    for (var i = 7; i >= 0; i--) s += '<i class="br-sa-l" style="--i:' + i + '"></i>';
    return s + '<i class="br-sa-rail"></i></div>';
  }, { label: 'Tirer le store' });

  scene('persiennes', 'revelations', 'bascule', function () {
    var s = '<div class="br-ps"><i class="br-ps-lumiere"></i>';
    for (var i = 0; i < 6; i++) s += '<i class="br-ps-l" style="--i:' + i + '"></i>';
    return s + '</div>';
  }, { label: 'Orienter les lames' });

  scene('diaphragme', 'revelations', 'bascule', function () {
    var s = '<div class="br-di"><i class="br-di-fond"></i>';
    for (var i = 0; i < 6; i++) s += '<i class="br-di-l" style="--i:' + i + '"><i></i></i>';
    return s + '<i class="br-di-bague"></i></div>';
  }, { label: 'Ouvrir le diaphragme' });

  scene('lamelles', 'revelations', 'bascule', function (el) {
    var W = [.14, .3, .09, .22, .17], s = '<div class="br-la">';
    for (var i = 0; i < 5; i++) s += '<i class="br-la-b" style="--i:' + i + ';--w:' + W[i] + '"></i>';
    return s + '<b class="br-la-t">' + esc(el.dataset.texte || 'Prêt') + '</b></div>';
  }, { label: 'Déployer les lamelles' });

  /* ---------- Tracés ---------- */
  var PISTES = ['M70 55H48L36 43H16', 'M70 75H40L28 87V108', 'M110 55H130L144 41V20', 'M110 75H136L150 89H166', 'M90 45V22L100 12H122', 'M90 85V104L78 116H56'];
  function dernierPoint(d) {
    var p = d.replace(/([A-Za-z])/g, ' $1 ').trim().split(/[\s,]+/), x = 0, y = 0, c = '';
    for (var i = 0; i < p.length; i++) {
      if (/[A-Z]/.test(p[i])) { c = p[i]; continue; }
      if (c === 'H') x = +p[i]; else if (c === 'V') y = +p[i]; else { x = +p[i]; y = +p[++i]; }
    }
    return [x, y];
  }
  scene('circuit-trace', 'traces', 'boucle', function () {
    var s = '<rect class="br-ci-puce" x="70" y="45" width="40" height="40" rx="6"/>';
    for (var k = 0; k < 4; k++) s += '<path class="br-ci-broche" d="M' + (77 + k * 9) + ' 45v-5M' + (77 + k * 9) + ' 85v5"/>';
    PISTES.forEach(function (d, i) {
      var f = dernierPoint(d);
      s += '<path class="br-ci-piste" style="--i:' + i + '" d="' + d + '" pathLength="100"/><path class="br-ci-signal" style="--i:' + i + '" d="' + d + '" pathLength="100"/>' +
        '<circle class="br-ci-halo" style="--i:' + i + '" cx="' + f[0] + '" cy="' + f[1] + '" r="4"/><circle class="br-ci-borne" style="--i:' + i + '" cx="' + f[0] + '" cy="' + f[1] + '" r="4"/>';
    });
    return '<div class="br-ci">' + svgSc(s) + '</div>';
  });

  scene('treillis-hexagones', 'traces', 'boucle', function () {
    var s = '', c = [[90, 65]];
    for (var k = 0; k < 6; k++) { var a = (-90 + k * 60) * Math.PI / 180; c.push([90 + Math.cos(a) * 31.2, 65 + Math.sin(a) * 31.2]); }
    c.forEach(function (p, i) {
      var d = '';
      for (var j = 0; j < 6; j++) { var b = j * Math.PI / 3; d += (j ? 'L' : 'M') + (p[0] + Math.cos(b) * 17).toFixed(2) + ' ' + (p[1] + Math.sin(b) * 17).toFixed(2); }
      s += '<path class="br-hx" style="--i:' + i + '" d="' + d + 'Z" pathLength="100"/>';
    });
    return '<div class="br-hx-boite">' + svgSc(s) + '</div>';
  });

  var POULS = 'M4 70H44L50 70 56 52 62 90 70 28 78 102 84 62 90 70H118L124 60 130 78 136 70H176';
  scene('onde-pouls', 'traces', 'boucle', '<div class="br-op2">' + svgSc('<path class="br-op2-fond" d="' + POULS + '"/><path class="br-op2-trait" d="' + POULS + '" pathLength="100"/><path class="br-op2-tete" d="' + POULS + '" pathLength="100"/>') + '</div>');

  var ECLAIR = 'M98 14 58 70H88L74 116 124 54H94L110 14Z';
  scene('neon', 'traces', 'boucle', function () {
    return '<div class="br-ne">' + svgSc('<path class="br-ne-fond" d="' + ECLAIR + '"/><path class="br-ne-halo" d="' + ECLAIR + '" pathLength="100"/><path class="br-ne-trait" d="' + ECLAIR + '" pathLength="100"/>') + '</div>';
  });

  /* ---------- Blocs et empilements ---------- */
  scene('prismes-empiles', 'blocs', 'jeu', function () {
    var B = [[11, 2.2, 'a'], [8, 2, 'b'], [9, 1.8, 'c'], [5.2, 2.4, 'd']], bas = 1.6, s = '<div class="br-pe">';
    B.forEach(function (b, i) {
      s += '<i class="br-pe-b ' + b[2] + '" style="--i:' + i + ';width:' + b[0] + 'em;height:' + b[1] + 'em;bottom:' + bas.toFixed(2) + 'em;left:calc(50% - ' + (b[0] / 2) + 'em)"></i>';
      bas += b[1];
    });
    return s + '<i class="br-pe-sol"></i></div>';
  }, { duree: 2000, label: 'Empiler les blocs' });

  scene('tuiles-modulaires', 'blocs', 'jeu', function () {
    var T = [['1/1/2/2', 'c'], ['1/2/2/4', 'p'], ['1/4/2/5', 'c a2'], ['2/1/4/2', 'p v'], ['2/2/3/3', 'c a2'], ['2/3/3/4', 'c n'], ['2/4/4/5', 'p v n'], ['3/2/4/4', 'p a2']];
    return '<div class="br-tm">' + T.map(function (t, i) {
      var dx = ((alea(i * 3 + 1) - .5) * 14).toFixed(1), dy = ((alea(i * 3 + 2) - .5) * 10).toFixed(1), dr = ((alea(i * 3 + 3) - .5) * 120).toFixed(0);
      return '<i class="br-tm-m ' + t[1] + '" style="--i:' + i + ';grid-area:' + t[0] + ';--dx:' + dx + 'em;--dy:' + dy + 'em;--dr:' + dr + 'deg"></i>';
    }).join('') + '</div>';
  }, { duree: 1500, label: 'Assembler les tuiles' });

  scene('pyramide', 'blocs', 'jeu', function () {
    var s = '<div class="br-py">', k = 0;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4 - r; c++) {
      s += '<i class="br-py-b' + (r === 3 ? ' sommet' : '') + '" style="--k:' + k + ';left:calc(50% + ' + ((c - (3 - r) / 2) * 2.9 - 1.3).toFixed(2) + 'em);bottom:' + (1.4 + r * 2.7).toFixed(2) + 'em"></i>';
      k++;
    }
    return s + '</div>';
  }, { duree: 1900, label: 'Construire la pyramide' });

  scene('dominos', 'blocs', 'jeu', function () {
    var s = '<div class="br-do">';
    for (var i = 0; i < 5; i++) s += '<i class="br-do-t" style="--i:' + i + ';--a:' + [62, 62, 62, 75, 90][i] + 'deg;left:' + (.8 + i * 2.6).toFixed(1) + 'em"><i></i></i>';
    return s + '<i class="br-do-sol"></i></div>';
  }, { duree: 1700, label: 'Faire tomber les dominos' });

  scene('eventail-cartes', 'blocs', 'bascule', function () {
    var C = [['♠', 'A', ''], ['♥', 'R', ' r'], ['♦', 'D', ' r']];
    return '<div class="br-ev">' + C.map(function (c, i) {
      return '<i class="br-ev-c' + c[2] + '" style="--i:' + i + '"><b>' + c[1] + '</b><span>' + c[0] + '</span><b class="bas">' + c[1] + '</b></i>';
    }).join('') + '</div>';
  }, { label: 'Déployer l’éventail' });

  scene('chaine-maillons', 'blocs', 'bascule', function () {
    var s = '<div class="br-ch">';
    for (var i = 0; i < 4; i++) s += '<i class="br-ch-l" style="--i:' + i + '"></i>';
    for (var j = 0; j < 5; j++) s += '<i class="br-ch-s" style="--i:' + j + ';--c:' + Math.abs(j - 2) + '"></i>';
    return s + '</div>';
  }, { label: 'Étirer la chaîne' });

  /* ---------- Mécanique et magnétisme ---------- */
  scene('niveau-bulle', 'mecanique', 'libre', '<div class="br-nb"><div class="br-nb-corps"><i class="br-nb-graduation"></i><div class="br-nb-fiole"><i class="br-nb-rep g"></i><i class="br-nb-rep d"></i><i class="br-nb-bulle"></i></div><i class="br-nb-graduation d"></i></div><i class="br-nb-pivot"></i></div>', {
    roleLibre: true,
    init: function (el) {
      var A = new Ressort(0, 42, 2.2), B = new Ressort(0, 55, 10), main = 0, survol = null;
      el.setAttribute('role', 'slider');
      el.tabIndex = 0;
      el.setAttribute('aria-label', el.dataset.label || 'Niveau à bulle');
      el.setAttribute('aria-valuemin', '-8'); el.setAttribute('aria-valuemax', '8');
      function maj() { el.setAttribute('aria-valuenow', String(main)); el.setAttribute('aria-valuetext', 'Inclinaison ' + main + '°'); }
      maj();
      var reveil = moteur(function (dt) {
        A.cible = survol == null ? main : survol;
        var a = A.pas(dt);
        B.cible = borne(-A.x * .5, -2.3, 2.3);
        var b = B.pas(dt);
        el.style.setProperty('--a', A.x.toFixed(2) + 'deg');
        el.style.setProperty('--b', B.x.toFixed(3) + 'em');
        el.classList.toggle('br-aplomb', Math.abs(A.x) < .35 && Math.abs(B.x) < .12);
        return a || b;
      });
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch' && !e.pressure) return;
        var r = el.getBoundingClientRect();
        survol = Math.round(borne(((e.clientX - r.left) / r.width - .5) * 2, -1, 1) * 80) / 10; reveil();
      });
      el.addEventListener('pointerleave', function () { survol = null; reveil(); });
      el.addEventListener('pointerdown', function () { A.v += (Math.random() < .5 ? -1 : 1) * 40; reveil(); });
      el.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (e.key === 'Home') { main = 0; } else if (e.key === 'Enter' || e.key === ' ') { A.v += 40; } else if (d) { main = borne(main + d, -8, 8); } else return;
        e.preventDefault(); maj(); reveil();
      });
      A.v = 30; reveil();
      return {};
    }
  });

  scene('metronome', 'mecanique', 'boucle', function (el) {
    var bpm = borne(parseFloat(el.dataset.tempo) || 96, 30, 240);
    el.style.setProperty('--battement', (60 / bpm).toFixed(3) + 's');
    return '<div class="br-mt"><i class="br-mt-corps"></i><i class="br-mt-echelle"></i><div class="br-mt-bras"><i class="br-mt-poids"></i></div><i class="br-mt-pivot"></i><i class="br-mt-voyant"></i><b class="br-mt-bpm">' + bpm + ' bpm</b></div>';
  });

  scene('cardan', 'mecanique', 'boucle', '<div class="br-ca"><div class="br-ca-ext"><div class="br-ca-int"><i class="br-ca-c1"><i class="br-ca-c2"></i></i></div></div></div>');

  function roueDentee(z, rp, h) {
    var ra = rp + h * .5, rf = rp - h * .62, pas = Math.PI * 2 / z, pts = [];
    for (var k = 0; k < z; k++) {
      [[rf, -.5], [rf, -.3], [ra, -.16], [ra, .16], [rf, .3]].forEach(function (p) {
        var b = (k + p[1]) * pas;
        pts.push((p[0] * Math.cos(b)).toFixed(2) + ' ' + (p[0] * Math.sin(b)).toFixed(2));
      });
    }
    var m = rp * .26;
    return 'M' + pts.join('L') + 'ZM' + m + ' 0A' + m + ' ' + m + ' 0 1 0 ' + (-m) + ' 0A' + m + ' ' + m + ' 0 1 0 ' + m + ' 0Z';
  }
  scene('engrenages-pas', 'mecanique', 'boucle', function () {
    return '<div class="br-eg">' + svgSc(
      '<g transform="translate(64 65)"><g class="br-eg-pas a"><g class="br-eg-fin a"><path class="br-eg-r a" fill-rule="evenodd" d="' + roueDentee(12, 36, 9) + '"/>' +
      '<path class="br-eg-rayon" d="M0-12V-22M0 12V22M-12 0H-22M12 0H22"/></g></g></g>' +
      '<g transform="translate(124 65) rotate(22.5)"><g class="br-eg-pas b"><g class="br-eg-fin b"><path class="br-eg-r b" fill-rule="evenodd" d="' + roueDentee(8, 24, 9) + '"/></g></g></g>') + '</div>';
  });

  scene('disques-aimantes', 'mecanique', 'boucle', '<div class="br-da"><i class="br-da-d g"></i><i class="br-da-d d"></i></div>', { init: function () { filtreGluant(); } });

  scene('dipole', 'mecanique', 'bascule', svgSc('<path class="br-dp-l" d="M70 52C80 34 100 34 110 52"/><path class="br-dp-l" d="M70 78C80 96 100 96 110 78"/><path class="br-dp-l" d="M70 60C80 52 100 52 110 60"/><path class="br-dp-l" d="M70 70C80 78 100 78 110 70"/>', '0 0 180 130').replace('<svg', '<svg class="br-dp-champ"') +
    '<div class="br-dp"><i class="br-dp-a g"><b>N</b><b>S</b></i><i class="br-dp-a d"><b>N</b><b>S</b></i></div>', { label: 'Rapprocher les aimants' });

  scene('boussole', 'mecanique', 'libre', '<div class="br-bo"><i class="br-bo-graduation"></i><b class="n">N</b><b class="e">E</b><b class="s">S</b><b class="o">O</b><i class="br-bo-aiguille"></i><i class="br-bo-axe"></i></div>', {
    label: 'Perturber la boussole',
    init: function (el) {
      var A = new Ressort(0, 30, 2.1);
      var reveil = moteur(function (dt) { var a = A.pas(dt); el.style.setProperty('--a', A.x.toFixed(2) + 'deg'); return a; });
      var arret = BR.suivrePointeur(el, function (p) {
        if (!el.isConnected) { arret(); return; }
        var r = el.getBoundingClientRect(), dx = p.x - r.width / 2, dy = p.y - r.height / 2, dist = Math.sqrt(dx * dx + dy * dy), k = echelle(el);
        var c = dist < 230 * k && dist > 8 ? Math.atan2(dx, -dy) * 180 / Math.PI : 0;
        while (c - A.x > 180) c -= 360;
        while (c - A.x < -180) c += 360;
        if (Math.abs(c - A.cible) > .5) { A.cible = c; reveil(); }
      });
      A.v = 260; reveil();
      return { impulsion: function () { A.v += (Math.random() < .5 ? -1 : 1) * 420; reveil(); } };
    }
  });

  /* ---------- Inertie et frottements ---------- */
  scene('freinage', 'inertie', 'jeu', '<div class="br-fr"><i class="br-fr-sol"></i><i class="br-fr-trace a"></i><i class="br-fr-trace b"></i>' +
    '<div class="br-fr-bloc"><i class="br-fr-vent"></i><i class="br-fr-vitre"></i><i class="br-fr-roue r1"></i><i class="br-fr-roue r2"></i></div></div>', { duree: 1500, label: 'Lancer et freiner' });
  scene('cube-roulant', 'inertie', 'jeu', '<div class="br-cu"><i class="br-cu-sol"></i><i class="br-cu-cube"></i></div>', { duree: 2100, label: 'Faire rouler le cube' });
  scene('glissade-inertie', 'inertie', 'jeu', function () {
    var s = '<div class="br-gi"><i class="br-gi-sol"></i><i class="br-gi-bloc"></i>';
    for (var i = 0; i < 4; i++) s += '<i class="br-gi-p" style="--i:' + i + '"></i>';
    return s + '</div>';
  }, { duree: 1400, label: 'Faire glisser le bloc' });

  /* ==========================================================================
     LOT 4 — KIT D'INTERFACE (data-brio sur l'élément natif ou son conteneur)
     ========================================================================== */
  function kit(nom, cat, init) { composant(nom, 'kit', cat, 'kit', init); }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function bouton(cls, html, label) { var b = mk('button', cls, html); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; }
  function animer(el, images, o) {
    if (calme() || !el.animate) return null;
    try { return el.animate(images, o); } catch (_) { return null; }
  }
  var RESSORT_JS = null;
  function ressortJS() {
    if (RESSORT_JS == null) RESSORT_JS = window.CSS && CSS.supports && CSS.supports('animation-timing-function', 'linear(0, 1)') ? BR.courbeRessort({ amorti: .55, frequence: 13 }) : 'cubic-bezier(.34, 1.4, .64, 1)';
    return RESSORT_JS;
  }
  function nomChamp(el) {
    var l = el.labels && el.labels[0];
    return el.getAttribute('aria-label') || (l ? l.textContent.trim() : '') || el.getAttribute('title') || '';
  }
  function annonce(hote) { var s = mk('span', 'br-natif'); s.setAttribute('aria-live', 'polite'); hote.appendChild(s); return s; }

  /* ---------- Menu déroulant accessible (bouton + role=menu) ---------- */
  function menuDeroulant(o) {
    var ouvert = false, b = o.bouton, m = o.menu;
    b.setAttribute('aria-haspopup', 'menu');
    b.setAttribute('aria-expanded', 'false');
    if (!m.id) m.id = idCtl('menu');
    b.setAttribute('aria-controls', m.id);
    m.setAttribute('role', 'menu');
    m.hidden = true;
    function liste() { return o.items().filter(function (i) { return !i.disabled && !i.hidden; }); }
    function ouvrir(focus) {
      if (!ouvert) {
        ouvert = true;
        m.hidden = false;
        m.classList.remove('br-sort');
        b.setAttribute('aria-expanded', 'true');
        o.racine.classList.add('br-ouvert');
        if (o.surOuvrir) o.surOuvrir();
        relancer(m, 'br-entre');
        document.addEventListener('pointerdown', dehors, true);
      }
      var l = liste(), c = focus === 'dernier' ? l[l.length - 1] : focus && focus.nodeType ? focus : (o.initial && o.initial()) || l[0];
      if (c) c.focus();
    }
    function fermer(rendre) {
      if (!ouvert) return;
      ouvert = false;
      b.setAttribute('aria-expanded', 'false');
      o.racine.classList.remove('br-ouvert');
      document.removeEventListener('pointerdown', dehors, true);
      if (o.surFermer) o.surFermer();
      var fait = false;
      function cacher() { if (fait) return; fait = true; m.classList.remove('br-sort', 'br-entre'); if (!ouvert) m.hidden = true; }
      if (calme()) cacher(); else { m.classList.add('br-sort'); setTimeout(cacher, 170); }
      if (rendre) b.focus();
    }
    function dehors(e) { if (!o.racine.contains(e.target)) fermer(false); }
    b.addEventListener('click', function () { if (ouvert) fermer(false); else ouvrir(); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); ouvrir(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); ouvrir('dernier'); }
    });
    m.addEventListener('keydown', function (e) {
      var l = liste(), i = l.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var j = i + (e.key === 'ArrowDown' ? 1 : -1); l[(j + l.length) % l.length].focus(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); l[e.key === 'Home' ? 0 : l.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermer(true); }
      else if (e.key === 'Tab') fermer(false);
      else if (e.key.length === 1 && /\S/.test(e.key)) {
        var k = e.key.toLowerCase();
        for (var n = 1; n <= l.length; n++) { var c = l[(i + n) % l.length]; if (c.textContent.trim().toLowerCase().charAt(0) === k) { c.focus(); break; } }
      }
    });
    return { ouvrir: ouvrir, fermer: fermer, ouvert: function () { return ouvert; } };
  }
  function itemMenu(c, role) {
    c.classList.add('br-mi');
    c.setAttribute('role', role || 'menuitem');
    c.tabIndex = -1;
    if (c.tagName === 'BUTTON' && !c.hasAttribute('type')) c.type = 'button';
    return c;
  }

  kit('menu-categories', 'menus', function (el) {
    var items = [].filter.call(el.children, function (c) { return c.tagName === 'BUTTON' || c.tagName === 'A'; }), choix = 0;
    items.forEach(function (c, i) { if (c.hasAttribute('aria-current') || c.hasAttribute('data-actif')) choix = i; });
    var b = bouton('br-mc-bouton', '<span class="br-mc-titre">' + esc(el.dataset.titre || 'Catégorie') + '</span><span class="br-mc-valeur"></span>' + CHEVRON);
    var m = mk('div', 'br-menu br-mc-menu', '<i class="br-mc-surb" aria-hidden="true"></i>');
    items.forEach(function (c) { itemMenu(c, 'menuitemradio'); c.insertAdjacentHTML('beforeend', SVC(COCHE, 'br-mi-coche')); m.appendChild(c); });
    el.textContent = '';
    el.appendChild(b); el.appendChild(m);
    var valeur = b.querySelector('.br-mc-valeur'), surb = m.firstChild;
    function choisir(i, silence) {
      choix = i;
      items.forEach(function (c, k) { c.setAttribute('aria-checked', String(k === i)); });
      valeur.textContent = items[i].textContent.trim();
      if (!silence) { relancer(valeur, 'br-tic'); emit(el, 'change', { valeur: items[i].dataset.valeur || items[i].textContent.trim(), index: i }); }
    }
    function placer(it) {
      if (!it || it.parentNode !== m) { surb.classList.remove('on'); return; }
      surb.style.transform = 'translateY(' + it.offsetTop + 'px)';
      surb.style.height = it.offsetHeight + 'px';
      surb.classList.add('on');
    }
    var menu = menuDeroulant({ bouton: b, menu: m, racine: el, items: function () { return items; }, initial: function () { return items[choix]; } });
    m.addEventListener('pointerover', function (e) { placer(e.target.closest('.br-mi')); });
    m.addEventListener('focusin', function (e) { placer(e.target.closest('.br-mi')); });
    m.addEventListener('pointerleave', function () { placer(m.contains(document.activeElement) ? document.activeElement : null); });
    m.addEventListener('click', function (e) {
      var it = e.target.closest('.br-mi'); if (!it) return;
      choisir(items.indexOf(it));
      menu.fermer(true);
    });
    choisir(choix, true);
    return { choisir: choisir, ouvrir: menu.ouvrir, fermer: menu.fermer };
  });

  kit('sous-menu', 'menus', function (el) {
    var b = bouton('br-sm-bouton', '<span>' + esc(el.dataset.titre || 'Menu') + '</span>' + CHEVRON), m = mk('div', 'br-menu br-sm-menu'), groupes = [], minuteur = 0;
    var FLECHE = SVC('<path d="M10 7l5 5-5 5"/>', 'br-mi-fleche');
    [].slice.call(el.children).forEach(function (c) {
      if (c.tagName === 'BUTTON' || c.tagName === 'A') m.appendChild(itemMenu(c));
      else if (c.tagName === 'HR') { c.setAttribute('role', 'separator'); c.className = 'br-mi-sep'; m.appendChild(c); }
      else if (c.dataset.titre) {
        var g = mk('div', 'br-sm-groupe'), it = itemMenu(bouton('br-mi-sous', '<span>' + esc(c.dataset.titre) + '</span>' + FLECHE)), p = mk('div', 'br-menu br-sm-panneau');
        it.setAttribute('aria-haspopup', 'menu');
        it.setAttribute('aria-expanded', 'false');
        p.setAttribute('role', 'menu');
        p.setAttribute('aria-label', c.dataset.titre);
        p.hidden = true;
        [].slice.call(c.children).forEach(function (s) { if (s.tagName === 'BUTTON' || s.tagName === 'A') p.appendChild(itemMenu(s)); });
        g.appendChild(it); g.appendChild(p); m.appendChild(g);
        groupes.push({ g: g, it: it, p: p });
        c.remove();
      }
    });
    el.textContent = '';
    el.appendChild(b); el.appendChild(m);
    function principaux() { return [].filter.call(m.querySelectorAll('.br-mi'), function (i) { return i.parentNode === m || i.classList.contains('br-mi-sous'); }); }
    function sousItems(x) { return [].slice.call(x.p.querySelectorAll('.br-mi')); }
    function fermerSous(sauf) {
      groupes.forEach(function (x) { if (x !== sauf && !x.p.hidden) { x.p.hidden = true; x.it.setAttribute('aria-expanded', 'false'); x.g.classList.remove('br-ouvert'); } });
    }
    function ouvrirSous(x, focus) {
      clearTimeout(minuteur);
      fermerSous(x);
      if (x.p.hidden) {
        x.p.hidden = false;
        x.it.setAttribute('aria-expanded', 'true');
        x.g.classList.add('br-ouvert');
        x.p.classList.remove('br-gauche', 'br-dessous');
        var r = x.p.getBoundingClientRect();
        if (r.right > innerWidth - 8) {
          x.p.classList.add('br-gauche');
          r = x.p.getBoundingClientRect();
          if (r.left < 8) { x.p.classList.remove('br-gauche'); x.p.classList.add('br-dessous'); }
        }
        relancer(x.p, 'br-entre');
      }
      if (focus) sousItems(x)[0].focus();
    }
    var menu = menuDeroulant({ bouton: b, menu: m, racine: el, items: principaux, surFermer: function () { fermerSous(null); } });
    groupes.forEach(function (x) {
      x.g.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; clearTimeout(minuteur); minuteur = setTimeout(function () { ouvrirSous(x, false); }, 110); });
      x.g.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; clearTimeout(minuteur); minuteur = setTimeout(function () { if (!x.p.contains(document.activeElement)) fermerSous(null); }, 260); });
      x.it.addEventListener('click', function () { if (x.p.hidden) ouvrirSous(x, true); else fermerSous(null); });
      x.it.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); ouvrirSous(x, true); } });
      x.p.addEventListener('keydown', function (e) {
        var l = sousItems(x), i = l.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { var j = i + (e.key === 'ArrowDown' ? 1 : -1); l[(j + l.length) % l.length].focus(); }
        else if (e.key === 'Home' || e.key === 'End') l[e.key === 'Home' ? 0 : l.length - 1].focus();
        else if (e.key === 'ArrowLeft' || e.key === 'Escape') { fermerSous(null); x.it.focus(); }
        else return;
        e.preventDefault(); e.stopPropagation();
      });
    });
    m.addEventListener('focusin', function (e) { if (e.target.parentNode === m) fermerSous(null); });
    m.addEventListener('click', function (e) {
      var it = e.target.closest('.br-mi'); if (!it || it.classList.contains('br-mi-sous')) return;
      var g = it.closest('.br-sm-panneau');
      emit(el, 'action', { action: it.dataset.action || it.textContent.trim(), groupe: g ? g.getAttribute('aria-label') : null });
      menu.fermer(true);
    });
    return { ouvrir: menu.ouvrir, fermer: menu.fermer };
  });

  var ACTIONS = {
    modifier: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    renommer: '<path d="M4 20h4L19 9l-4-4L4 16Z"/>',
    dupliquer: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
    partager: '<circle cx="6.5" cy="12" r="2.3"/><circle cx="17.5" cy="6.5" r="2.3"/><circle cx="17.5" cy="17.5" r="2.3"/><path d="m8.6 10.9 6.8-3.3M8.6 13.1l6.8 3.3"/>',
    archiver: '<rect x="4" y="5" width="16" height="4" rx="1"/><path d="M5.5 9v9.5h13V9M10 13h4"/>',
    supprimer: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7M10.5 11v5M13.5 11v5"/>'
  };
  function cleAction(a) { return a.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s.*/, ''); }
  kit('menu-actions', 'menus', function (el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var actions = (el.dataset.actions || 'Modifier|Dupliquer|Supprimer').split('|').map(function (a) { return a.trim(); }).filter(Boolean);
    var b = bouton('br-ma-bouton', SVC('<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>'), el.dataset.label || 'Actions');
    var m = mk('div', 'br-menu br-ma-menu', actions.map(function (a) {
      var k = cleAction(a), danger = /^(suppr|effac|retir)/.test(k);
      return '<button type="button" class="br-mi' + (danger ? ' br-danger' : '') + '" data-action="' + esc(a) + '">' + SVC(ACTIONS[k] || '<circle cx="12" cy="12" r="2"/>') +
        '<span class="br-ma-t">' + esc(a) + '</span>' + (danger ? '<span class="br-ma-conf">Confirmer ?</span>' : '') + '</button>';
    }).join(''));
    [].forEach.call(m.children, function (c) { itemMenu(c); });
    el.appendChild(b); el.appendChild(m);
    var items = [].slice.call(m.children);
    function desarmer() { items.forEach(function (c) { c.classList.remove('br-arme'); }); }
    var menu = menuDeroulant({ bouton: b, menu: m, racine: el, items: function () { return items; }, surFermer: desarmer });
    m.addEventListener('click', function (e) {
      var it = e.target.closest('.br-mi'); if (!it) return;
      if (it.classList.contains('br-danger') && !it.classList.contains('br-arme')) { it.classList.add('br-arme'); relancer(it, 'br-secoue'); return; }
      emit(el, 'action', { action: it.dataset.action });
      menu.fermer(true);
    });
    m.addEventListener('focusout', function (e) { if (e.target.classList.contains('br-arme')) e.target.classList.remove('br-arme'); });
    el.addEventListener('contextmenu', function (e) {
      if (e.target.closest('.br-ma-menu') || e.shiftKey) return;
      e.preventDefault();
      var r = el.getBoundingClientRect();
      m.classList.add('br-au-pointeur');
      m.style.left = Math.min(e.clientX - r.left, r.width - 170) + 'px';
      m.style.top = (e.clientY - r.top) + 'px';
      if (menu.ouvert()) menu.fermer(false);
      menu.ouvrir();
    });
    b.addEventListener('click', function () { m.classList.remove('br-au-pointeur'); m.style.left = m.style.top = ''; }, true);
    return { ouvrir: menu.ouvrir, fermer: menu.fermer };
  });

  /* ---------- Bulles au survol (lien, contact) ---------- */
  function bulleSurvol(dec, bulle, hote) {
    var tO = 0, tF = 0, vu = false;
    bulle.id = bulle.id || idCtl('bulle');
    bulle.setAttribute('role', 'tooltip');
    bulle.hidden = true;
    var d = (dec.getAttribute('aria-describedby') || '').trim();
    dec.setAttribute('aria-describedby', (d ? d + ' ' : '') + bulle.id);
    function placer() {
      bulle.style.setProperty('--dx', '0px');
      bulle.classList.remove('br-dessous');
      var r = bulle.getBoundingClientRect(), dx = 0;
      if (r.left < 8) dx = 8 - r.left; else if (r.right > innerWidth - 8) dx = innerWidth - 8 - r.right;
      bulle.style.setProperty('--dx', dx + 'px');
      if (r.top < 8) bulle.classList.add('br-dessous');
    }
    function montrer(vite) {
      clearTimeout(tF);
      if (vu) return;
      clearTimeout(tO);
      tO = setTimeout(function () { vu = true; bulle.hidden = false; bulle.classList.remove('br-sort'); placer(); relancer(bulle, 'br-entre'); hote.classList.add('br-ouvert'); }, vite ? 0 : 220);
    }
    function cacher(vite) {
      clearTimeout(tO);
      if (!vu) return;
      clearTimeout(tF);
      tF = setTimeout(function () {
        vu = false; hote.classList.remove('br-ouvert');
        if (calme()) { bulle.hidden = true; return; }
        bulle.classList.add('br-sort');
        setTimeout(function () { if (!vu) { bulle.hidden = true; bulle.classList.remove('br-sort'); } }, 160);
      }, vite ? 0 : 140);
    }
    [dec, bulle].forEach(function (x) {
      x.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') montrer(); });
      x.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') cacher(); });
    });
    dec.addEventListener('focus', function () { montrer(true); });
    dec.addEventListener('blur', function () { cacher(true); });
    hote.addEventListener('keydown', function (e) { if (e.key === 'Escape' && vu) cacher(true); });
    return { montrer: montrer, cacher: cacher };
  }
  function envelopperHote(el, cls) {
    var h = mk('span', cls);
    el.parentNode.insertBefore(h, el);
    h.appendChild(el);
    return h;
  }

  kit('carte-lien', 'apercus', function (el) {
    var hote = envelopperHote(el, 'br-lk'), dom = '';
    try { dom = new URL(el.getAttribute('href') || '', location.href).hostname.replace(/^www\./, ''); } catch (_) {}
    var t = el.dataset.titre || el.textContent.trim(), x = el.dataset.texte || '';
    var b = mk('span', 'br-bulle br-lk-carte',
      '<span class="br-lk-tete"><i class="br-lk-ico">' + esc((t || dom || '?').charAt(0).toUpperCase()) + '</i><span class="br-lk-id"><b>' + esc(t) + '</b>' + (dom ? '<small>' + esc(dom) + '</small>' : '') + '</span></span>' +
      (x ? '<span class="br-lk-texte">' + esc(x) + '</span>' : '') + '<span class="br-lk-aller">Ouvrir le lien ' + SVC('<path d="M7 17 17 7M9 7h8v8"/>') + '</span>');
    hote.appendChild(b);
    bulleSurvol(el, b, hote);
    return {};
  });

  var STATUTS = { 'en-ligne': 'En ligne', absent: 'Absent', occupe: 'Occupé', 'hors-ligne': 'Hors ligne' };
  kit('apercu-survol', 'apercus', function (el) {
    var nom = el.dataset.nom || el.textContent.trim() || 'Contact', role = el.dataset.role || '', st = STATUTS[el.dataset.statut] ? el.dataset.statut : 'en-ligne';
    var ini = esc(el.dataset.initiales || nom.split(/\s+/).map(function (m) { return m.charAt(0); }).join('').slice(0, 2).toUpperCase());
    var hote = envelopperHote(el, 'br-as br-st-' + st);
    if (!/^(BUTTON|A)$/.test(el.tagName) && !el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.insertAdjacentHTML('afterbegin', '<span class="br-as-av" aria-hidden="true">' + ini + '<i class="br-as-pt"></i></span>');
    var b = mk('span', 'br-bulle br-as-carte',
      '<span class="br-as-tete"><span class="br-as-av g" aria-hidden="true">' + ini + '<i class="br-as-pt"></i></span><span class="br-lk-id"><b>' + esc(nom) + '</b>' + (role ? '<small>' + esc(role) + '</small>' : '') + '</span></span>' +
      '<span class="br-as-statut"><i></i>' + STATUTS[st] + (el.dataset.heure ? ' · ' + esc(el.dataset.heure) : '') + '</span>' + (el.dataset.texte ? '<span class="br-lk-texte">' + esc(el.dataset.texte) + '</span>' : ''));
    hote.appendChild(b);
    bulleSurvol(el, b, hote);
    return {};
  });

  /* ---------- Contrôles ---------- */
  kit('filtres-pilules', 'controles', function (el) {
    if (!el.hasAttribute('role')) el.setAttribute('role', 'group');
    var pilules = [].filter.call(el.children, function (c) { return c.tagName === 'BUTTON'; }), effacer = null;
    pilules.forEach(function (p) {
      p.type = 'button';
      p.classList.add('br-fp-p');
      if (!p.hasAttribute('aria-pressed')) p.setAttribute('aria-pressed', 'false');
      var t = mk('span', 'br-fp-t');
      while (p.firstChild) t.appendChild(p.firstChild);
      p.innerHTML = '<span class="br-fp-fond" aria-hidden="true"></span>' + SVC(COCHE, 'br-fp-coche');
      p.appendChild(t);
      p.addEventListener('click', function () { p.setAttribute('aria-pressed', String(p.getAttribute('aria-pressed') !== 'true')); relancer(p, 'br-tic'); maj(); });
    });
    if (el.hasAttribute('data-effacer')) {
      effacer = bouton('br-fp-effacer', SVC('<path d="M7 7l10 10M17 7 7 17"/>') + '<span>Effacer</span>', 'Effacer les filtres');
      el.appendChild(effacer);
      effacer.addEventListener('click', function () { pilules.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); }); maj(); (pilules[0] || el).focus(); });
    }
    function maj(silence) {
      var v = pilules.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; }).map(function (p) { return p.dataset.valeur || p.textContent.trim(); });
      el.classList.toggle('br-actifs', v.length > 0);
      if (effacer) effacer.hidden = !v.length;
      if (!silence) emit(el, 'change', { valeurs: v });
    }
    maj(true);
    return {};
  });

  kit('plus-moins', 'controles', function (el) {
    var s = el.tagName === 'DETAILS' && el.querySelector(':scope > summary');
    if (!s) return {};
    s.classList.add('br-pm-resume');
    s.insertAdjacentHTML('beforeend', '<span class="br-pm-ico" aria-hidden="true"><i></i><i class="v"></i></span>');
    var corps = mk('div', 'br-pm-corps'), anim = null;
    while (s.nextSibling) corps.appendChild(s.nextSibling);
    el.appendChild(corps);
    function basculer() {
      var ouvrir = !el.open || el.classList.contains('br-fermeture');
      relancer(s.querySelector('.br-pm-ico'), 'br-tic');
      if (anim) { anim.cancel(); anim = null; }
      if (ouvrir) {
        el.classList.remove('br-fermeture');
        el.open = true;
        anim = animer(corps, [{ height: '0px', opacity: 0 }, { height: corps.scrollHeight + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2, .9, .3, 1)' });
        if (anim) anim.onfinish = function () { anim = null; };
      } else {
        el.classList.add('br-fermeture');
        anim = animer(corps, [{ height: corps.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.4, 0, .9, .6)' });
        var fin = function () { anim = null; el.open = false; el.classList.remove('br-fermeture'); };
        if (anim) anim.onfinish = fin; else fin();
      }
      emit(el, 'change', { ouvert: ouvrir });
    }
    s.addEventListener('click', function (e) { e.preventDefault(); basculer(); });
    return { basculer: basculer };
  });

  kit('compteur-tambour', 'controles', function (el) {
    if (el.tagName !== 'INPUT') return {};
    var min = el.min !== '' ? +el.min : -Infinity, max = el.max !== '' ? +el.max : Infinity, pas = +el.step || 1;
    var v = el.value !== '' && !isNaN(+el.value) ? +el.value : (min > -Infinity ? min : 0), deci = (String(pas).split('.')[1] || '').length;
    var w = mk('span', 'br-tb', '');
    var moins = bouton('br-tb-b', SVC('<path d="M6 12h12"/>'), 'Diminuer'), plus = bouton('br-tb-b', SVC('<path d="M6 12h12M12 6v12"/>'), 'Augmenter');
    var t = mk('span', 'br-tb-tambour', '<span class="br-tb-col"></span>'), col = t.firstChild;
    t.setAttribute('role', 'spinbutton');
    t.tabIndex = 0;
    t.setAttribute('aria-label', nomChamp(el) || 'Valeur');
    if (min > -Infinity) t.setAttribute('aria-valuemin', min);
    if (max < Infinity) t.setAttribute('aria-valuemax', max);
    w.appendChild(moins); w.appendChild(t); w.appendChild(plus);
    el.classList.add('br-natif');
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.parentNode.insertBefore(w, el.nextSibling);
    function txt(x) { return x.toFixed(deci).replace('.', ','); }
    function rendu() {
      var s = '';
      for (var k = -2; k <= 2; k++) { var x = v + k * pas; s += '<span style="--k:' + k + ';--o:' + (1 - Math.abs(k) * .42) + '"' + (k === 0 ? ' class="on"' : '') + '>' + (x < min || x > max ? '' : txt(x)) + '</span>'; }
      col.innerHTML = s;
      t.setAttribute('aria-valuenow', v);
      t.setAttribute('aria-valuetext', txt(v));
      moins.disabled = v - pas < min;
      plus.disabled = v + pas > max;
    }
    function regler(nv, sens) {
      nv = +borne(Math.round(nv / pas) * pas, min, max).toFixed(deci);
      if (nv === v) { relancer(t, 'br-secoue'); return; }
      sens = sens || (nv > v ? 1 : -1);
      v = nv;
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      rendu();
      animer(col, [{ transform: 'translateY(' + (sens * 24) + 'px)' }, { transform: 'none' }], { duration: 520, easing: ressortJS() });
      emit(el, 'change', { valeur: v });
    }
    moins.addEventListener('click', function () { regler(v - pas, -1); });
    plus.addEventListener('click', function () { regler(v + pas, 1); });
    t.addEventListener('keydown', function (e) {
      var d = { ArrowUp: pas, ArrowDown: -pas, PageUp: pas * 10, PageDown: -pas * 10 }[e.key];
      if (e.key === 'Home' && min > -Infinity) { e.preventDefault(); regler(min); }
      else if (e.key === 'End' && max < Infinity) { e.preventDefault(); regler(max); }
      else if (d) { e.preventDefault(); regler(v + d); }
    });
    var roue = 0;
    t.addEventListener('wheel', function (e) {
      e.preventDefault();
      var now = performance.now(); if (now - roue < 90) return; roue = now;
      regler(v + (e.deltaY < 0 ? pas : -pas));
    }, { passive: false });
    var g = null;
    t.addEventListener('pointerdown', function (e) { g = { y: e.clientY }; try { t.setPointerCapture(e.pointerId); } catch (_) {} });
    t.addEventListener('pointermove', function (e) {
      if (!g) return;
      var n = Math.trunc((g.y - e.clientY) / 18);
      if (n) { g.y -= n * 18; regler(v + n * pas, n > 0 ? 1 : -1); }
    });
    t.addEventListener('pointerup', function () { g = null; });
    t.addEventListener('pointercancel', function () { g = null; });
    rendu();
    return { valeur: function (x) { if (x == null) return v; regler(+x); } };
  });

  kit('theme-trois', 'controles', function (el) {
    if (el.tagName !== 'BUTTON') return {};
    el.type = 'button';
    var E = ['clair', 'systeme', 'sombre'], N = { clair: 'clair', systeme: 'système', sombre: 'sombre' }, m = idCtl('tt'), r = '', i = 1, tour = 0;
    for (var k = 0; k < 8; k++) {
      var a = k * Math.PI / 4;
      r += '<line x1="' + (12 + Math.cos(a) * 8.2).toFixed(2) + '" y1="' + (12 + Math.sin(a) * 8.2).toFixed(2) + '" x2="' + (12 + Math.cos(a) * 10.4).toFixed(2) + '" y2="' + (12 + Math.sin(a) * 10.4).toFixed(2) + '"/>';
    }
    var texte = el.hasAttribute('data-texte');
    el.innerHTML = '<span class="br-tt-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
      '<mask id="' + m + '"><rect width="24" height="24" fill="#fff"/><circle class="br-tt-ombre" cx="12" cy="12" r="6.4" fill="#000" stroke="none"/></mask>' +
      '<g class="br-tt-rayons">' + r + '</g><circle class="br-tt-astre" cx="12" cy="12" r="5.2" fill="currentColor" stroke="none" mask="url(#' + m + ')"/>' +
      '<circle class="br-tt-contour" cx="12" cy="12" r="7.4"/><path class="br-tt-moitie" d="M12 4.6a7.4 7.4 0 0 1 0 14.8Z" fill="currentColor" stroke="none"/></svg></span>' +
      (texte ? '<span class="br-tt-txt" aria-hidden="true"></span>' : '');
    var applique = el.hasAttribute('data-applique'), racine = document.documentElement;
    if (applique) { var th = racine.getAttribute('data-theme'); i = th === 'dark' ? 2 : th === 'light' ? 0 : 1; }
    else if (E.indexOf(el.dataset.etat) >= 0) i = E.indexOf(el.dataset.etat);
    function regler(n, silence) {
      i = n;
      el.setAttribute('data-etat-theme', E[i]);
      el.setAttribute('aria-label', 'Thème : ' + N[E[i]] + ' (changer)');
      if (texte) el.querySelector('.br-tt-txt').textContent = N[E[i]].charAt(0).toUpperCase() + N[E[i]].slice(1);
      el.style.setProperty('--tour', (tour * 120) + 'deg');
      if (silence) return;
      if (applique) {
        if (E[i] === 'systeme') racine.removeAttribute('data-theme'); else racine.setAttribute('data-theme', E[i] === 'sombre' ? 'dark' : 'light');
        try { if (E[i] === 'systeme') localStorage.removeItem('brio-theme'); else localStorage.setItem('brio-theme', E[i] === 'sombre' ? 'dark' : 'light'); } catch (_) {}
      }
      relancer(el, 'br-tic');
      emit(el, 'change', { theme: E[i] });
    }
    el.addEventListener('click', function () { tour++; regler((i + 1) % 3); });
    regler(i, true);
    return { regler: function (e) { var n = E.indexOf(e); if (n >= 0) { tour++; regler(n); } } };
  });

  var ICO_GRILLE = '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>';
  var ICO_PILE = '<path d="M12 3.5 20.5 8 12 12.5 3.5 8Z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16 8.5 4.5 8.5-4.5"/>';
  kit('disposition', 'controles', function (el) {
    var cible = el.dataset.cible ? document.querySelector(el.dataset.cible) : null, mode = el.dataset.mode === 'pile' ? 'pile' : 'grille';
    el.setAttribute('role', 'group');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Disposition');
    el.innerHTML = '<i class="br-dp3-fond" aria-hidden="true"></i>';
    var bG = bouton('br-dp3-b', SVC(ICO_GRILLE), 'Grille'), bP = bouton('br-dp3-b', SVC(ICO_PILE), 'Pile en perspective');
    el.appendChild(bG); el.appendChild(bP);
    if (cible) cible.classList.add('br-dispo');
    function regler(m, silence) {
      mode = m;
      bG.setAttribute('aria-pressed', String(m === 'grille'));
      bP.setAttribute('aria-pressed', String(m === 'pile'));
      el.classList.toggle('br-mode-pile', m === 'pile');
      if (!cible) return;
      var enfants = [].slice.call(cible.children), avant = enfants.map(function (c) { return c.getBoundingClientRect(); });
      enfants.forEach(function (c, k) { c.style.setProperty('--k', k); });
      cible.classList.toggle('br-dispo-pile', m === 'pile');
      if (!silence) enfants.forEach(function (c, k) {
        var apres = c.getBoundingClientRect(), dx = avant[k].left - apres.left, dy = avant[k].top - apres.top;
        animer(c, [{ translate: dx + 'px ' + dy + 'px' }, { translate: '0 0' }], { duration: 560, easing: ressortJS(), delay: k * 25, fill: 'backwards' });
      });
      if (!silence) emit(el, 'change', { mode: m });
    }
    bG.addEventListener('click', function () { if (mode !== 'grille') regler('grille'); });
    bP.addEventListener('click', function () { if (mode !== 'pile') regler('pile'); });
    regler(mode, true);
    return { regler: regler };
  });

  /* ---------- Navigation ---------- */
  function ongletsClavier(liste, onglets, aller) {
    liste.addEventListener('keydown', function (e) {
      var l = onglets(), i = l.indexOf(document.activeElement);
      if (i < 0) return;
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? l.length - 1 : null;
      if (j == null) return;
      e.preventDefault();
      aller((j + l.length) % l.length, true);
    });
  }
  function suivreTaille(el, f) {
    if ('ResizeObserver' in window) new ResizeObserver(function () { f(); }).observe(el);
    addEventListener('resize', f);
  }

  kit('onglets-ab', 'navigation', function (el) {
    var panneaux = [].filter.call(el.children, function (c) { return c.nodeType === 1; });
    var liste = mk('div', 'br-ab-liste', '<i class="br-ab-ind" aria-hidden="true"></i>'), zone = mk('div', 'br-ab-zone'), ind = liste.firstChild, actif = -1;
    liste.setAttribute('role', 'tablist');
    if (el.getAttribute('aria-label')) { liste.setAttribute('aria-label', el.getAttribute('aria-label')); el.removeAttribute('aria-label'); }
    var onglets = panneaux.map(function (p, i) {
      var t = bouton('br-ab-o', '<b>' + esc(p.dataset.titre || String.fromCharCode(65 + i)) + '</b>' + (p.dataset.sous ? '<small>' + esc(p.dataset.sous) + '</small>' : ''));
      t.setAttribute('role', 'tab');
      t.id = idCtl('ab');
      p.id = p.id || idCtl('abp');
      t.setAttribute('aria-controls', p.id);
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', t.id);
      p.tabIndex = 0;
      p.classList.add('br-ab-p');
      liste.appendChild(t); zone.appendChild(p);
      return t;
    });
    el.appendChild(liste); el.appendChild(zone);
    function placer() { var t = onglets[actif]; if (!t) return; ind.style.width = t.offsetWidth + 'px'; ind.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
    function aller(i, focus) {
      if (i === actif) { if (focus) onglets[i].focus(); return; }
      var avant = actif, sens = i > avant ? 1 : -1;
      actif = i;
      onglets.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      placer();
      panneaux.forEach(function (p, k) { if (k !== i && k !== avant) p.hidden = true; });
      var nv = panneaux[i];
      nv.hidden = false;
      if (avant >= 0) {
        var ancien = panneaux[avant];
        var a = animer(ancien, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-sens * 14) + '%)' }], { duration: 220, easing: 'ease-in' });
        if (a) a.onfinish = function () { if (actif !== avant) ancien.hidden = true; }; else ancien.hidden = true;
        animer(nv, [{ opacity: 0, transform: 'translateX(' + (sens * 14) + '%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: ressortJS() });
        relancer(onglets[i], 'br-tic');
        emit(el, 'change', { index: i, titre: onglets[i].textContent });
      }
      if (focus) onglets[i].focus();
    }
    liste.addEventListener('click', function (e) { var t = e.target.closest('.br-ab-o'); if (t) aller(onglets.indexOf(t)); });
    ongletsClavier(liste, function () { return onglets; }, aller);
    suivreTaille(liste, placer);
    var i0 = 0;
    panneaux.forEach(function (p, k) { if (p.hasAttribute('data-actif')) i0 = k; });
    aller(i0);
    return { aller: aller };
  });

  kit('onglets-fermables', 'navigation', function (el) {
    var barre = mk('div', 'br-of-barre'), liste = mk('div', 'br-of-liste', '<i class="br-of-ind" aria-hidden="true"></i>'), zone = mk('div', 'br-of-zone'), ind = liste.firstChild;
    liste.setAttribute('role', 'tablist');
    if (el.getAttribute('aria-label')) { liste.setAttribute('aria-label', el.getAttribute('aria-label')); el.removeAttribute('aria-label'); }
    var tabs = [], actif = null, nNouveau = 0, ajout = null;
    function creer(p) {
      var o = mk('div', 'br-of-o'), t = bouton('br-of-t', '<span>' + esc(p.dataset.titre || 'Onglet') + '</span>'), x = bouton('br-of-x', SVC('<path d="M7 7l10 10M17 7 7 17"/>'));
      o.setAttribute('role', 'presentation');
      t.setAttribute('role', 'tab');
      t.id = idCtl('of');
      t.setAttribute('aria-keyshortcuts', 'Delete');
      p.id = p.id || idCtl('ofp');
      t.setAttribute('aria-controls', p.id);
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', t.id);
      p.tabIndex = 0;
      p.classList.add('br-of-p');
      p.hidden = true;
      x.tabIndex = -1;
      x.setAttribute('aria-hidden', 'true');
      x.title = 'Fermer';
      o.appendChild(t); o.appendChild(x);
      liste.appendChild(o); zone.appendChild(p);
      var e = { o: o, t: t, p: p };
      tabs.push(e);
      return e;
    }
    [].filter.call(el.children, function (c) { return c.nodeType === 1; }).forEach(creer);
    barre.appendChild(liste);
    if (el.hasAttribute('data-ajout')) {
      ajout = bouton('br-of-ajout', SVC('<path d="M12 6v12M6 12h12"/>'), 'Nouvel onglet');
      barre.appendChild(ajout);
    }
    el.appendChild(barre); el.appendChild(zone);
    function placer() { if (!actif || !actif.o.isConnected) return; ind.style.width = actif.o.offsetWidth + 'px'; ind.style.transform = 'translateX(' + (actif.o.offsetLeft - liste.scrollLeft * 0) + 'px)'; }
    function aller(e, focus) {
      actif = e;
      tabs.forEach(function (x) { var on = x === e; x.t.setAttribute('aria-selected', String(on)); x.t.tabIndex = on ? 0 : -1; x.o.classList.toggle('br-actif', on); x.p.hidden = !on; });
      placer();
      if (focus) e.t.focus();
      e.o.scrollIntoView && e.o.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      emit(el, 'change', { titre: e.t.textContent });
    }
    function fermer(e) {
      if (tabs.length < 2) { relancer(e.o, 'br-secoue'); return; }
      var i = tabs.indexOf(e), voisin = tabs[i + 1] || tabs[i - 1], focus = e.t === document.activeElement;
      tabs.splice(i, 1);
      if (actif === e) aller(voisin, focus); else if (focus) actif.t.focus();
      e.p.remove();
      e.o.style.pointerEvents = 'none';
      var a = animer(e.o, [{ width: e.o.offsetWidth + 'px', opacity: 1 }, { width: '0px', opacity: 0, transform: 'translateY(30%)' }], { duration: 240, easing: 'cubic-bezier(.4, 0, .2, 1)' });
      var fin = function () { e.o.remove(); placer(); };
      if (a) { a.onfinish = fin; var tic = function () { placer(); if (e.o.isConnected) requestAnimationFrame(tic); }; requestAnimationFrame(tic); } else fin();
      emit(el, 'fermer', { titre: e.t.textContent });
    }
    liste.addEventListener('click', function (ev) {
      var o = ev.target.closest('.br-of-o'); if (!o) return;
      var e = tabs.filter(function (x) { return x.o === o; })[0]; if (!e) return;
      if (ev.target.closest('.br-of-x')) fermer(e); else aller(e);
    });
    liste.addEventListener('auxclick', function (ev) { if (ev.button !== 1) return; var o = ev.target.closest('.br-of-o'); var e = tabs.filter(function (x) { return x.o === o; })[0]; if (e) { ev.preventDefault(); fermer(e); } });
    ongletsClavier(liste, function () { return tabs.map(function (x) { return x.t; }); }, function (i, f) { aller(tabs[i], f); });
    liste.addEventListener('keydown', function (ev) { if (ev.key !== 'Delete') return; var e = tabs.filter(function (x) { return x.t === document.activeElement; })[0]; if (e) { ev.preventDefault(); fermer(e); } });
    if (ajout) ajout.addEventListener('click', function () {
      nNouveau++;
      var p = mk('div', '', '<p>Contenu du nouvel onglet ' + nNouveau + '.</p>');
      p.dataset.titre = 'Nouveau ' + nNouveau;
      var e = creer(p);
      aller(e);
      var w = e.o.offsetWidth;
      animer(e.o, [{ width: '0px', opacity: 0 }, { width: w + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2, .9, .3, 1)' });
      emit(el, 'ajout', { titre: p.dataset.titre });
    });
    suivreTaille(liste, placer);
    liste.addEventListener('scroll', placer, { passive: true });
    if (tabs.length) aller(tabs.filter(function (x) { return x.p.hasAttribute('data-actif'); })[0] || tabs[0]);
    return { aller: function (i) { if (tabs[i]) aller(tabs[i]); }, fermer: function (i) { if (tabs[i]) fermer(tabs[i]); } };
  });

  kit('etapes', 'navigation', function (el) {
    var noms = (el.dataset.etapes || 'Panier|Livraison|Paiement').split('|'), n = noms.length, cur = borne(parseInt(el.dataset.actuelle, 10) || 0, 0, n);
    el.innerHTML = '<div class="br-et-cadre"><div class="br-et-piste" aria-hidden="true"><i></i></div><ol class="br-et-liste">' + noms.map(function (t, i) {
      return '<li class="br-et-e"><span class="br-et-rond" aria-hidden="true"><b>' + (i + 1) + '</b>' + SVC(COCHE, 'br-et-coche') + '</span><span class="br-et-txt"><small>Étape ' + (i + 1) + '</small>' + esc(t.trim()) + '</span></li>';
    }).join('') + '</ol></div>' + (el.hasAttribute('data-commandes') ? '<div class="br-et-cmd"><button type="button" class="br-et-b p">Précédent</button><button type="button" class="br-et-b s">Suivant</button></div>' : '');
    el.style.setProperty('--n', n);
    var lis = [].slice.call(el.querySelectorAll('.br-et-e')), rempli = el.querySelector('.br-et-piste i'), p = el.querySelector('.br-et-b.p'), s = el.querySelector('.br-et-b.s'), dit = annonce(el);
    function aller(i, silence) {
      i = borne(i, 0, n);
      var avant = cur;
      cur = i;
      lis.forEach(function (li, k) {
        li.classList.toggle('br-fait', k < i);
        li.classList.toggle('br-courant', k === i);
        if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.querySelector('.br-et-txt').setAttribute('aria-label', 'Étape ' + (k + 1) + ' : ' + noms[k] + (k < i ? ' (terminée)' : ''));
      });
      rempli.style.transform = 'scaleX(' + (n > 1 ? Math.min(i, n - 1) / (n - 1) : 1) + ')';
      if (p) p.disabled = i === 0;
      if (s) s.textContent = i >= n - 1 ? 'Terminer' : 'Suivant', s.disabled = i >= n;
      if (!silence) {
        if (lis[Math.min(i, n - 1)] && i !== avant) relancer(lis[i > avant ? Math.max(0, i - 1) : i] || lis[0], 'br-tic');
        dit.textContent = i >= n ? 'Toutes les étapes sont terminées.' : 'Étape ' + (i + 1) + ' sur ' + n + ' : ' + noms[i];
        emit(el, 'change', { etape: i, termine: i >= n });
      }
    }
    if (p) p.addEventListener('click', function () { aller(cur - 1); });
    if (s) s.addEventListener('click', function () { aller(cur + 1); });
    aller(cur, true);
    return { aller: aller, suivant: function () { aller(cur + 1); }, precedent: function () { aller(cur - 1); } };
  });

  var JOURS_C = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], JOURS_L = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function lireIso(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
  function plusJours(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  kit('selecteur-date', 'navigation', function (el) {
    if (el.tagName !== 'INPUT') return {};
    var N = 5, sel = lireIso(el.value) || new Date(), debut;
    sel = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate());
    debut = plusJours(sel, -2);
    var w = mk('div', 'br-sd', '<div class="br-sd-mois" aria-hidden="true"></div><div class="br-sd-rang"></div>');
    var prec = bouton('br-sd-nav', SVC('<path d="M14 7l-5 5 5 5"/>'), 'Jours précédents'), suiv = bouton('br-sd-nav', SVC('<path d="M10 7l5 5-5 5"/>'), 'Jours suivants');
    var fen = mk('div', 'br-sd-fen', '<i class="br-sd-pilule" aria-hidden="true"></i><div class="br-sd-jours"></div>'), jours = fen.lastChild, pil = fen.firstChild;
    jours.setAttribute('role', 'radiogroup');
    jours.setAttribute('aria-label', nomChamp(el) || 'Date');
    w.lastChild.appendChild(prec); w.lastChild.appendChild(fen); w.lastChild.appendChild(suiv);
    el.classList.add('br-natif');
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.parentNode.insertBefore(w, el.nextSibling);
    var mois = w.firstChild;
    function rendu() {
      var s = '';
      for (var k = 0; k < N; k++) {
        var d = plusJours(debut, k), on = +d === +sel;
        s += '<button type="button" role="radio" class="br-sd-j' + (iso(d) === iso(new Date()) ? ' br-auj' : '') + '" aria-checked="' + on + '" tabindex="-1" data-iso="' + iso(d) + '" aria-label="' +
          JOURS_L[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + '"><small>' + JOURS_C[d.getDay()] + '</small><b>' + d.getDate() + '</b></button>';
      }
      jours.innerHTML = s;
      var b = jours.querySelector('[aria-checked="true"]') || jours.firstChild;
      b.tabIndex = 0;
      var idx = Math.round((sel - debut) / 864e5);
      pil.classList.toggle('on', idx >= 0 && idx < N);
      pil.style.setProperty('--x', borne(idx, -1, N));
      mois.textContent = MOIS[sel.getMonth()].charAt(0).toUpperCase() + MOIS[sel.getMonth()].slice(1) + ' ' + sel.getFullYear();
    }
    function decaler(n) {
      debut = plusJours(debut, n);
      rendu();
      animer(jours, [{ transform: 'translateX(' + (n * 100 / N) + '%)' }, { transform: 'none' }], { duration: 380, easing: ressortJS() });
    }
    function choisir(d, focus) {
      sel = d;
      var idx = Math.round((sel - debut) / 864e5);
      if (idx < 0) decaler(idx); else if (idx >= N) decaler(idx - N + 1); else rendu();
      el.value = iso(sel);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      emit(el, 'change', { date: el.value });
      if (focus) { var b = jours.querySelector('[aria-checked="true"]'); if (b) b.focus(); }
    }
    prec.addEventListener('click', function () { decaler(-1); });
    suiv.addEventListener('click', function () { decaler(1); });
    jours.addEventListener('click', function (e) { var b = e.target.closest('.br-sd-j'); if (b) choisir(lireIso(b.dataset.iso), true); });
    jours.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1, PageDown: 7, PageUp: -7 }[e.key];
      if (e.key === 'Home') { e.preventDefault(); var a = new Date(); choisir(new Date(a.getFullYear(), a.getMonth(), a.getDate()), true); }
      else if (d) { e.preventDefault(); choisir(plusJours(sel, d), true); }
    });
    rendu();
    if (!el.value) el.value = iso(sel);
    return { choisir: function (s) { var d = lireIso(s); if (d) choisir(d); } };
  });

  kit('points-etapes', 'navigation', function (el) {
    var cible = el.dataset.cible ? document.querySelector(el.dataset.cible) : null;
    var n = cible ? cible.children.length : borne(parseInt(el.dataset.nombre, 10) || 5, 2, 12), cur = 0;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'group');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Pagination');
    var s = '<i class="br-pt-ind" aria-hidden="true"></i>';
    for (var i = 0; i < n; i++) s += '<button type="button" class="br-pt-p" aria-label="Élément ' + (i + 1) + ' sur ' + n + '"></button>';
    el.innerHTML = s;
    el.style.setProperty('--n', n);
    var pts = [].slice.call(el.querySelectorAll('.br-pt-p'));
    function aller(i, focus, depuisCible) {
      i = borne(i, 0, n - 1);
      el.classList.toggle('br-vers-droite', i > cur);
      el.classList.toggle('br-vers-gauche', i < cur);
      var change = i !== cur;
      cur = i;
      el.style.setProperty('--c', i);
      pts.forEach(function (p, k) { if (k === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current'); p.tabIndex = k === i ? 0 : -1; });
      if (focus) pts[i].focus();
      if (cible && !depuisCible) cible.children[i].scrollIntoView({ behavior: calme() ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      if (change) emit(el, 'change', { index: i });
    }
    el.addEventListener('click', function (e) { var p = e.target.closest('.br-pt-p'); if (p) aller(pts.indexOf(p)); });
    ongletsClavier(el, function () { return pts; }, aller);
    if (cible) {
      var raf = 0;
      cible.addEventListener('scroll', function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = cible.getBoundingClientRect(), mx = r.left + r.width / 2, best = 0, dmin = Infinity;
          [].forEach.call(cible.children, function (c, k) { var q = c.getBoundingClientRect(), d = Math.abs(q.left + q.width / 2 - mx); if (d < dmin) { dmin = d; best = k; } });
          if (best !== cur) aller(best, false, true);
        });
      }, { passive: true });
    }
    aller(0);
    return { aller: aller };
  });

  /* ---------- Indicateurs ---------- */
  function pourcent(el) {
    var min = el.tagName === 'PROGRESS' ? 0 : +el.min || 0, max = +el.max || 1;
    return max > min ? borne((+el.value - min) / (max - min), 0, 1) : 0;
  }
  function compterVers(span, de, a) {
    if (calme()) { span.textContent = Math.round(a) + ' %'; return; }
    var t0 = performance.now();
    (function pas(t) {
      var k = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - k, 3);
      span.textContent = Math.round(de + (a - de) * e) + ' %';
      if (k < 1) requestAnimationFrame(pas);
    })(t0);
  }
  kit('jauge-segments', 'indicateurs', function (el) {
    if (el.tagName !== 'METER' && el.tagName !== 'PROGRESS') return {};
    var w = mk('span', 'br-jg', '<span class="br-jg-barres">' + [0, 1, 2, 3].map(function (i) { return '<i style="--i:' + i + '"><b></b></i>'; }).join('') + '</span><span class="br-jg-val">0 %</span>');
    w.setAttribute('aria-hidden', 'true');
    el.classList.add('br-natif');
    el.parentNode.insertBefore(w, el.nextSibling);
    var barres = w.querySelectorAll('.br-jg-barres b'), val = w.lastChild, aff = 0;
    function maj() {
      var p = pourcent(el);
      [].forEach.call(barres, function (b, i) { b.style.setProperty('--f', borne(p * 4 - i, 0, 1).toFixed(3)); });
      w.dataset.niveau = p < .34 ? 'bas' : p < .67 ? 'moyen' : 'haut';
      compterVers(val, aff, p * 100);
      aff = p * 100;
    }
    new MutationObserver(maj).observe(el, { attributes: true, attributeFilter: ['value', 'min', 'max'] });
    maj();
    return { valeur: function (v) { el.value = v; } };
  });

  kit('barre-segments', 'indicateurs', function (el) {
    if (el.tagName !== 'METER' && el.tagName !== 'PROGRESS') return {};
    var n = borne(parseInt(el.dataset.segments, 10) || 10, 3, 20), s = '';
    for (var i = 0; i < n; i++) s += '<i></i>';
    var w = mk('span', 'br-bs', '<span class="br-bs-coque">' + s + (el.hasAttribute('data-charge') ? SVC('<path d="M13 3 6 13.5h5L10 21l7-10.5h-5Z" fill="currentColor"/>', 'br-bs-eclair') : '') + '</span><span class="br-bs-val">0 %</span>');
    w.setAttribute('aria-hidden', 'true');
    el.classList.add('br-natif');
    el.parentNode.insertBefore(w, el.nextSibling);
    var segs = w.querySelectorAll('.br-bs-coque i'), val = w.querySelector('.br-bs-val'), k0 = 0, aff = 0;
    function maj() {
      var p = pourcent(el), k = Math.round(p * n);
      [].forEach.call(segs, function (g, j) {
        var on = j < k;
        g.style.transitionDelay = (calme() ? 0 : on ? Math.max(0, j - k0) * 45 : Math.max(0, k0 - 1 - j) * 35) + 'ms';
        g.classList.toggle('on', on);
      });
      w.dataset.niveau = p <= .2 ? 'bas' : p <= .45 ? 'moyen' : 'haut';
      compterVers(val, aff, p * 100);
      aff = p * 100; k0 = k;
    }
    new MutationObserver(maj).observe(el, { attributes: true, attributeFilter: ['value', 'min', 'max'] });
    maj();
    return { valeur: function (v) { el.value = v; } };
  });

  var FORMES_TL = {
    plateau: ['<path d="M12 4v10.5M7.5 10 12 14.5 16.5 10"/>', '<path d="M4.5 15.5v2.5A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5"/>'],
    nuage: ['<path d="M12 10.5v9M9 16.5l3 3 3-3"/>', '<path d="M7.5 17H7a4 4 0 0 1-.6-7.95A6 6 0 0 1 17.6 8.4 4.3 4.3 0 0 1 17.5 17H17"/>'],
    fleche: ['<path d="M12 4v12M7 11l5 5 5-5"/>', '<path d="M6 20h12"/>']
  };
  kit('icones-telechargement', 'indicateurs', function (el) {
    if (el.tagName !== 'BUTTON') return {};
    el.type = 'button';
    var f = FORMES_TL[el.dataset.forme] || FORMES_TL.plateau, nom = el.getAttribute('aria-label') || 'Télécharger', etat = 'repos';
    el.innerHTML = '<svg class="br-tl-anneau" viewBox="0 0 44 44" aria-hidden="true"><circle class="f" cx="22" cy="22" r="20"/><circle class="p" cx="22" cy="22" r="20" pathLength="100"/></svg>' +
      SVC('<g class="br-tl-fleche">' + f[0] + '</g><g class="br-tl-base">' + f[1] + '</g><path class="br-tl-coche" d="M7.5 12.5l3 3 6-6.5" pathLength="100"/>', 'br-tl-ico');
    el.setAttribute('aria-label', nom);
    var dit = annonce(el), minuteur = 0;
    function regler(e) {
      etat = e;
      el.dataset.etat = e;
      el.setAttribute('aria-busy', String(e === 'cours'));
    }
    function avancer(p) { if (etat !== 'cours') return; el.style.setProperty('--p', borne(p, 0, 1).toFixed(3)); }
    function terminer(ok, message) {
      if (etat !== 'cours') return;
      clearInterval(minuteur);
      if (ok === false) {
        regler('erreur'); relancer(el, 'br-secoue'); dit.textContent = message || 'Échec du téléchargement.';
        setTimeout(function () { if (etat === 'erreur') { regler('repos'); el.style.setProperty('--p', 0); } }, 1400);
        return;
      }
      avancer(1); regler('fini'); dit.textContent = 'Téléchargement terminé.';
      emit(el, 'fin', {});
    }
    el.addEventListener('click', function () {
      if (etat === 'cours') return;
      if (etat === 'fini') { regler('repos'); el.style.setProperty('--p', 0); dit.textContent = ''; return; }
      regler('cours'); el.style.setProperty('--p', 0); dit.textContent = 'Téléchargement en cours.';
      emit(el, 'telechargement', { avancer: avancer, terminer: terminer });
      if (el.hasAttribute('data-demo')) {
        var p = 0;
        minuteur = setInterval(function () { p += .06 + Math.random() * .12; if (p >= 1) terminer(true); else avancer(p); }, calme() ? 60 : 200);
      }
    });
    regler('repos');
    return { avancer: avancer, terminer: terminer };
  });


  /* (Boutou : effets de pointeur et lots 5-6 retirés : inutiles sur mobile) */

  /* ==========================================================================
     Démarrage automatique + éléments ajoutés plus tard
     ========================================================================== */
  function demarrer() {
    initTransitions();
    BR.init(document);
    if ('MutationObserver' in window && !BR._obs) {
      BR._obs = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          for (var i = 0; i < m.addedNodes.length; i++) {
            var n = m.addedNodes[i];
            if (n.nodeType !== 1) continue;
            if (/^br-/.test(n.getAttribute('class') || '') && !n.matches(SELECTEUR)) continue;
            BR.init(n);
          }
        });
      });
      BR._obs.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
