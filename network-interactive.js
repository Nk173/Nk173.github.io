/* Interactive network graphic for the home hero.
   Each node is an icon "chip" for one of my themes and a phase oscillator
   (Kuramoto model). Chips drift slowly in different directions; coupling along
   edges pulls their pulses into synchrony, and the web brightens / turns green
   as global synchrony rises — interdependence emerging from independent motion.
   Hover a chip to see its label. Every theme appears at most once. */
(function () {
  const canvas = document.getElementById('hero-network');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1, last = 0;
  const nodes = [];
  const mouse = { x: null, y: null, active: false };
  let spotIdx = 0, spotTimer = 0, spotEvery = 3;   // auto-highlight cycle

  // ── glyph drawing (line art, centred at x,y, scaled by s) ──
  function gWelfare(x, y, s) {            // heart — welfare policy
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.32);
    ctx.bezierCurveTo(x - s, y - s * 0.45, x - s * 0.5, y - s, x, y - s * 0.42);
    ctx.bezierCurveTo(x + s * 0.5, y - s, x + s, y - s * 0.45, x, y + s * 0.32);
    ctx.stroke();
  }
  function gClimate(x, y, s) {            // leaf — climate science
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y + s * 0.6);
    ctx.quadraticCurveTo(x - s * 0.7, y - s * 0.7, x + s * 0.6, y - s * 0.6);
    ctx.quadraticCurveTo(x - s * 0.1, y - s * 0.05, x - s * 0.6, y + s * 0.6);
    ctx.moveTo(x - s * 0.6, y + s * 0.6);
    ctx.lineTo(x + s * 0.35, y - s * 0.35);
    ctx.stroke();
  }
  function gTrade(x, y, s) {              // globe — global trade
    const r = s * 0.72;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.42, r, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
  }
  function gEconomy(x, y, s) {            // bar chart — economy
    const b = s * 0.6;
    ctx.beginPath(); ctx.moveTo(x - b, y + b); ctx.lineTo(x + b, y + b); ctx.stroke();
    const xs = [-b * 0.7, 0, b * 0.7], hs = [0.5, 0.95, 1.4];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x + xs[i], y + b); ctx.lineTo(x + xs[i], y + b - b * hs[i]); ctx.stroke();
    }
  }
  function gML(x, y, s) {                 // neural net — machine learning
    const L = [[-0.55, -0.45], [-0.55, 0.45]];
    const R = [[0.55, -0.55], [0.55, 0], [0.55, 0.55]];
    ctx.lineWidth = 1.1;
    for (const a of L) for (const b of R) {
      ctx.beginPath(); ctx.moveTo(x + a[0] * s, y + a[1] * s); ctx.lineTo(x + b[0] * s, y + b[1] * s); ctx.stroke();
    }
    ctx.lineWidth = 1.7;
    for (const p of L.concat(R)) { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, s * 0.13, 0, Math.PI * 2); ctx.fill(); }
  }
  function gHouse(x, y, s) {              // house — household finance
    ctx.beginPath();
    ctx.moveTo(x - s * 0.55, y - s * 0.05); ctx.lineTo(x, y - s * 0.6); ctx.lineTo(x + s * 0.55, y - s * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.rect(x - s * 0.42, y - s * 0.05, s * 0.84, s * 0.6); ctx.stroke();
  }
  function gGear(x, y, s) {               // gear — financial systems design
    const ri = s * 0.46, teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ri, y + Math.sin(a) * ri); ctx.lineTo(x + Math.cos(a) * s * 0.92, y + Math.sin(a) * s * 0.92); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, ri, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, s * 0.22, 0, Math.PI * 2); ctx.stroke();
  }
  function gSprout(x, y, s) {             // sprout — financing social impact
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.7); ctx.lineTo(x, y - s * 0.15); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.02);
    ctx.quadraticCurveTo(x - s * 0.75, y - s * 0.2, x - s * 0.62, y - s * 0.72);
    ctx.quadraticCurveTo(x - s * 0.18, y - s * 0.5, x, y - s * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.2);
    ctx.quadraticCurveTo(x + s * 0.75, y - s * 0.38, x + s * 0.62, y - s * 0.9);
    ctx.quadraticCurveTo(x + s * 0.18, y - s * 0.62, x, y - s * 0.2);
    ctx.stroke();
  }
  function gCoins(x, y, s) {              // coin stack — microfinance
    const rx = s * 0.58, ry = s * 0.22, off = s * 0.34;
    ctx.beginPath(); ctx.moveTo(x - rx, y + s * 0.2); ctx.lineTo(x - rx, y + s * 0.2 - off); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + rx, y + s * 0.2); ctx.lineTo(x + rx, y + s * 0.2 - off); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.2, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + s * 0.2 - off, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  }
  function gEmergence(x, y, s) {          // dot cluster — emergence
    const pts = [[-0.5, -0.3], [0.12, -0.58], [0.55, -0.08], [-0.32, 0.42], [0.38, 0.5], [-0.02, 0.05]];
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      if (Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) < 0.8) {
        ctx.beginPath(); ctx.moveTo(x + pts[i][0] * s, y + pts[i][1] * s); ctx.lineTo(x + pts[j][0] * s, y + pts[j][1] * s); ctx.stroke();
      }
    }
    for (const p of pts) { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, s * 0.12, 0, Math.PI * 2); ctx.fill(); }
  }
  function gUrban(x, y, s) {              // skyline — urbanisation
    const base = y + s * 0.62;
    ctx.beginPath(); ctx.moveTo(x - s * 0.72, base); ctx.lineTo(x + s * 0.72, base); ctx.stroke();
    const bld = [[-0.62, 0.7, 0.34], [-0.16, 1.15, 0.34], [0.34, 0.92, 0.42]];
    for (const b of bld) { const w = b[2] * s, h = b[1] * s, cx = x + b[0] * s; ctx.beginPath(); ctx.rect(cx - w / 2, base - h, w, h); ctx.stroke(); }
  }
  function gShield(x, y, s) {             // shield + keyhole — data protection
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.78);
    ctx.lineTo(x + s * 0.6, y - s * 0.45);
    ctx.lineTo(x + s * 0.6, y + s * 0.08);
    ctx.quadraticCurveTo(x + s * 0.55, y + s * 0.6, x, y + s * 0.82);
    ctx.quadraticCurveTo(x - s * 0.55, y + s * 0.6, x - s * 0.6, y + s * 0.08);
    ctx.lineTo(x - s * 0.6, y - s * 0.45);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - s * 0.02, s * 0.15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + s * 0.08); ctx.lineTo(x, y + s * 0.34); ctx.stroke();
  }
  function gInequality(x, y, s) {         // tilted balance — inequality
    const ty = s * 0.35;
    const x1 = x - s * 0.62, y1 = y - ty - s * 0.12;
    const x2 = x + s * 0.62, y2 = y + ty - s * 0.12;
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.12); ctx.lineTo(x, y + s * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - s * 0.4, y + s * 0.6); ctx.lineTo(x + s * 0.4, y + s * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 + s * 0.22); ctx.stroke();
    ctx.beginPath(); ctx.arc(x1, y1 + s * 0.3, s * 0.18, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2, y2 + s * 0.22); ctx.stroke();
    ctx.beginPath(); ctx.arc(x2, y2 + s * 0.3, s * 0.18, 0, Math.PI); ctx.stroke();
  }
  function gClock(x, y, s) {              // clock — pensions
    ctx.beginPath(); ctx.arc(x, y, s * 0.72, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s * 0.34, y + s * 0.12); ctx.stroke();
  }
  function gStatPhys(x, y, s) {           // Gaussian curve — statistical physics
    const w = s * 0.82, base = y + s * 0.5;
    ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x + w, base); ctx.stroke();
    ctx.beginPath();
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 - 1;
      const px = x + t * w;
      const py = base - Math.exp(-(t * t) / (2 * 0.16)) * s * 0.95;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  function gNetwork(x, y, s) {            // node-link triad — networks
    const p = [[0, -0.62], [-0.6, 0.45], [0.6, 0.45]];
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      ctx.beginPath(); ctx.moveTo(x + p[i][0] * s, y + p[i][1] * s); ctx.lineTo(x + p[j][0] * s, y + p[j][1] * s); ctx.stroke();
    }
    ctx.lineWidth = 1.7;
    for (const q of p) { ctx.beginPath(); ctx.arc(x + q[0] * s, y + q[1] * s, s * 0.18, 0, Math.PI * 2); ctx.fill(); }
  }
  function gComplexity(x, y, s) {         // spiral — complexity
    ctx.beginPath();
    const turns = 2.4, N = 64;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * turns * Math.PI * 2;
      const rr = (i / N) * s * 0.8;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  function gEmissions(x, y, s) {          // smokestack + smoke — emissions
    ctx.beginPath();
    ctx.moveTo(x - 0.12 * s, y + 0.6 * s); ctx.lineTo(x - 0.02 * s, y - 0.18 * s);
    ctx.lineTo(x + 0.38 * s, y - 0.18 * s); ctx.lineTo(x + 0.48 * s, y + 0.6 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 0.5 * s, y + 0.6 * s); ctx.lineTo(x + 0.72 * s, y + 0.6 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 0.05 * s, y - 0.42 * s, 0.18 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 0.22 * s, y - 0.6 * s, 0.14 * s, 0, Math.PI * 2); ctx.stroke();
  }
  function gSupplyChain(x, y, s) {        // linked boxes — supply chain
    const bw = 0.34 * s, cx = [-0.6, 0, 0.6];
    for (const xx of cx) { ctx.beginPath(); ctx.rect(x + xx * s - bw / 2, y - bw / 2, bw, bw); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 0.6 * s + bw / 2, y); ctx.lineTo(x - bw / 2, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + bw / 2, y); ctx.lineTo(x + 0.6 * s - bw / 2, y); ctx.stroke();
  }
  function gMatrix(x, y, s) {             // presence matrix — economic complexity
    const cell = 0.42 * s, x0 = x - 0.63 * s, y0 = y - 0.63 * s;
    const fill = [[1, 0, 1], [0, 1, 1], [1, 1, 0]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const cx = x0 + c * cell, cy = y0 + r * cell;
      ctx.beginPath(); ctx.rect(cx, cy, cell * 0.78, cell * 0.78);
      if (fill[r][c]) ctx.fill(); else ctx.stroke();
    }
  }
  function gBipartite(x, y, s) {          // two layers + cross edges — bipartite graphs
    const top = [[-0.5, -0.6], [0, -0.6], [0.5, -0.6]];
    const bot = [[-0.5, 0.6], [0, 0.6], [0.5, 0.6]];
    ctx.lineWidth = 1.1;
    for (const [a, b] of [[0, 1], [1, 0], [1, 2], [2, 1]]) {
      ctx.beginPath(); ctx.moveTo(x + top[a][0] * s, y + top[a][1] * s); ctx.lineTo(x + bot[b][0] * s, y + bot[b][1] * s); ctx.stroke();
    }
    ctx.lineWidth = 1.6;
    for (const p of top.concat(bot)) { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, 0.13 * s, 0, Math.PI * 2); ctx.fill(); }
  }
  function gContagion(x, y, s) {          // spreading node — contagion models
    ctx.beginPath(); ctx.arc(x, y, 0.2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.2;
    for (const p of [[-0.6, -0.45], [0.6, -0.4], [0.55, 0.5], [-0.5, 0.55]]) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + p[0] * s, y + p[1] * s); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, 0.12 * s, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function gMagnifier(x, y, s) {          // lens + check — impact evaluations
    ctx.beginPath(); ctx.arc(x - 0.1 * s, y - 0.1 * s, 0.45 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 0.22 * s, y + 0.22 * s); ctx.lineTo(x + 0.62 * s, y + 0.62 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 0.32 * s, y - 0.12 * s); ctx.lineTo(x - 0.14 * s, y + 0.06 * s); ctx.lineTo(x + 0.12 * s, y - 0.3 * s); ctx.stroke();
  }
  function gGauge(x, y, s) {              // risk dial — credit risk models
    ctx.beginPath(); ctx.arc(x, y + 0.22 * s, 0.62 * s, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + 0.22 * s); ctx.lineTo(x + 0.38 * s, y - 0.18 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y + 0.22 * s, 0.07 * s, 0, Math.PI * 2); ctx.fill();
  }
  function gAvalanche(x, y, s) {          // sandpile slope + grains — avalanches & criticality
    ctx.beginPath(); ctx.moveTo(x - 0.6 * s, y - 0.5 * s); ctx.lineTo(x + 0.62 * s, y + 0.55 * s); ctx.lineTo(x - 0.6 * s, y + 0.55 * s); ctx.closePath(); ctx.stroke();
    for (const p of [[-0.05, -0.02], [0.18, 0.16], [0.4, 0.34]]) { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, 0.09 * s, 0, Math.PI * 2); ctx.fill(); }
  }
  function gLock(x, y, s) {               // padlock — privacy-preserving fintech
    ctx.beginPath(); ctx.rect(x - 0.42 * s, y - 0.05 * s, 0.84 * s, 0.6 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - 0.05 * s, 0.27 * s, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y + 0.22 * s, 0.08 * s, 0, Math.PI * 2); ctx.fill();
  }
  function gTransport(x, y, s) {          // crossing lines + stations — transport networks
    ctx.beginPath(); ctx.moveTo(x - 0.62 * s, y - 0.32 * s); ctx.lineTo(x + 0.62 * s, y + 0.32 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 0.62 * s, y + 0.42 * s); ctx.lineTo(x + 0.62 * s, y - 0.42 * s); ctx.stroke();
    for (const p of [[-0.62, -0.32], [0, 0], [0.62, 0.32], [-0.62, 0.42], [0.62, -0.42]]) { ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, 0.1 * s, 0, Math.PI * 2); ctx.fill(); }
  }
  function gUmbrella(x, y, s) {           // umbrella — catastrophic risk insurance
    ctx.beginPath(); ctx.arc(x, y - 0.05 * s, 0.6 * s, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 0.05 * s); ctx.lineTo(x, y + 0.55 * s); ctx.quadraticCurveTo(x, y + 0.72 * s, x - 0.2 * s, y + 0.62 * s); ctx.stroke();
  }
  function gPulse(x, y, s) {              // ECG line — health systems design
    ctx.beginPath();
    ctx.moveTo(x - 0.65 * s, y); ctx.lineTo(x - 0.3 * s, y);
    ctx.lineTo(x - 0.12 * s, y - 0.45 * s); ctx.lineTo(x + 0.06 * s, y + 0.45 * s);
    ctx.lineTo(x + 0.24 * s, y); ctx.lineTo(x + 0.65 * s, y);
    ctx.stroke();
  }

  const TYPES = [
    { name: 'Welfare policy',             color: '#d2a8ff', draw: gWelfare },
    { name: 'Emissions',                  color: '#c0c8d0', draw: gEmissions },
    { name: 'Supply chain',               color: '#58a6ff', draw: gSupplyChain },
    { name: 'Economic complexity',        color: '#ffd24d', draw: gMatrix },
    { name: 'Graph neural networks',      color: '#f778ba', draw: gML },
    { name: 'Household finance',          color: '#56d4dd', draw: gHouse },
    { name: 'Financial systems design',   color: '#a5d6ff', draw: gGear },
    { name: 'Financing social impact',    color: '#56d364', draw: gSprout },
    { name: 'Microfinance',               color: '#e3b341', draw: gCoins },
    { name: 'Emergence',                  color: '#ff7b72', draw: gEmergence },
    { name: 'Urbanisation',               color: '#39c5cf', draw: gUrban },
    { name: 'Data protection',            color: '#bc8cff', draw: gShield },
    { name: 'Inequality',                 color: '#ffb454', draw: gInequality },
    { name: 'Pensions',                   color: '#79e0c0', draw: gClock },
    { name: 'Statistical physics',        color: '#ffd6a5', draw: gStatPhys },
    { name: 'Bipartite graphs',           color: '#9ad1ff', draw: gBipartite },
    { name: 'Contagion models',           color: '#ff8fa3', draw: gContagion },
    { name: 'Impact evaluations',         color: '#7ee787', draw: gMagnifier },
    { name: 'Credit risk models',         color: '#f0883e', draw: gGauge },
    { name: 'Avalanches & criticality',   color: '#8dd0ff', draw: gAvalanche },
    { name: 'Privacy-preserving fintech', color: '#a5b4ff', draw: gLock },
    { name: 'Transport networks',         color: '#6cc98f', draw: gTransport },
    { name: 'Catastrophic risk insurance', color: '#ff9b72', draw: gUmbrella },
    { name: 'Health systems design',      color: '#7ee7c7', draw: gPulse }
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init() {
    resize();
    nodes.length = 0;
    const idx = TYPES.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    idx.forEach(ti => {                       // show ALL themes
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        r: 14 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        omega: 1.3 + (Math.random() - 0.5) * 1.1,  // intrinsic frequency (rad/s)
        t: TYPES[ti]
      });
    });
  }

  const LINK = 165;        // distance for edges / coupling
  const K = 6.0;           // coupling strength (higher = faster synchrony)
  const COH = 0.34;        // cohesion toward the moving target (lower = looser cluster)
  const SEP = 1300;        // short-range separation between chips
  const WANDER = 200;      // random drift
  const MAXV = 95;         // max speed (px/s)
  const GAP = 16;          // extra spacing kept between chips

  function hexRGB(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    ctx.clearRect(0, 0, W, H);

    // ── pass 1: edges, coupling accumulation, separation ──
    const edges = [];
    for (const n of nodes) { n._c = 0; n._nb = 0; n._fx = 0; n._fy = 0; }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          edges.push([a, b, d]);
          const diff = Math.sin(b.phase - a.phase);
          a._c += diff; b._c -= diff; a._nb++; b._nb++;
        }
        const minD = a.r + b.r + GAP;
        if (d < minD && d > 0.01) {
          const f = (minD - d) / minD;
          a._fx += (dx / d) * f; a._fy += (dy / d) * f;
          b._fx -= (dx / d) * f; b._fy -= (dy / d) * f;
        }
      }
    }

    // ── global synchrony (order parameter R ∈ [0,1]) ──
    let sc = 0, ss = 0;
    for (const n of nodes) { sc += Math.cos(n.phase); ss += Math.sin(n.phase); }
    const R = nodes.length ? Math.hypot(sc, ss) / nodes.length : 0;

    // edge colour shifts blue → green as synchrony rises
    const eBlue = [110, 168, 254], eGreen = [126, 231, 135];
    const er = lerp(eBlue[0], eGreen[0], R), eg = lerp(eBlue[1], eGreen[1], R), eb = lerp(eBlue[2], eGreen[2], R);

    // slowly-wandering target the whole cluster follows (keeps it moving)
    const T = now / 1000;
    const tx = W * (0.5 + 0.46 * Math.sin(T * 0.19) * Math.cos(T * 0.08));
    const ty = H * (0.5 + 0.44 * Math.sin(T * 0.26 + 1.3));

    // ── update phase + position ──
    for (const n of nodes) {
      const coup = n._nb ? n._c / n._nb : 0;
      n.phase += (n.omega + K * coup) * dt;

      // accel = cohesion to moving target + separation + wander
      const ax = (tx - n.x) * COH + n._fx * SEP + (Math.random() - 0.5) * WANDER;
      const ay = (ty - n.y) * COH + n._fy * SEP + (Math.random() - 0.5) * WANDER;
      n.vx += ax * dt; n.vy += ay * dt;
      n.vx *= 0.95; n.vy *= 0.95;
      const sp = Math.hypot(n.vx, n.vy);
      if (sp > MAXV) { n.vx = (n.vx / sp) * MAXV; n.vy = (n.vy / sp) * MAXV; }
      n.x += n.vx * dt; n.y += n.vy * dt;
      n.x = Math.max(n.r, Math.min(W - n.r, n.x));
      n.y = Math.max(n.r, Math.min(H - n.r, n.y));
    }

    // ── draw edges (brighter where endpoints are in phase) ──
    for (const [a, b, d] of edges) {
      const inPhase = (1 + Math.cos(a.phase - b.phase)) / 2;
      const prox = 1 - d / LINK;
      const alpha = prox * (0.22 + 0.5 * inPhase);
      ctx.strokeStyle = `rgba(${er | 0},${eg | 0},${eb | 0},${alpha})`;
      ctx.lineWidth = 0.8 + 2.2 * prox * (0.4 + 0.6 * inPhase);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // hovered chip (label only — no force)
    let hovered = null;
    if (mouse.active) {
      for (const n of nodes) { if (Math.hypot(n.x - mouse.x, n.y - mouse.y) < n.r + 4) { hovered = n; break; } }
    }

    // auto-spotlight: cycle a label onto each chip every 2–4 s
    spotTimer += dt;
    if (spotTimer >= spotEvery) { spotTimer = 0; spotEvery = 2 + Math.random() * 2; spotIdx = (spotIdx + 1) % nodes.length; }
    if (spotIdx >= nodes.length) spotIdx = 0;
    const active = hovered || nodes[spotIdx];
    let labelAlpha = 1;
    if (!hovered) {
      const tn = spotTimer / spotEvery;               // fade in / hold / fade out
      labelAlpha = Math.max(0, Math.min(1, Math.min(tn / 0.18, (1 - tn) / 0.18)));
    }

    // ── draw chips: pulsing halo → disc → ring → glyph ──
    for (const n of nodes) {
      const pulse = (1 + Math.sin(n.phase)) / 2;          // 0..1
      const [cr, cg, cb] = hexRGB(n.t.color);

      // synchrony-aware halo (stronger pulse when synced)
      const haloA = pulse * (0.18 + 0.45 * R);
      if (haloA > 0.02) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 2 + pulse * 9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${haloA})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const hi = (n === active) ? (hovered ? 1 : labelAlpha) : 0;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13,17,23,0.85)'; ctx.fill();
      if (hi > 0.02) { ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.22 * hi})`; ctx.fill(); }
      ctx.lineWidth = 1.8 + 1.0 * hi;
      ctx.strokeStyle = n.t.color;
      ctx.stroke();

      ctx.strokeStyle = n.t.color; ctx.fillStyle = n.t.color;
      ctx.lineWidth = 1.7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      n.t.draw(n.x, n.y, n.r * 0.55);
    }

    if (active && labelAlpha > 0.01) {
      ctx.font = "600 13px 'Computer Modern Sans', -apple-system, Segoe UI, sans-serif";
      const tw = ctx.measureText(active.t.name).width;
      const lx = Math.min(active.x + active.r + 8, W - tw - 14);
      const ly = active.y, pad = 7;
      ctx.fillStyle = `rgba(13,17,23,${0.92 * labelAlpha})`;
      const cn = parseInt(active.t.color.slice(1), 16);
      ctx.strokeStyle = `rgba(${(cn >> 16) & 255},${(cn >> 8) & 255},${cn & 255},${0.6 * labelAlpha})`;
      ctx.lineWidth = 1;
      roundRect(lx - pad, ly - 12, tw + pad * 2, 24, 6);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = `rgba(230,237,243,${labelAlpha})`; ctx.textBaseline = 'middle';
      ctx.fillText(active.t.name, lx, ly + 1);
    }

    requestAnimationFrame(frame);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function setMouse(cx, cy) { const r = canvas.getBoundingClientRect(); mouse.x = cx - r.left; mouse.y = cy - r.top; mouse.active = true; }
  canvas.addEventListener('mousemove', e => setMouse(e.clientX, e.clientY));
  canvas.addEventListener('mouseleave', () => { mouse.active = false; });
  canvas.addEventListener('touchmove', e => { if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  canvas.addEventListener('touchend', () => { mouse.active = false; });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(init, 150); });

  init();
  requestAnimationFrame(frame);
})();
