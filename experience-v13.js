// Points v14 session behavior: stable auto-follow and immersive perimeter breathing.
(() => {
  if (typeof panel === 'undefined' || !panel) return;

  const style = document.createElement('style');
  style.textContent = `
    .panel{
      overflow-anchor:none!important;
      border-color:var(--line)!important;
      box-shadow:
        -14px 0 34px rgba(43,42,38,.08),
        inset 0 0 0 1px rgba(228,223,211,.58),
        inset 0 0 18px rgba(78,93,75,.012)!important;
      transition:
        transform .32s cubic-bezier(.22,.9,.32,1),
        box-shadow var(--breath-duration,4000ms) cubic-bezier(.37,0,.63,1)!important;
    }
    .panel.breath-in{
      box-shadow:
        -20px 0 46px rgba(43,42,38,.10),
        inset 0 0 0 8px rgba(58,70,56,.54),
        inset 0 0 72px rgba(78,93,75,.13)!important;
    }
    .panel.breath-hold{
      box-shadow:
        -20px 0 46px rgba(43,42,38,.10),
        inset 0 0 0 8px rgba(58,70,56,.54),
        inset 0 0 72px rgba(78,93,75,.13)!important;
    }
    .panel.breath-out{
      box-shadow:
        -14px 0 34px rgba(43,42,38,.08),
        inset 0 0 0 2px rgba(228,223,211,.44),
        inset 0 0 30px rgba(78,93,75,.018)!important;
    }
    .panel.breath-in .breath-label,
    .panel.breath-hold .breath-label{color:var(--sage-deep)!important;}
    .panel.breath-out .breath-label{color:var(--ink-faint)!important;}
    .breath-circle{display:none!important;}
    .script-box,
    .script-box *{overflow-anchor:none!important;}
  `;
  document.head.appendChild(style);

  let scrollFrame = null;

  function cancelAutoFollow(){
    if(scrollFrame !== null){
      cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    }
  }

  function followForward(target, duration = 2400){
    cancelAutoFollow();

    const start = panel.scrollTop;
    const max = Math.max(0, panel.scrollHeight - panel.clientHeight);
    const end = Math.max(start, Math.min(target, max));
    const distance = end - start;
    if(distance < 2) return;

    const started = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const next = start + distance * ease(t);
      panel.scrollTop = Math.max(panel.scrollTop, next);

      if(t < 1){
        scrollFrame = requestAnimationFrame(step);
      }else{
        scrollFrame = null;
      }
    };

    scrollFrame = requestAnimationFrame(step);
  }

  panel.addEventListener('touchstart', cancelAutoFollow, { passive:true });
  panel.addEventListener('wheel', cancelAutoFollow, { passive:true });

  advanceSession = function(state){
    if(state.index >= state.paragraphs.length){
      cancelAutoFollow();
      state.statusEl.textContent = 'Session complete';
      state.playing = false;
      state.btnEl.textContent = '↺';
      stopBreathingLoop();
      chime();
      showReflection();
      return;
    }

    const p = document.createElement('p');
    p.textContent = state.paragraphs[state.index];
    p.style.opacity = '0';
    p.style.transform = 'translateY(5px)';
    p.style.transition = 'opacity 4.2s cubic-bezier(.22,.7,.25,1), transform 4.2s cubic-bezier(.22,.7,.25,1)';
    state.boxEl.appendChild(p);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.style.opacity = '1';
      p.style.transform = 'translateY(0)';

      const panelRect = panel.getBoundingClientRect();
      const paragraphRect = p.getBoundingClientRect();
      const readingLine = panelRect.bottom - Math.min(150, panel.clientHeight * .22);

      if(paragraphRect.bottom > readingLine){
        const needed = paragraphRect.bottom - readingLine;
        followForward(panel.scrollTop + needed + 18, 2400);
      }
    }));

    const progress = state.index / Math.max(1, state.paragraphs.length - 1);
    state.statusEl.textContent = progress < 0.22
      ? 'Beginning…'
      : progress < 0.62
        ? 'Settling in…'
        : progress < 0.88
          ? 'Take your time…'
          : 'Stay with this…';

    const dur = readingDuration(state.paragraphs[state.index], state.paceMultiplier);
    state.index++;
    if(state.playing){
      state.timer = setTimeout(() => advanceSession(state), dur);
    }
  };

  runBreathPhase = function(){
    if(!breathing) return;

    const label = document.getElementById('breathLabel');
    const durMs = BREATH_DURATIONS[breathPhase];

    panel.classList.remove('breath-in','breath-hold','breath-out');
    panel.style.setProperty('--breath-duration', durMs + 'ms');

    if(breathPhase === 'in'){
      panel.classList.add('breath-in');
      label.textContent = 'Breathe in';
      playBreathSound('in', durMs / 1000);
    }else if(breathPhase === 'hold'){
      panel.classList.add('breath-hold');
      label.textContent = 'Hold';
    }else{
      panel.classList.add('breath-out');
      label.textContent = 'Breathe out';
      playBreathSound('out', durMs / 1000);
    }

    breathTimer = setTimeout(() => {
      const nextIndex = (BREATH_ORDER.indexOf(breathPhase) + 1) % BREATH_ORDER.length;
      breathPhase = BREATH_ORDER[nextIndex];
      runBreathPhase();
    }, durMs);
  };

  stopBreathingLoop = function(){
    breathing = false;
    clearTimeout(breathTimer);
    cancelAutoFollow();
    panel.classList.remove('breath-in','breath-hold','breath-out');
    panel.style.removeProperty('--breath-duration');
  };
})();
