// Service worker for install support, offline fallback, and lightweight
// compatibility/presentation patches applied to the current single-file app.
const CACHE_NAME = 'points-shell-v14';
const SHELL_FILES = ['./', './index.html', './manifest.json', './session-copy.js?v=14', './experience-v13.js?v=14'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function polishHtml(input) {
  let html = input;

  // Keep Shén Mén on the standard paced text session rather than a removed track.
  html = html.replace('audio:"audio/shenmen.mp3",', '');

  // Give first-time users a simple orientation before asking them to interact.
  html = html.replace(
    "<p>Each point on the map holds a session — settle in, choose what you're carrying today, and let the point guide the focus.</p>",
    '<p>Eleven points, each connected to a feeling or state. Choose what feels closest today.</p>',
  );
  html = html.replace(
    '<div class="eyebrow">Select a point</div>',
    '<div class="eyebrow">What are you carrying today?</div>\n    <div class="figure-guide">Tap a point on the body.</div>',
  );
  html = html.replace(
    '<div class="point-index" id="pointIndex"></div>',
    '<div class="feeling-index-label">Or choose by feeling</div>\n    <div class="point-index" id="pointIndex"></div>',
  );

  // Let map labels show the feeling plus the point name.
  html = html.replace(
    '<div class="point-label">${p.category}</div>',
    '<div class="point-label"><span>${p.category}</span><em>${p.name}</em></div>',
  );

  // Render the feeling index as a complete single-column practice list.
  html = html.replace(
    `  chip.className = 'chip';
  chip.textContent = p.category;
  chip.dataset.id = p.id;`,
    `  chip.className = 'chip';
  chip.innerHTML = '<span class="chip-mark" aria-hidden="true"></span><span class="chip-copy"><span class="chip-feeling">' + p.category + '</span><span class="chip-meta"><span class="chip-point">' + p.name + '</span><span class="chip-sub">' + p.sub + '</span></span></span>';
  chip.dataset.id = p.id;`,
  );

  // Clean up session-panel hierarchy and remove the repeated category label.
  html = html.replace(
    '<div class="why" id="panelWhy"></div>',
    '<div class="why-label">Why this point</div>\n    <div class="why" id="panelWhy"></div>',
  );
  html = html.replace(
    `document.getElementById('panelPointIdx').textContent = "POINT · " + currentPoint.category.toUpperCase();`,
    `document.getElementById('panelPointIdx').textContent = currentPoint.category.toUpperCase();`,
  );
  html = html.replace(
    `document.getElementById('panelPointName').textContent = currentPoint.name + " · " + currentPoint.sub;`,
    `document.getElementById('panelPointName').textContent = currentPoint.name;`,
  );
  html = html.replace(
    `document.getElementById('panelMeridian').textContent = currentPoint.category;`,
    `document.getElementById('panelMeridian').textContent = currentPoint.sub;`,
  );

  // Make the practice controls feel less like utility UI.
  html = html.replace(
    '<div class="eyebrow" style="margin-bottom:8px;">Session length</div>',
    '<div class="eyebrow" style="margin-bottom:8px;">Choose your pace</div>',
  );
  html = html.replace(
    '<button class="length-chip" data-length="short">Short<span>~2 min</span></button>\n    <button class="length-chip active" data-length="medium">Medium<span>~4 min</span></button>\n    <button class="length-chip" data-length="long">Long<span>~7 min</span></button>',
    '<button class="length-chip" data-length="short">2 min<span>Brief</span></button>\n    <button class="length-chip active" data-length="medium">4 min<span>Steady</span></button>\n    <button class="length-chip" data-length="long">7 min<span>Unhurried</span></button>',
  );
  html = html.replace('>Begin session</button>', '>Begin practice</button>');

  // Keep the hypnosis flow uninterrupted. A single chime marks completion only.
  html = html.replace(
    'A soft chime marks each new passage',
    'A soft chime marks the end of the session',
  );
  html = html.replace(
    `  chime();
  const p = document.createElement('p');`,
    `  const p = document.createElement('p');`,
  );
  html = html.replace(
    `    stopBreathingLoop();
    showReflection();
    return;`,
    `    stopBreathingLoop();
    chime();
    showReflection();
    return;`,
  );
  html = html.replace(
    `  stopBreathingLoop();
  showReflection();
});`,
    `  stopBreathingLoop();
  chime();
  showReflection();
});`,
  );

  // Replace mechanical line counts with softer progress language.
  html = html.replace(
    'state.statusEl.textContent = `Line ${state.index + 1} of ${state.paragraphs.length}`;',
    `const progress = state.index / Math.max(1, state.paragraphs.length - 1);
  state.statusEl.textContent = progress < 0.22
    ? 'Beginning…'
    : progress < 0.62
      ? 'Settling in…'
      : progress < 0.88
        ? 'Take your time…'
        : 'Stay with this…';`,
  );

  // Keep the overall session drawer following the newest revealed passage.
  html = html.replace(
    `state.boxEl.scrollTo({ top: state.boxEl.scrollHeight, behavior: 'smooth' });`,
    `state.boxEl.scrollTo({ top: state.boxEl.scrollHeight, behavior: 'smooth' });
  requestAnimationFrame(() => {
    const targetTop = Math.max(0, state.boxEl.offsetTop - 110);
    panel.scrollTo({ top: targetTop, behavior: 'smooth' });
  });`,
  );

  // Make the reflection observational rather than outcome-seeking.
  html = html.replace(
    '<div class="eyebrow" style="margin-bottom:10px;">How do you feel?</div>',
    '<div class="eyebrow" style="margin-bottom:10px;">What changed?</div>',
  );
  html = html.replace('  "Something has shifted, even quietly."\n', '');
  html = html.replace('  "Well held.",\n];', '  "Well held."\n];');

  // Turn the history card into a quieter record of practice.
  html = html.replace('<h3>Recent sessions</h3>', '<h3>Recent practice</h3>');
  html = html.replaceAll(
    'No sessions yet — choose a point above to begin.',
    'Your practice will gather here over time.',
  );
  html = html.replace(
    `const MOOD_LABELS = { lighter: 'Lighter', same: 'Same', heavier: 'Heavier' };`,
    `const MOOD_LABELS = { lighter: 'Lighter', same: 'About the same', heavier: 'Heavier' };`,
  );
  html = html.replace(
    "    const moodTag = item.mood ? ` · ${MOOD_LABELS[item.mood] || item.mood}` : '';\n    return `<div class=\"history-item\"><span class=\"h-name\">${item.label}${moodTag}</span><span class=\"h-date\">${dateStr}</span></div>`;",
    "    const parts = item.label.split(' · ');\n    const pointName = parts.shift() || item.label;\n    const feeling = parts.join(' · ') || 'Practice';\n    const mood = item.mood ? (MOOD_LABELS[item.mood] || item.mood) : '';\n    return `<div class=\"history-item\"><div class=\"history-copy\"><span class=\"history-feeling\">${feeling}</span><span class=\"history-point\">${pointName}</span>${mood ? `<span class=\"history-mood\">${mood}</span>` : ''}</div><span class=\"h-date\">${dateStr}</span></div>`;",
  );

  // Load the writing and final session-behavior layer after the app defines POINTS.
  html = html.replace(
    '</body>',
    '<script src="./session-copy.js?v=14"></script>\n<script src="./experience-v13.js?v=14"></script>\n</body>',
  );

  // Add final visual overrides in one place so the raw app remains easy to maintain.
  html = html.replace(
    '</style>',
    `
  /* ---------- Points presentation polish ---------- */
  header{
    max-width:660px;
    margin:0 auto;
    padding:48px 24px 24px;
  }
  header .eyebrow{
    color:var(--brass);
    font-size:10px;
    font-weight:700;
    letter-spacing:.18em;
  }
  header h1{
    font-size:clamp(46px,9vw,68px);
    line-height:.98;
    letter-spacing:-.035em;
    margin:11px 0 15px;
  }
  header p{
    max-width:500px;
    font-size:14.5px;
    line-height:1.65;
  }
  .app{
    max-width:760px;
    padding-top:8px;
    gap:24px;
  }
  .figure-wrap{
    background:rgba(255,255,255,.72);
    border:1px solid var(--line);
    border-radius:18px;
    box-shadow:none;
    padding:30px 28px 26px;
  }
  .figure-wrap > .eyebrow{
    margin-bottom:5px;
    font-family:'Fraunces',serif;
    font-size:23px;
    line-height:1.2;
    font-style:italic;
    font-weight:500;
    letter-spacing:-.01em;
    text-transform:none;
    color:var(--sage-deep);
  }
  .figure-guide{
    margin:0 0 18px;
    color:var(--ink-faint);
    font-size:12.5px;
    line-height:1.45;
    text-align:center;
  }
  .figure-frame{
    max-width:324px;
    margin-top:0;
  }
  .point .halo{
    opacity:.13;
    animation:pointsCalmPulse 5.2s ease-in-out infinite;
  }
  @keyframes pointsCalmPulse{
    0%,100%{transform:scale(1);opacity:.13;}
    50%{transform:scale(1.18);opacity:.07;}
  }
  .point .core{transition:background .2s ease,transform .2s ease;}
  .point.active .halo{background:var(--sage);opacity:.26;}
  .point.active .core{transform:scale(1.16);}
  .point-label{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:1px;
    padding:5px 8px 4px;
    border:1px solid rgba(228,223,211,.9);
    box-shadow:0 4px 14px rgba(43,42,38,.07);
  }
  .point-label span{font-size:10.5px;font-weight:600;color:var(--ink);}
  .point-label em{
    font-family:'Fraunces',serif;
    font-size:10.5px;
    font-weight:400;
    color:var(--brass);
  }

  .feeling-index-label{
    width:100%;
    max-width:560px;
    margin:28px auto 8px;
    padding:0 2px;
    color:var(--ink-faint);
    font-size:10.5px;
    font-weight:700;
    letter-spacing:.13em;
    text-transform:uppercase;
    text-align:left;
  }
  .point-index{
    width:100%;
    max-width:560px;
    display:flex;
    flex-direction:column;
    gap:0;
    margin:0 auto;
    padding:0;
    border:1px solid var(--line);
    border-radius:14px;
    overflow:hidden;
    background:rgba(255,255,255,.46);
  }
  .chip{
    width:100%;
    min-width:0;
    min-height:68px;
    display:flex;
    align-items:center;
    justify-content:flex-start;
    gap:12px;
    margin:0;
    padding:13px 16px;
    border:0;
    border-bottom:1px solid var(--line);
    border-radius:0;
    background:transparent;
    color:var(--ink);
    text-align:left;
    transition:background .18s ease;
  }
  .chip:last-child{border-bottom:0;}
  .chip-mark{
    width:6px;
    height:6px;
    flex:0 0 6px;
    border-radius:50%;
    background:var(--brass-soft);
    opacity:.85;
  }
  .chip-copy{
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:4px;
  }
  .chip-feeling{
    font-size:13.5px;
    font-weight:600;
    line-height:1.3;
    color:var(--ink);
  }
  .chip-meta{
    display:flex;
    align-items:baseline;
    flex-wrap:wrap;
    gap:0;
    line-height:1.25;
  }
  .chip-point{
    font-family:'Fraunces',serif;
    font-style:italic;
    font-size:12.5px;
    color:var(--brass);
  }
  .chip-sub{
    font-size:11.5px;
    color:var(--ink-faint);
  }
  .chip-sub::before{
    content:'·';
    margin:0 6px;
    color:var(--line);
  }
  .chip:hover{
    background:rgba(220,227,217,.30);
    border-color:var(--line);
    color:var(--ink);
  }
  .chip.active{
    background:var(--sage-tint);
    border-color:var(--line);
    color:var(--ink);
  }
  .chip.active .chip-mark{background:var(--sage-deep);opacity:1;}
  .chip.active .chip-feeling{color:var(--sage-deep);}
  .chip.active .chip-point{color:var(--sage-deep);}

  .why-label{
    margin:2px 0 7px;
    color:var(--ink-faint);
    font-size:10.5px;
    font-weight:700;
    letter-spacing:.12em;
    text-transform:uppercase;
  }
  .section-card{
    background:transparent;
    border-radius:0;
    box-shadow:none;
    border-top:1px solid var(--line);
    padding:22px 4px 0;
  }
  .section-card h3{
    font-family:'Inter',sans-serif;
    font-style:normal;
    font-weight:700;
    font-size:10.5px;
    letter-spacing:.13em;
    text-transform:uppercase;
    color:var(--ink-faint);
    margin:2px 0 12px;
  }
  .history-item{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:16px;
    padding:13px 0;
    border-bottom:1px solid var(--line);
    font-size:13.5px;
  }
  .history-copy{display:flex;flex-direction:column;gap:3px;min-width:0;}
  .history-feeling{font-weight:600;color:var(--ink);line-height:1.35;}
  .history-point{font-family:'Fraunces',serif;font-style:italic;color:var(--ink-soft);font-size:13px;}
  .history-mood{color:var(--brass);font-size:11.5px;font-weight:600;}

  @media (max-width:520px){
    header{padding:38px 22px 20px;}
    header h1{font-size:52px;}
    header p{font-size:14px;line-height:1.6;}
    .app{padding-left:14px;padding-right:14px;}
    .figure-wrap{padding:26px 16px 22px;}
    .figure-wrap > .eyebrow{font-size:21px;}
    .figure-guide{margin-bottom:16px;}
    .feeling-index-label{margin-top:24px;}
    .point-index{max-width:none;}
    .chip{min-height:70px;padding:13px 14px;}
    .chip-feeling{font-size:13.5px;}
    .chip-point{font-size:12.5px;}
    .chip-sub{font-size:11.5px;}
  }
</style>`,
  );

  return html;
}

async function pageResponse(request) {
  const response = await fetch(request);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  const html = polishHtml(await response.text());
  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(pageResponse(event.request).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});