// Service worker for install support, offline fallback, and lightweight
// compatibility/presentation patches applied to the current single-file app.
const CACHE_NAME = 'points-shell-v6';
const SHELL_FILES = ['./', './index.html', './manifest.json'];

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
    '<p>12 points, each connected to a feeling or state. Choose what feels closest today.</p>',
  );
  html = html.replace(
    '<div class="eyebrow">Select a point</div>',
    '<div class="eyebrow">What are you carrying today?</div>\n    <div class="figure-guide">Tap a point on the body or choose below.</div>',
  );

  html = html.replace(
    '.figure-wrap .eyebrow{margin-bottom:14px;}',
    `.figure-wrap .eyebrow{margin-bottom:6px;}
  .figure-guide{
    margin-bottom:14px;
    color:var(--ink-faint);
    font-size:12px;
    line-height:1.45;
    text-align:center;
  }`,
  );

  // Calm the default point animation and make selection feel more intentional.
  html = html.replace(
    'opacity:0.18;\n    animation:pulse 3.6s ease-in-out infinite;',
    'opacity:0.13;\n    animation:pulse 5.2s ease-in-out infinite;',
  );
  html = html.replace(
    'box-shadow:0 1px 3px rgba(43,42,38,0.2);\n  }',
    'box-shadow:0 1px 3px rgba(43,42,38,0.2);\n    transition:background .2s ease, transform .2s ease;\n  }',
  );
  html = html.replace(
    `.point.active .halo{
    background:var(--sage);
    opacity:0.24;
  }`,
    `.point.active .halo{
    background:var(--sage);
    opacity:0.26;
  }
  .point.active .core{ transform:scale(1.16); }`,
  );
  html = html.replace(
    '0%,100%{ transform:scale(1); opacity:0.18; }\n    50%{ transform:scale(1.35); opacity:0.05; }',
    '0%,100%{ transform:scale(1); opacity:0.13; }\n    50%{ transform:scale(1.18); opacity:0.07; }',
  );

  // Clean up session-panel hierarchy and remove the repeated category label.
  html = html.replace(
    '.panel .why{',
    `.why-label{
    margin:2px 0 7px;
    color:var(--ink-faint);
    font-size:10.5px;
    font-weight:700;
    letter-spacing:0.12em;
    text-transform:uppercase;
  }
  .panel .why{`,
  );
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

  // Make the reflection feel observational rather than outcome-seeking.
  html = html.replace(
    '<div class="eyebrow" style="margin-bottom:10px;">How do you feel?</div>',
    '<div class="eyebrow" style="margin-bottom:10px;">What changed?</div>',
  );
  html = html.replace(
    `  "Something has shifted, even quietly."\n`,
    '',
  );
  html = html.replace(
    `  "Well held.",\n];`,
    `  "Well held."\n];`,
  );

  // Turn the history card into a quieter record of practice.
  html = html.replace('<h3>Recent sessions</h3>', '<h3>Recent practice</h3>');
  html = html.replace(
    'No sessions yet — choose a point above to begin.',
    'Your practice will gather here over time.',
  );
  html = html.replace(
    `.section-card{
    background:var(--paper);
    border-radius:16px;
    box-shadow:var(--shadow);
    padding:22px 22px;
  }`,
    `.section-card{
    background:transparent;
    border-radius:0;
    box-shadow:none;
    border-top:1px solid var(--line);
    padding:22px 4px 0;
  }`,
  );
  html = html.replace(
    `.section-card h3{
    font-family:'Fraunces',serif;
    font-style:italic;
    font-weight:500;
    font-size:19px;
    color:var(--sage-deep);
    margin:2px 0 14px;
  }`,
    `.section-card h3{
    font-family:'Inter',sans-serif;
    font-style:normal;
    font-weight:700;
    font-size:10.5px;
    letter-spacing:0.13em;
    text-transform:uppercase;
    color:var(--ink-faint);
    margin:2px 0 12px;
  }`,
  );
  html = html.replace(
    `.history-item{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:10px 0;
    border-bottom:1px solid var(--line);
    font-size:13.5px;
  }`,
    `.history-item{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:16px;
    padding:13px 0;
    border-bottom:1px solid var(--line);
    font-size:13.5px;
  }
  .history-copy{display:flex; flex-direction:column; gap:3px; min-width:0;}
  .history-feeling{font-weight:600; color:var(--ink); line-height:1.35;}
  .history-point{font-family:'Fraunces',serif; font-style:italic; color:var(--ink-soft); font-size:13px;}
  .history-mood{color:var(--brass); font-size:11.5px; font-weight:600;}`,
  );
  html = html.replace(
    `const MOOD_LABELS = { lighter: 'Lighter', same: 'Same', heavier: 'Heavier' };`,
    `const MOOD_LABELS = { lighter: 'Lighter', same: 'About the same', heavier: 'Heavier' };`,
  );
  html = html.replace(
    "    const moodTag = item.mood ? ` · ${MOOD_LABELS[item.mood] || item.mood}` : '';\n    return `<div class=\"history-item\"><span class=\"h-name\">${item.label}${moodTag}</span><span class=\"h-date\">${dateStr}</span></div>`;",
    "    const parts = item.label.split(' · ');\n    const pointName = parts.shift() || item.label;\n    const feeling = parts.join(' · ') || 'Practice';\n    const mood = item.mood ? (MOOD_LABELS[item.mood] || item.mood) : '';\n    return `<div class=\"history-item\"><div class=\"history-copy\"><span class=\"history-feeling\">${feeling}</span><span class=\"history-point\">${pointName}</span>${mood ? `<span class=\"history-mood\">${mood}</span>` : ''}</div><span class=\"h-date\">${dateStr}</span></div>`;",
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