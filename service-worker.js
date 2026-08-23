// Service worker for install support, offline fallback, and lightweight
// compatibility/presentation patches applied to the current single-file app.
const CACHE_NAME = 'points-shell-v4';
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

  // Add a quiet helper line beneath the new question.
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

  // Keep the overall session drawer following the newest revealed passage.
  // The script box already scrolls internally; this also moves the drawer so
  // that box stays comfortably visible on mobile as the session advances.
  html = html.replace(
    `state.boxEl.scrollTo({ top: state.boxEl.scrollHeight, behavior: 'smooth' });`,
    `state.boxEl.scrollTo({ top: state.boxEl.scrollHeight, behavior: 'smooth' });
  requestAnimationFrame(() => {
    const targetTop = Math.max(0, state.boxEl.offsetTop - 110);
    panel.scrollTo({ top: targetTop, behavior: 'smooth' });
  });`,
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