/* Boutou — mascotte originale (SVG en couches, sans dépendance).
   Couches : ombre, corps duveteux (filtre), bras, pousse, visage.
   Seule la couche corps porte le filtre : les animations (clignement,
   pousse, bras) ne redéclenchent jamais le calcul du duvet. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var VB = '0 0 200 200';

  var DEFS =
    '<radialGradient id="btBody" cx="38%" cy="30%" r="78%">' +
      '<stop offset="0" stop-color="#FFEBB0"/><stop offset=".42" stop-color="#FCC64F"/>' +
      '<stop offset=".78" stop-color="#EFA02B"/><stop offset="1" stop-color="#D47F1A"/></radialGradient>' +
    '<radialGradient id="btLimb" cx="40%" cy="30%" r="80%">' +
      '<stop offset="0" stop-color="#FFD978"/><stop offset=".7" stop-color="#F1A733"/>' +
      '<stop offset="1" stop-color="#D4811C"/></radialGradient>' +
    '<radialGradient id="btFoot" cx="45%" cy="30%" r="80%">' +
      '<stop offset="0" stop-color="#F7B544"/><stop offset="1" stop-color="#C9771A"/></radialGradient>' +
    '<radialGradient id="btBelly" cx="50%" cy="38%" r="62%">' +
      '<stop offset="0" stop-color="#FFFBEF"/><stop offset=".7" stop-color="#FFEFC7"/>' +
      '<stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="btAO" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset=".55" stop-color="#A85A0C" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#A85A0C" stop-opacity=".32"/></linearGradient>' +
    '<radialGradient id="btShine" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="btBlush" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#FF7D73" stop-opacity=".62"/><stop offset="1" stop-color="#FF7D73" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="btEye" cx="38%" cy="32%" r="75%">' +
      '<stop offset="0" stop-color="#5A3820"/><stop offset=".55" stop-color="#2B170A"/>' +
      '<stop offset="1" stop-color="#120803"/></radialGradient>' +
    '<radialGradient id="btShadow" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#2B2010" stop-opacity=".28"/><stop offset="1" stop-color="#2B2010" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="btLeaf" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#B6E88E"/><stop offset="1" stop-color="#3E9456"/></linearGradient>' +
    '<linearGradient id="btLeaf2" x1="1" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#A9E184"/><stop offset="1" stop-color="#358A4D"/></linearGradient>' +
    '<linearGradient id="btBud" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#FFC7BD"/><stop offset="1" stop-color="#EE6F78"/></linearGradient>' +
    '<radialGradient id="btPetal" cx="50%" cy="85%" r="90%">' +
      '<stop offset="0" stop-color="#FFE9EF"/><stop offset="1" stop-color="#F59BB2"/></radialGradient>' +
    '<filter id="btFur" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".46" numOctaves="3" seed="11" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="8.5" xChannelSelector="R" yChannelSelector="G" result="d0"/>' +
      '<feGaussianBlur in="d0" stdDeviation=".55" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 .97  0 0 0 0 .88  0 0 0 -2.2 1.4" result="ga"/>' +
      '<feComposite in="ga" in2="d" operator="in" result="gi"/>' +
      '<feComponentTransfer in="gi" result="gs"><feFuncA type="linear" slope=".2"/></feComponentTransfer>' +
      '<feMerge><feMergeNode in="d"/><feMergeNode in="gs"/></feMerge>' +
    '</filter>';

  var BODY_PATH = 'M100 50C146 50 172 88 172 126C172 164 140 187 100 187C60 187 28 164 28 126C28 88 54 50 100 50Z';

  function svg(cls, inner) {
    return '<svg class="bt-l ' + cls + '" viewBox="' + VB + '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* ---------- Corps (filtré, statique) ---------- */
  var BODY =
    '<g filter="url(#btFur)">' +
      '<ellipse cx="74" cy="182" rx="17" ry="10.5" fill="url(#btFoot)"/>' +
      '<ellipse cx="126" cy="182" rx="17" ry="10.5" fill="url(#btFoot)"/>' +
      '<path d="' + BODY_PATH + '" fill="url(#btBody)"/>' +
      '<ellipse cx="100" cy="153" rx="45" ry="31" fill="url(#btBelly)"/>' +
      '<path d="' + BODY_PATH + '" fill="url(#btAO)"/>' +
      '<ellipse cx="70" cy="82" rx="27" ry="16" transform="rotate(-24 70 82)" fill="url(#btShine)"/>' +
    '</g>';

  var SHADOW = '<ellipse cx="100" cy="190" rx="62" ry="8" fill="url(#btShadow)"/>';

  /* ---------- Bras (filtrés, animés par l'élément entier) ---------- */
  var ARM_L = '<g filter="url(#btFur)"><ellipse cx="34" cy="138" rx="13" ry="20" transform="rotate(24 34 138)" fill="url(#btLimb)"/></g>';
  var ARM_R = '<g filter="url(#btFur)"><ellipse cx="166" cy="138" rx="13" ry="20" transform="rotate(-24 166 138)" fill="url(#btLimb)"/></g>';

  /* ---------- Pousse : 0 graine, 1 pousse, 2 jeune plant, 3 bouton, 4 fleur ---------- */
  var STEM = function (top) {
    return '<path d="M100 56C99 ' + (56 - (56 - top) * .35) + ' 101.5 ' + (56 - (56 - top) * .7) + ' 100 ' + top + '" stroke="#3F8E4F" stroke-width="4.6" stroke-linecap="round" fill="none"/>';
  };
  var LEAF_L = '<path d="M100 38C90 26 74 26 66 32C74 43 90 45 100 38Z" fill="url(#btLeaf)"/>' +
               '<path d="M98 37.5Q84 33.5 71 32.5" stroke="#E4F7C8" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  var LEAF_R = '<path d="M100 31C110 17 127 17 135 23C127 35 111 38 100 31Z" fill="url(#btLeaf2)"/>' +
               '<path d="M102 30.5Q117 25 130 23.5" stroke="#E4F7C8" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  var SPROUTS = [
    STEM(44) + '<ellipse cx="100" cy="41" rx="5.5" ry="6.5" fill="url(#btLeaf)"/>',
    STEM(30) + '<g transform="translate(0 4) scale(1)">' + LEAF_R + '</g>',
    STEM(24) + LEAF_L + LEAF_R,
    STEM(17) + LEAF_L + LEAF_R +
      '<path d="M100 2C108 8 109 16 100 21C91 16 92 8 100 2Z" fill="url(#btBud)"/>' +
      '<path d="M100 22C95 20 92 17 91 14C95 15 98 17 100 19C102 17 105 15 109 14C108 17 105 20 100 22Z" fill="#4E9E5A"/>',
    STEM(18) + LEAF_L + LEAF_R +
      '<g transform="translate(100 12)">' +
        [0, 72, 144, 216, 288].map(function (a) {
          return '<ellipse cx="0" cy="-8" rx="6.2" ry="8.6" transform="rotate(' + a + ')" fill="url(#btPetal)"/>';
        }).join('') +
        '<circle r="5.4" fill="#F6B93B"/><circle cx="-1.5" cy="-1.6" r="1.8" fill="#FFE7A6"/>' +
      '</g>'
  ];

  /* ---------- Visage ---------- */
  function eyesOpen(dx, dy, scale) {
    dx = dx || 0; dy = dy || 0; scale = scale || 1;
    return [74, 126].map(function (x) {
      var cx = x + dx, cy = 118 + dy;
      return '<g class="bt-eye"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + 12.5 * scale + '" ry="' + 14.5 * scale + '" fill="url(#btEye)"/>' +
        '<ellipse cx="' + cx + '" cy="' + (cy + 4.5 * scale) + '" rx="' + 7.5 * scale + '" ry="' + 5.5 * scale + '" fill="#7A4A26" opacity=".35"/>' +
        '<circle cx="' + (cx - 4.4 * scale) + '" cy="' + (cy - 5.4 * scale) + '" r="' + 4.4 * scale + '" fill="#fff"/>' +
        '<circle cx="' + (cx + 4.6 * scale) + '" cy="' + (cy + 5 * scale) + '" r="' + 1.9 * scale + '" fill="#fff" opacity=".9"/></g>';
    }).join('');
  }
  var ARC = function (d) { return '<path d="' + d + '" stroke="#2A160A" stroke-width="5" stroke-linecap="round" fill="none"/>'; };
  var EYES = {
    open: function () { return eyesOpen(); },
    up: function () { return eyesOpen(3, -3); },
    big: function () { return eyesOpen(0, -1, 1.1); },
    happy: function () { return ARC('M62 121Q74 106 86 121') + ARC('M114 121Q126 106 138 121'); },
    calm: function () { return ARC('M62 116Q74 128 86 116') + ARC('M114 116Q126 128 138 116'); }
  };
  var MOUTH = {
    smile: '<path d="M91 137Q100 145 109 137" stroke="#3A1D0C" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
    open: '<path d="M87 134Q100 133 113 134Q111 152 100 152Q89 152 87 134Z" fill="#6E2C16"/>' +
          '<path d="M92 146Q100 141 108 146Q105 151 100 151Q95 151 92 146Z" fill="#F2766B"/>',
    o: '<ellipse cx="100" cy="141" rx="5.6" ry="6.6" fill="#6E2C16"/>',
    calm: '<path d="M95 139Q100 142 105 139" stroke="#3A1D0C" stroke-width="3" stroke-linecap="round" fill="none"/>',
    flat: '<path d="M93 140Q100 138.5 107 140" stroke="#3A1D0C" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
    side: '<path d="M93 139Q100.5 143.5 107.5 137.5" stroke="#3A1D0C" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
    wobble: '<path d="M91 142Q95.5 138 100 141Q104.5 144 109 140" stroke="#3A1D0C" stroke-width="3.2" stroke-linecap="round" fill="none"/>'
  };
  var BROWS = {
    soft: '<path d="M62 97Q73 93 82 98M118 98Q127 93 138 97" stroke="#7A4718" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
    sad: '<path d="M64 100Q72 94 82 95M118 95Q128 94 136 100" stroke="#7A4718" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
    focus: '<path d="M63 96L83 102M137 96L117 102" stroke="#7A4718" stroke-width="3.6" stroke-linecap="round" fill="none"/>'
  };
  var BLUSH = '<ellipse cx="55" cy="139" rx="12" ry="7" fill="url(#btBlush)"/><ellipse cx="145" cy="139" rx="12" ry="7" fill="url(#btBlush)"/>';

  var POSES = {
    idle:  { eyes: 'open',  mouth: 'smile' },
    happy: { eyes: 'happy', mouth: 'open' },
    cheer: { eyes: 'happy', mouth: 'open', arms: 'up' },
    wave:  { eyes: 'open',  mouth: 'open', arms: 'wave' },
    wow:   { eyes: 'big',   mouth: 'o' },
    calm:  { eyes: 'calm',  mouth: 'calm' },
    sleep: { eyes: 'calm',  mouth: 'o', extra: 'z' },
    think: { eyes: 'up',    mouth: 'side', brows: 'soft' },
    focus: { eyes: 'open',  mouth: 'flat', brows: 'focus' },
    tender:{ eyes: 'open',  mouth: 'wobble', brows: 'sad' }
  };

  function face(pose) {
    var p = POSES[pose] || POSES.idle;
    var z = p.extra === 'z' ? '<g class="bt-z" fill="#6E8F7E" font-family="Fredoka,system-ui" font-weight="600"><text x="146" y="78" font-size="18">z</text><text x="160" y="62" font-size="13">z</text></g>' : '';
    return BLUSH + (p.brows ? BROWS[p.brows] : '') + EYES[p.eyes]() + MOUTH[p.mouth] + z;
  }

  var defsMounted = false;
  function mountDefs() {
    if (defsMounted) return;
    var host = document.createElementNS(NS, 'svg');
    host.setAttribute('aria-hidden', 'true');
    host.setAttribute('width', '0'); host.setAttribute('height', '0');
    host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    host.innerHTML = '<defs>' + DEFS + '</defs>';
    document.body.insertBefore(host, document.body.firstChild);
    defsMounted = true;
  }

  /* Monte une mascotte dans el. opts : pose, level (0-4), size (px). */
  function render(el, opts) {
    mountDefs();
    opts = opts || {};
    var pose = opts.pose || 'idle', level = Math.max(0, Math.min(4, opts.level == null ? 2 : opts.level));
    var p = POSES[pose] || POSES.idle;
    el.classList.add('bt');
    el.setAttribute('data-pose', pose);
    el.setAttribute('data-arms', p.arms || 'rest');
    if (opts.size) el.style.setProperty('--bt-size', opts.size + 'px');
    el.innerHTML =
      svg('bt-shadow', SHADOW) +
      '<div class="bt-rig">' +
        svg('bt-body', BODY) +
        svg('bt-sprout', SPROUTS[level]) +
        svg('bt-face', face(pose)) +
        svg('bt-arm bt-arm-l', ARM_L) +
        svg('bt-arm bt-arm-r', ARM_R) +
      '</div>';
    el._bt = { pose: pose, level: level };
    return el;
  }

  /* Change seulement l'expression (pas de recalcul du corps). */
  function setPose(el, pose) {
    if (!el._bt) return render(el, { pose: pose });
    var p = POSES[pose] || POSES.idle;
    el._bt.pose = pose;
    el.setAttribute('data-pose', pose);
    el.setAttribute('data-arms', p.arms || 'rest');
    var f = el.querySelector('.bt-face');
    if (f) f.innerHTML = face(pose);
  }

  function setLevel(el, level) {
    if (!el._bt) return render(el, { level: level });
    el._bt.level = level;
    var s = el.querySelector('.bt-sprout');
    if (s) s.innerHTML = SPROUTS[Math.max(0, Math.min(4, level))];
  }

  /* Petit saut au toucher. */
  function hop(el) {
    el.classList.remove('bt-hop');
    void el.offsetWidth;
    el.classList.add('bt-hop');
  }

  window.Boutou = { render: render, setPose: setPose, setLevel: setLevel, hop: hop, poses: Object.keys(POSES) };
})();
