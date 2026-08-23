// Points v19 session behavior: paced hypnosis reader, immersive breath field, and ceremonial landing.
(() => {
  if (typeof panel === 'undefined' || !panel) return;

  const style = document.createElement('style');
  style.textContent = `
    .panel{
      overflow-anchor:none!important;
      isolation:isolate;
      border-color:var(--line)!important;
      box-shadow:
        -14px 0 34px rgba(43,42,38,.08),
        inset 0 0 0 1px rgba(228,223,211,.58),
        inset 0 0 18px rgba(78,93,75,.012)!important;
      transition:
        transform .32s cubic-bezier(.22,.9,.32,1),
        box-shadow var(--breath-duration,1200ms) var(--breath-ease,cubic-bezier(.37,0,.63,1))!important;
    }
    .panel::before{
      content:'';
      position:absolute;
      inset:0;
      z-index:-1;
      pointer-events:none;
      opacity:0;
      transform:scale(1.018);
      transform-origin:50% 52%;
      background:
        radial-gradient(ellipse 62% 54% at 50% 52%,
          rgba(255,255,255,0) 24%,
          rgba(220,227,217,.012) 48%,
          rgba(78,93,75,.11) 100%),
        linear-gradient(90deg,
          rgba(78,93,75,.055),
          transparent 17%,
          transparent 83%,
          rgba(78,93,75,.045));
      box-shadow:inset 0 0 70px rgba(78,93,75,.035);
      transition:
        opacity var(--breath-duration,1200ms) var(--breath-ease,cubic-bezier(.37,0,.63,1)),
        transform var(--breath-duration,1200ms) var(--breath-ease,cubic-bezier(.37,0,.63,1));
    }

    .panel.breath-in{
      box-shadow:
        -18px 0 42px rgba(43,42,38,.09),
        inset 0 0 0 3px rgba(58,70,56,.31),
        inset 0 0 86px rgba(78,93,75,.115)!important;
    }
    .panel.breath-in::before{opacity:.92;transform:scale(.985);}
    .panel.breath-hold{
      box-shadow:
        -18px 0 42px rgba(43,42,38,.09),
        inset 0 0 0 3px rgba(58,70,56,.31),
        inset 0 0 86px rgba(78,93,75,.115)!important;
    }
    .panel.breath-hold::before{opacity:.92;transform:scale(.985);}
    .panel.breath-out{
      box-shadow:
        -14px 0 34px rgba(43,42,38,.08),
        inset 0 0 0 1px rgba(228,223,211,.46),
        inset 0 0 30px rgba(78,93,75,.022)!important;
    }
    .panel.breath-out::before{opacity:.14;transform:scale(1.018);}
    .panel.breath-rest{
      box-shadow:
        -14px 0 34px rgba(43,42,38,.08),
        inset 0 0 0 1px rgba(228,223,211,.58),
        inset 0 0 18px rgba(78,93,75,.012)!important;
    }
    .panel.breath-rest::before{opacity:0;transform:scale(1.018);}

    .breath-label{
      transition:
        color var(--breath-duration,1200ms) ease,
        opacity 1s ease!important;
    }
    .panel.breath-in .breath-label,
    .panel.breath-hold .breath-label{color:var(--sage-deep)!important;opacity:.92;}
    .panel.breath-out .breath-label{color:var(--ink-faint)!important;opacity:.72;}
    .panel.breath-rest .breath-label{color:var(--ink-faint)!important;opacity:.42;}
    .breath-circle{display:none!important;}

    .panel.reader-mode{overflow-y:hidden!important;}
    .panel.reader-mode .why-label,
    .panel.reader-mode .why,
    .panel.reader-mode #lengthPicker,
    .panel.reader-mode #startCurated{display:none!important;}
    .panel.reader-mode .reader-pace-label{display:none!important;}
    .panel.reader-mode #curatedPlayer{margin-top:12px;}
    .panel.reader-mode #breathWrap{margin:10px 0 0;padding:4px 0 0;}

    .script-box{
      position:relative!important;
      height:clamp(320px,44vh,470px)!important;
      min-height:320px!important;
      max-height:none!important;
      overflow:hidden!important;
      overflow-anchor:none!important;
      margin-top:12px!important;
      padding:0 8px!important;
      scroll-behavior:auto!important;
    }
    .script-box p{
      position:absolute!important;
      left:8px;
      right:8px;
      top:62%;
      margin:0!important;
      opacity:0;
      transform:translateY(-50%) translateY(12px);
      filter:blur(0);
      color:rgba(43,42,38,.97);
      font-size:15.5px;
      line-height:1.9;
      text-align:left;
      transition:
        top 3.4s cubic-bezier(.22,.7,.25,1),
        opacity 3.4s cubic-bezier(.22,.7,.25,1),
        transform 3.4s cubic-bezier(.22,.7,.25,1),
        filter 3.4s ease,
        color var(--breath-duration,1200ms) ease;
      will-change:top,opacity,transform;
    }
    .script-box p.reader-current{top:62%;opacity:1;transform:translateY(-50%) translateY(0);}
    .script-box p.reader-previous{top:24%;opacity:.22;transform:translateY(-50%) translateY(-4px);filter:blur(.15px);}
    .script-box p.reader-leaving{top:7%;opacity:0;transform:translateY(-50%) translateY(-12px);filter:blur(.5px);}
    .panel.breath-in .reader-current,
    .panel.breath-hold .reader-current{color:rgba(43,42,38,1);}
    .panel.breath-out .reader-current,
    .panel.breath-rest .reader-current{color:rgba(43,42,38,.93);}
    .panel.breath-out .reader-previous{opacity:.17;}
    .panel.breath-rest .reader-previous{opacity:.14;}

    /* ---------- Ceremonial ending ---------- */
    .panel.ending-exhale .script-box p{
      transition:
        opacity 5.8s cubic-bezier(.2,.55,.3,1),
        color 5.8s ease,
        filter 5.8s ease!important;
    }
    .panel.ending-exhale .reader-current{opacity:.24!important;color:rgba(43,42,38,.66)!important;filter:blur(.18px);}
    .panel.ending-exhale .reader-previous{opacity:.06!important;}
    .panel.ending-exhale #curatedPlayer{opacity:.42;transition:opacity 2.5s ease;}

    .panel.ending-reflection #curatedPlayer,
    .panel.ending-reflection #breathWrap,
    .panel.ending-reflection .script-box{
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
    }
    .panel.ending-reflection .reflection.visible{
      display:flex!important;
      min-height:54vh;
      margin:0!important;
      padding:42px 8px 28px!important;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      text-align:center;
      opacity:1!important;
      transform:none!important;
    }
    .panel.ending-reflection .reflection .eyebrow{
      margin:0 0 18px!important;
      font-family:'Fraunces',serif;
      font-size:26px;
      line-height:1.15;
      font-style:italic;
      font-weight:500;
      letter-spacing:-.018em;
      text-transform:none;
      color:var(--sage-deep);
    }
    .panel.ending-reflection .reflection-options{
      width:min(100%,360px);
      display:flex;
      flex-direction:column;
      gap:9px;
    }
    .panel.ending-reflection .reflection-chip{
      width:100%;
      min-height:48px;
      border:1px solid var(--line);
      border-radius:12px;
      background:rgba(255,255,255,.46);
      color:var(--ink-soft);
      font-size:13px;
      font-weight:600;
      transition:background .25s ease,border-color .25s ease,color .25s ease,transform .25s ease;
    }
    .panel.ending-reflection .reflection-chip:hover,
    .panel.ending-reflection .reflection-chip:focus-visible{
      background:var(--sage-tint);
      border-color:rgba(78,93,75,.22);
      color:var(--sage-deep);
      transform:translateY(-1px);
    }

    .panel.ending-closed > *:not(.panel-close):not(.closing-screen){
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
    }
    .panel.ending-closed .closing-screen{
      display:flex!important;
      position:absolute!important;
      inset:0!important;
      z-index:5;
      min-height:100%;
      padding:44px 34px!important;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      gap:0;
      background:linear-gradient(180deg,rgba(250,248,243,.98),rgba(246,243,236,.99));
      text-align:center;
      opacity:1!important;
      visibility:visible!important;
      transform:none!important;
    }
    .ending-kicker{
      margin-bottom:13px;
      color:var(--ink-faint);
      font-size:9.5px;
      font-weight:700;
      letter-spacing:.17em;
      text-transform:uppercase;
    }
    .ending-point{
      font-family:'Fraunces',serif;
      font-size:31px;
      line-height:1.05;
      font-style:italic;
      font-weight:500;
      letter-spacing:-.025em;
      color:var(--sage-deep);
    }
    .ending-sub{
      margin-top:5px;
      color:var(--brass);
      font-size:11.5px;
    }
    .ending-line{
      max-width:330px;
      margin:30px auto 0;
      color:var(--ink-soft);
      font-family:'Fraunces',serif;
      font-size:18px;
      line-height:1.6;
      font-style:italic;
    }
    .ending-done{
      margin-top:34px;
      min-width:118px;
      min-height:44px;
      padding:0 22px;
      border:1px solid var(--line);
      border-radius:999px;
      background:transparent;
      color:var(--ink-soft);
      font-size:12px;
      font-weight:600;
      letter-spacing:.03em;
      cursor:pointer;
    }
    .ending-done:hover{background:var(--sage-tint);color:var(--sage-deep);}

    @media (max-width:520px){
      .panel.reader-mode{padding-top:24px!important;padding-bottom:28px!important;}
      .script-box{height:clamp(330px,46vh,455px)!important;min-height:330px!important;margin-top:8px!important;}
      .script-box p{font-size:15px;line-height:1.88;}
      .panel.ending-reflection .reflection.visible{min-height:58vh;padding-top:34px!important;}
      .panel.ending-closed .closing-screen{padding:40px 28px!important;}
      .ending-point{font-size:29px;}
      .ending-line{font-size:17px;}
    }

    @media (prefers-reduced-motion:reduce){
      .panel::before{transition:opacity .5s ease!important;transform:none!important;}
      .script-box p{transition:opacity .35s ease,color .5s ease!important;transform:translateY(-50%)!important;}
      .panel.ending-exhale .script-box p{transition:opacity 1s ease!important;}
    }
  `;
  document.head.appendChild(style);

  const lengthPicker = document.getElementById('lengthPicker');
  const paceLabel = lengthPicker && lengthPicker.previousElementSibling && lengthPicker.previousElementSibling.classList.contains('eyebrow')
    ? lengthPicker.previousElementSibling
    : null;
  if(paceLabel) paceLabel.classList.add('reader-pace-label');

  if(lengthPicker){
    const durationLabels = {
      short: ['5–6 min', 'Brief'],
      medium: ['6–8 min', 'Steady'],
      long: ['8–10 min', 'Unhurried']
    };
    lengthPicker.querySelectorAll('.length-chip').forEach((chip) => {
      const label = durationLabels[chip.dataset.length];
      if(label) chip.innerHTML = `${label[0]}<span>${label[1]}</span>`;
    });
  }

  const reflection = document.getElementById('reflection');
  const closingScreen = document.getElementById('closingScreen');
  const reflectionTitle = reflection ? reflection.querySelector('.eyebrow') : null;
  const reflectionButtons = reflection ? [...reflection.querySelectorAll('.reflection-chip')] : [];
  if(reflectionTitle) reflectionTitle.textContent = 'What changed?';
  reflectionButtons.forEach((button) => {
    if(button.dataset.mood === 'lighter') button.textContent = 'Lighter';
    if(button.dataset.mood === 'same') button.textContent = 'About the same';
    if(button.dataset.mood === 'heavier') button.textContent = 'Different';
  });
  try{
    if(typeof MOOD_LABELS !== 'undefined') MOOD_LABELS.heavier = 'Different';
  }catch(e){ /* history can still fall back to the stored value */ }

  const READER_TRANSITION_MS = 3400;
  const MIN_LINE_HOLD_MS = 6000;
  const FINAL_LINE_HOLD_MS = 10500;
  const FINAL_EXHALE_MS = 6000;
  const HYPNOTIC_BREATH_DURATIONS = { in:4000, hold:4000, out:6000, rest:1200 };
  const HYPNOTIC_BREATH_ORDER = ['in','hold','out','rest'];
  let endingTimer = null;

  function clearEndingState(){
    clearTimeout(endingTimer);
    panel.classList.remove('ending-exhale','ending-reflection','ending-closed');
    const player = document.getElementById('curatedPlayer');
    if(player){ player.style.opacity = ''; player.style.pointerEvents = ''; }
    if(closingScreen){
      closingScreen.classList.remove('visible','shown');
      const defaultMessage = document.createElement('div');
      defaultMessage.className = 'closing-message';
      defaultMessage.id = 'closingMessage';
      defaultMessage.textContent = 'Carry this with you.';
      closingScreen.replaceChildren(defaultMessage);
    }
  }

  function enterReaderMode(state){
    clearEndingState();
    panel.classList.add('reader-mode');
    panel.scrollTop = 0;
    state.boxEl.textContent = '';
    state.finishing = false;
  }

  function leaveReaderMode(){
    panel.classList.remove('reader-mode');
  }

  function stagePassage(state, text){
    const current = state.boxEl.querySelector('.reader-current');
    const previous = state.boxEl.querySelector('.reader-previous');

    if(previous){
      previous.classList.remove('reader-previous');
      previous.classList.add('reader-leaving');
      setTimeout(() => previous.remove(), 3500);
    }

    if(current){
      current.classList.remove('reader-current');
      current.classList.add('reader-previous');
    }

    const p = document.createElement('p');
    p.textContent = text;
    state.boxEl.appendChild(p);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.classList.add('reader-current');
    }));
  }

  function finishWithExhale(state){
    if(state.finishing) return;
    state.finishing = true;
    state.playing = false;
    clearTimeout(state.timer);
    clearTimeout(breathTimer);
    breathing = false;

    const label = document.getElementById('breathLabel');
    panel.classList.remove('breath-in','breath-hold','breath-out','breath-rest');
    panel.classList.add('breath-out','ending-exhale');
    panel.style.setProperty('--breath-duration', FINAL_EXHALE_MS + 'ms');
    panel.style.setProperty('--breath-ease', 'cubic-bezier(.12,.62,.24,1)');
    if(label) label.textContent = 'One last breath out';
    state.statusEl.textContent = 'Let it settle…';
    state.btnEl.textContent = '•';
    state.btnEl.style.opacity = '.28';
    state.btnEl.style.pointerEvents = 'none';
    playBreathSound('out', FINAL_EXHALE_MS / 1000);

    endingTimer = setTimeout(() => {
      panel.classList.remove('ending-exhale','breath-out');
      panel.style.removeProperty('--breath-duration');
      panel.style.removeProperty('--breath-ease');
      chime();
      showReflection();
    }, FINAL_EXHALE_MS);
  }

  advanceSession = function(state){
    if(state.index === 0 && !panel.classList.contains('reader-mode')){
      enterReaderMode(state);
    }

    if(state.index >= state.paragraphs.length){
      finishWithExhale(state);
      return;
    }

    stagePassage(state, state.paragraphs[state.index]);

    const progress = state.index / Math.max(1, state.paragraphs.length - 1);
    state.statusEl.textContent = progress < 0.22
      ? 'Beginning…'
      : progress < 0.62
        ? 'Settling in…'
        : progress < 0.88
          ? 'Take your time…'
          : 'Stay with this…';

    const isFinalPassage = state.index === state.paragraphs.length - 1;
    const naturalDuration = readingDuration(state.paragraphs[state.index], state.paceMultiplier);
    const minimumDuration = READER_TRANSITION_MS + (isFinalPassage ? FINAL_LINE_HOLD_MS : MIN_LINE_HOLD_MS);
    const dur = Math.max(naturalDuration, minimumDuration);
    state.index++;
    if(state.playing){
      state.timer = setTimeout(() => advanceSession(state), dur);
    }
  };

  // Softer breath texture with separate inhale/exhale contours and no hard loop edge.
  playBreathSound = function(direction, durSeconds){
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const dur = durSeconds || 4;

      const source = audioCtx.createBufferSource();
      source.buffer = getNoiseBuffer(audioCtx);
      source.loop = true;

      const band = audioCtx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 0.42;

      const softener = audioCtx.createBiquadFilter();
      softener.type = 'lowpass';
      softener.frequency.value = direction === 'in' ? 920 : 760;
      softener.Q.value = 0.25;

      if(direction === 'in'){
        band.frequency.setValueAtTime(260, now);
        band.frequency.exponentialRampToValueAtTime(610, now + dur * .88);
      }else{
        band.frequency.setValueAtTime(540, now);
        band.frequency.exponentialRampToValueAtTime(220, now + dur * .92);
      }

      const gain = audioCtx.createGain();
      const peak = direction === 'in' ? 0.0052 : 0.0044;
      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + dur * .38);
      gain.gain.setValueAtTime(peak, now + dur * .58);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + dur);

      source.connect(band).connect(softener).connect(gain).connect(audioCtx.destination);
      source.start(now, Math.random() * 1.5);
      source.stop(now + dur + .08);
    }catch(e){ /* audio unavailable — visual breathing still proceeds silently */ }
  };

  runBreathPhase = function(){
    if(!breathing) return;

    const label = document.getElementById('breathLabel');
    const durMs = HYPNOTIC_BREATH_DURATIONS[breathPhase] || HYPNOTIC_BREATH_DURATIONS.in;

    panel.classList.remove('breath-in','breath-hold','breath-out','breath-rest');
    panel.style.setProperty('--breath-duration', durMs + 'ms');

    if(breathPhase === 'in'){
      panel.style.setProperty('--breath-ease', 'cubic-bezier(.18,.02,.18,1)');
      panel.classList.add('breath-in');
      label.textContent = 'Breathe in';
      playBreathSound('in', durMs / 1000);
    }else if(breathPhase === 'hold'){
      panel.style.setProperty('--breath-ease', 'linear');
      panel.classList.add('breath-hold');
      label.textContent = 'Stay';
    }else if(breathPhase === 'out'){
      panel.style.setProperty('--breath-ease', 'cubic-bezier(.16,.6,.28,1)');
      panel.classList.add('breath-out');
      label.textContent = 'Breathe out';
      playBreathSound('out', durMs / 1000);
    }else{
      panel.style.setProperty('--breath-ease', 'cubic-bezier(.3,0,.7,1)');
      panel.classList.add('breath-rest');
      label.textContent = 'Rest';
    }

    breathTimer = setTimeout(() => {
      const nextIndex = (HYPNOTIC_BREATH_ORDER.indexOf(breathPhase) + 1) % HYPNOTIC_BREATH_ORDER.length;
      breathPhase = HYPNOTIC_BREATH_ORDER[nextIndex];
      runBreathPhase();
    }, durMs);
  };

  stopBreathingLoop = function(){
    breathing = false;
    clearTimeout(breathTimer);
    panel.classList.remove('breath-in','breath-hold','breath-out','breath-rest');
    panel.style.removeProperty('--breath-duration');
    panel.style.removeProperty('--breath-ease');
  };

  const originalShowReflection = showReflection;
  showReflection = function(){
    panel.classList.add('ending-reflection');
    const player = document.getElementById('curatedPlayer');
    if(player){ player.style.opacity = ''; player.style.pointerEvents = ''; }
    stateSafeStatus('Notice without judging it.');
    originalShowReflection();
  };

  function stateSafeStatus(text){
    const el = document.getElementById('curatedStatus');
    if(el) el.textContent = text;
  }

  function closingExcerpt(){
    if(!currentPoint || !currentPoint.script) return 'Carry the quieter pace with you.';
    const paragraphs = String(currentPoint.script).split(/\n\n+/).map(s => s.trim()).filter(Boolean);
    const last = paragraphs[paragraphs.length - 1] || '';
    const sentences = last.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [last];
    let excerpt = (sentences[sentences.length - 1] || last).trim();
    if(excerpt.length > 150) excerpt = (sentences[0] || excerpt).trim();
    if(excerpt.length > 170) excerpt = excerpt.slice(0,167).trimEnd() + '…';
    return excerpt || 'Carry the quieter pace with you.';
  }

  function showClosingState(){
    if(!closingScreen || !currentPoint) return;
    panel.classList.remove('ending-reflection');
    panel.classList.add('ending-closed');
    closingScreen.classList.add('visible','shown');
    closingScreen.replaceChildren();

    const kicker = document.createElement('div');
    kicker.className = 'ending-kicker';
    kicker.textContent = 'Practice complete';

    const point = document.createElement('div');
    point.className = 'ending-point';
    point.textContent = currentPoint.name;

    const sub = document.createElement('div');
    sub.className = 'ending-sub';
    sub.textContent = currentPoint.sub;

    const line = document.createElement('p');
    line.className = 'ending-line';
    line.textContent = closingExcerpt();

    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'ending-done';
    done.textContent = 'Done';
    done.addEventListener('click', () => {
      clearEndingState();
      leaveReaderMode();
      closePanel();
    });

    closingScreen.append(kicker, point, sub, line, done);
  }

  if(reflection){
    reflection.addEventListener('click', (event) => {
      const button = event.target.closest('.reflection-chip');
      if(!button) return;
      setTimeout(showClosingState, 120);
    });
  }

  if(typeof resetReflectionAndClosing === 'function'){
    const originalResetReflectionAndClosing = resetReflectionAndClosing;
    resetReflectionAndClosing = function(){
      clearEndingState();
      originalResetReflectionAndClosing();
    };
  }

  const closeButton = panel.querySelector('.panel-close');
  if(closeButton){
    closeButton.addEventListener('click', () => {
      clearEndingState();
      leaveReaderMode();
    });
  }
})();
