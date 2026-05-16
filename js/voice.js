import { state, getProj, getActivePart, uid } from './state.js';
import { showToast } from './ui.js';
import { refreshBottomBar, pushStitch, undoStitch, triggerEdgeGlow, copyRoundStructure } from './stitch.js';
import { addRoundBlank, setActiveRound } from './round.js';
import { saveData } from './storage.js';
import { extractStitches } from '../stitches.js';
import { parseIntentL1, parseIntentL2 } from './voice-intent.js';
import { t, getLang } from './i18n.js';

let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

export function playSound(type) {
  try {
    const ctx = _getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';

    const now = ctx.currentTime;
    let dur = 0.18;
    let vol = 0.25;
    let freqStart = 880;
    let freqEnd = 440;

    if (type === 'enter') {
      freqStart = 440;
      freqEnd = 880;
    } else if (type === 'stitch') {
      dur = 0.08;
      vol = 0.15;
      freqStart = 600;
      freqEnd = 600;
    }

    osc.frequency.setValueAtTime(freqStart, now);
    if (freqStart !== freqEnd) {
      osc.frequency.linearRampToValueAtTime(freqEnd, now + dur);
    }

    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0.001, now + dur + 0.02);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  } catch (_) { /* audio is non-critical */ }
}

// ═══════════════════════════════════════════
//  Intent Layer
// ═══════════════════════════════════════════

function isPro() {
  return true; // TODO: wire up to billing
}

function handleVoiceResult(text, isFinal) {
  if (!isFinal) return;

  const intent = isPro()
    ? parseIntentL2(text)
    : parseIntentL1(text);

  executeIntent(intent);
}

async function executeIntent(intent) {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  const activeRound = part?.rounds.find(r => r.id === part.activeRoundId);

  switch (intent.type) {

    case 'STITCH': {
      const count = intent.count || 1;
      for (let i = 0; i < count; i++) {
        await pushStitch(intent.sid);
      }
      state.voiceLastSid = intent.sid;
      if (state.data.settings.voiceSoundEnabled) {
        playSound('stitch');
      }
      triggerEdgeGlow(intent.sid);
      break;
    }

    case 'UNDO': {
      await undoStitch();
      triggerEdgeGlow(null);
      speakFeedback('已撤销', 'Undone');
      break;
    }

    case 'REPEAT': {
      if (activeRound?.instruction && state.voiceLastSid) {
        speakFeedback('一针还是重复花样？', 'One stitch or repeat pattern?');
        startWaiting('REPEAT_CLARIFY', 5000);
      } else if (state.voiceLastSid) {
        await pushStitch(state.voiceLastSid);
        if (state.data.settings.voiceSoundEnabled) {
          playSound('stitch');
        }
        triggerEdgeGlow(state.voiceLastSid);
      }
      break;
    }

    case 'REPEAT_SINGLE': {
      clearWaiting();
      if (state.voiceLastSid) {
        await pushStitch(state.voiceLastSid);
        if (state.data.settings.voiceSoundEnabled) {
          playSound('stitch');
        }
        triggerEdgeGlow(state.voiceLastSid);
      }
      break;
    }

    case 'REPEAT_PATTERN': {
      clearWaiting();
      if (activeRound?.instruction) {
        const tokens = extractStitches(activeRound.instruction);
        for (const sid of tokens) {
          if (typeof sid === 'string') await pushStitch(sid);
        }
        if (state.data.settings.voiceSoundEnabled) {
          playSound('stitch');
        }
      }
      break;
    }

    case 'REPEAT_ROUND': {
      if (activeRound?.instruction) {
        speakFeedback('重复这圈还是新建一圈？', 'Repeat this round or new round?');
        startWaiting('REPEAT_ROUND_CLARIFY', 5000);
      } else {
        addRoundBlank();
        speakFeedback('已新建', 'New round added');
      }
      break;
    }

    case 'REPEAT_ROUND_COPY': {
      clearWaiting();
      if (activeRound) {
        copyRoundStructure(activeRound.id);
        speakFeedback('已复制', 'Round copied');
      }
      break;
    }

    case 'NEW_ROUND': {
      clearWaiting();
      addRoundBlank();
      speakFeedback('已新建', 'New round added');
      break;
    }

    case 'MARK': {
      speakFeedback('什么颜色？', 'What color?');
      startWaiting('MARK_COLOR', 5000);
      break;
    }

    case 'MARK_COLOR_REPLY': {
      clearWaiting();
      const pos = state.selectedStitch ||
        { roundId: part?.activeRoundId,
          idx: (activeRound?.seq.length || 1) - 1 };
      if (pos.roundId !== undefined) {
        saveMarkerDirect(pos.roundId, pos.idx, intent.color);
        speakFeedback('已标记', 'Marked');
      }
      break;
    }

    case 'GOTO': {
      const targetRound = part?.rounds.find(r => r.roundNum === intent.target);
      if (targetRound) {
        setActiveRound(proj, targetRound.id);
        speakFeedback(`第${intent.target}圈`, `Round ${intent.target}`);
      } else {
        speakFeedback('没有找到', 'Not found');
      }
      break;
    }

    case 'UNKNOWN':
    default:
      break;
  }
}

function startWaiting(waitFor, timeout) {
  state.voiceWaitingFor = waitFor;
  state.voiceWaitTimer = setTimeout(() => {
    speakFeedback('已取消', 'Cancelled');
    clearWaiting();
  }, timeout);
  document.documentElement.classList.add('voice-waiting');
}

function clearWaiting() {
  state.voiceWaitingFor = null;
  clearTimeout(state.voiceWaitTimer);
  state.voiceWaitTimer = null;
  document.documentElement.classList.remove('voice-waiting');
}

function speakFeedback(textZh, textEn) {
  const lang = getLang();
  const text = lang === 'en' ? textEn : textZh;
  if (!text) return;
  if (!state.data.settings.voiceSoundEnabled) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'en' ? 'en-US' : 'zh-CN';
  utter.rate = 1.1;
  utter.volume = 0.8;
  window.speechSynthesis.speak(utter);
}

function saveMarkerDirect(roundId, idx, color) {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  if (!proj.markers) proj.markers = [];
  proj.markers.push({
    id: uid(),
    roundId,
    index: idx,
    color,
    note: ''
  });
  proj.lastModified = Date.now();
  saveData();
  window.renderProject();
}

// ═══════════════════════════════════════════
//  Speech Recognition
// ═══════════════════════════════════════════

export function initRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = getLang() === 'en' ? 'en-US' : 'zh-CN';
  r.continuous = true;
  r.interimResults = false;

  r.onresult = (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    console.log('[voice] recognized:', transcript);
    handleVoiceResult(transcript, true);
  };

  r.onend = () => {
    if (state.voiceMode) r.start();
  };

  r.onerror = (e) => {
    if (e.error === 'not-allowed') {
      state.flowState.voiceState = 'off';
      state.voiceMode = false;
      state.recognition = null;
      setVoicePulse(false);
      updateVoiceButton();
      showToast(t('voice_mic_denied'));
    }
  };

  return r;
}

export async function toggleVoiceMode() {
  // 启动中时点击 = 取消，直接重置
  if (state.flowState.voiceState === 'starting') {
    state.flowState.voiceState = 'off';
    if (state.recognition) {
      state.recognition.onend = null;
      try { state.recognition.stop(); } catch(_) {}
      state.recognition = null;
    }
    state.voiceMode = false;
    setVoicePulse(false);
    updateVoiceButton();
    return;
  }

  // 已开启时点击 = 关闭
  if (state.flowState.voiceState === 'on') {
    state.flowState.voiceState = 'off';
    state.voiceMode = false;
    if (state.recognition) {
      state.recognition.onend = null;
      try { state.recognition.stop(); } catch(_) {}
      state.recognition = null;
    }
    clearWaiting();
    playSound('exit');
    setVoicePulse(false);
    const proj = getProj(state.curProjId);
    if (proj) {
      refreshBottomBar(proj);
    }
    updateVoiceButton();
    return;
  }

  // 关闭状态点击 = 开启，进入 starting
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast(t('voice_not_supported'));
    return;
  }

  state.flowState.voiceState = 'starting';
  updateVoiceButton(); // 立即显示"启动中..."

  // 请求权限
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    await new Promise(r => setTimeout(r, 300));
  } catch(err) {
    state.flowState.voiceState = 'off';
    updateVoiceButton();
    showToast(t('voice_mic_denied_settings'));
    return;
  }

  // 权限拿到，但用户可能在等待期间又点了取消
  if (state.flowState.voiceState !== 'starting') return;

  // 正式启动
  state.flowState.voiceState = 'on';
  state.voiceMode = true;
  state.recognition = initRecognition();
  try {
    state.recognition.start();
  } catch(err) {
    state.flowState.voiceState = 'off';
    state.voiceMode = false;
    state.recognition = null;
    updateVoiceButton();
    showToast(t('voice_start_failed'));
    return;
  }

  playSound('enter');
  setVoicePulse(true);
  const proj = getProj(state.curProjId);
  if (proj) {
    refreshBottomBar(proj);
  }
  updateVoiceButton();
}

export function setVoicePulse(active) {
  const el = document.getElementById('voice-pulse');
  if (!el) return;
  if (active) {
    el.style.opacity = '0.3';
    el.classList.add('active');
  } else {
    el.classList.remove('active');
    el.style.opacity = '0';
  }
}

export function updateVoiceButton() {
  const btn = document.getElementById('voice-mode-btn');
  if (!btn) return;
  if (state.flowState.voiceState === 'starting') {
    btn.style.background = '#F59E0B';
    btn.style.color = '#fff';
    btn.style.borderColor = '#F59E0B';
    btn.style.animation = 'btn-pulse 1s ease-in-out infinite';
  } else if (state.flowState.voiceState === 'on') {
    btn.style.background = '#EF4444';
    btn.style.color = '#fff';
    btn.style.borderColor = '#EF4444';
    btn.style.animation = 'btn-pulse 1.8s ease-in-out infinite';
  } else {
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
    btn.style.animation = '';
  }
}

export function openVoiceTutorial() {
  const content = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('voice_tutorial_title')}</div>
  <div style="padding:14px 16px;font-size:14px;line-height:1.8;color:var(--text)">
    <div style="background:#FEF3C7;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#92400E;line-height:1.6">
      ${t('voice_tutorial_warning')}
    </div>
    ${getLang() === 'en' ? `<div style="background:#E0F2FE;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#075985;line-height:1.6">Note: 'DC' is treated as double crochet (US terms). Say 'single crochet' or 'treble' for unambiguous results.</div>` : ''}
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <div style="font-weight:700;margin-bottom:4px">${t('voice_tutorial_step1_title')}</div>
        <div style="color:var(--muted);font-size:13px">${t('voice_tutorial_step1_body')}</div>
      </div>
      <div>
        <div style="font-weight:700;margin-bottom:4px">${t('voice_tutorial_step2_title')}</div>
        <div style="color:var(--muted);font-size:13px">${t('voice_tutorial_step2_body')}</div>
      </div>
      <div>
        <div style="font-weight:700;margin-bottom:4px">${t('voice_tutorial_step3_title')}</div>
        <div style="color:var(--muted);font-size:13px">${t('voice_tutorial_step3_body')}</div>
      </div>
      <div>
        <div style="font-weight:700;margin-bottom:4px">${t('voice_tutorial_step4_title')}</div>
        <div style="color:var(--muted);font-size:13px">${t('voice_tutorial_step4_body')}</div>
      </div>
    </div>
  </div>
  <button class="sheet-cancel" onclick="closeSheet()">${t('ok')}</button>`;
  window.showSheet(content);
}
