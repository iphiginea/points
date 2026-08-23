// Points v16 session behavior: fixed hypnosis reader and immersive perimeter breathing.
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

    .panel.reader-mode{
      overflow-y:hidden!important;
    }
    .panel.reader-mode .why-label,
    .panel.reader-mode .why,
    .panel.reader-mode #lengthPicker,
    .panel.reader-mode #startCurated{
      display:none!important;
    }
    .panel.reader-mode .reader-pace-label{
      display:none!important;
    }
    .panel.reader-mode #curatedPlayer{
      margin-top:12px;
    }
    .panel.reader-mode #breathWrap{
      margin:10px 0 0;
      padding:4px 0 0;
    }

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
      font-size:15.5px;
      line-height:1.9;
      text-align:left;
      transition:
        top 3.4s cubic-bezier(.22,.7,.25,1),
        opacity 3.4s cubic-bezier(.22,.7,.25,1),
        transform 3.4s cubic-bezier(.22,.7,.25,1),
        filter 3.4s ease;
      will-change:top,opacity,transform;
    }
    .script-box p.reader-current{
      top:62%;
      opacity:1;
      transform:translateY(-50%) translateY(0);
    }
    .script-box p.reader-previous{
      top:24%;
      opacity:.22;
      transform:translateY(-50%) translateY(-4px);
      filter:blur(.15px);
    }
    .script-box p.reader-leaving{
      top:7%;
      opacity:0;
      transform:translateY(-50%) translateY(-12px);
      filter:blur(.5px);
    }

    @media (max-width:520px){
      .panel.reader-mode{
        padding-top:24px!important;
        padding-bottom:28px!important;
      }
      .script-box{
        height:clamp(330px,46vh,455px)!important;
        min-height:330px!important;
        margin-top:8px!important;
      }
      .script-box p{
        font-size:15px;
        line-height:1.88;
      }
    }

    @media (prefers-reduced-motion:reduce){
      .script-box p{
        transition:opacity .35s ease!important;
        transform:translateY(-50%)!important;
      }
    }
  `;
  document.head.appendChild(style);

  const lengthPicker = document.getElementById('lengthPicker');
  const paceLabel = lengthPicker && lengthPicker.previousElementSibling && lengthPicker.previousElementSibling.classList.contains('eyebrow')
    ? lengthPicker.previousElementSibling
    : null;
  if(paceLabel) paceLabel.classList.add('reader-pace-label');

  const READER_TRANSITION_MS = 3400;
  const MIN_LINE_HOLD_MS = 3000;

  function enterReaderMode(state){
    panel.classList.add('reader-mode');
    panel.scrollTop = 0;
    state.boxEl.textContent = '';
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

  advanceSession = function(state){
    if(state.index === 0 && !panel.classList.contains('reader-mode')){
      enterReaderMode(state);
    }

    if(state.index >= state.paragraphs.length){
      state.statusEl.textContent = 'Session complete';
      state.playing = false;
      state.btnEl.textContent = '↺';
      stopBreathingLoop();
      chime();
      showReflection();
      setTimeout(leaveReaderMode, 900);
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

    const naturalDuration = readingDuration(state.paragraphs[state.index], state.paceMultiplier);
    const dur = Math.max(naturalDuration, READER_TRANSITION_MS + MIN_LINE_HOLD_MS);
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
    panel.classList.remove('breath-in','breath-hold','breath-out');
    panel.style.removeProperty('--breath-duration');
  };

  const closeButton = panel.querySelector('.panel-close');
  if(closeButton){
    closeButton.addEventListener('click', leaveReaderMode);
  }
})();
