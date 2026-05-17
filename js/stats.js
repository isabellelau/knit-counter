import { state, getDailyLog, calcTotalDays } from './state.js';
import { getTotalFocusTime, formatFocusTime } from './project.js';
import { countSeqStitches } from './stitch.js';
import { t, term } from './i18n.js';
import { showToast } from './ui.js';
import { isPro } from './config.js';

// ═══════════════════════════════════════════
//  Data calculations
// ═══════════════════════════════════════════

function calcStreak() {
  const log = getDailyLog();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (log[key] > 0) streak++;
    else break;
  }
  return streak;
}

function buildHeatmapData() {
  const log = getDailyLog();
  const result = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ key, count: log[key] || 0 });
  }
  return result;
}

function calcTimeDistribution() {
  const slots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  state.data.projects.forEach(proj => {
    (proj.focusSessions || []).forEach(s => {
      const h = new Date(s.start).getHours();
      if (h >= 6 && h < 12) slots.morning++;
      else if (h >= 12 && h < 18) slots.afternoon++;
      else if (h >= 18 && h < 23) slots.evening++;
      else slots.night++;
    });
  });
  return slots;
}

function calcStitchStats() {
  const counts = {};
  state.data.projects.forEach(proj => {
    proj.parts?.forEach(part => {
      part.rounds?.forEach(round => {
        round.seq?.forEach(token => {
          const sid = token?.type === 'cluster' ? token.stitches[0] : token;
          counts[sid] = (counts[sid] || 0) + 1;
        });
      });
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function calcBestDay() {
  const log = getDailyLog();
  return Object.entries(log).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
}

function calcLongestRound() {
  let max = 0;
  state.data.projects.forEach(proj => {
    proj.parts?.forEach(part => {
      part.rounds?.forEach(round => {
        const len = countSeqStitches(round.seq);
        if (len > max) max = len;
      });
    });
  });
  return max;
}

function calcAvgFocus() {
  let totalMs = 0;
  let count = 0;
  state.data.projects.forEach(proj => {
    (proj.focusSessions || []).forEach(s => {
      if (s.end && s.start) {
        totalMs += s.end - s.start;
        count++;
      }
    });
  });
  return count > 0 ? Math.round(totalMs / count) : 0;
}

// ═══════════════════════════════════════════
//  Heatmap rendering
// ═══════════════════════════════════════════

function renderHeatmap() {
  const data = buildHeatmapData();
  const cells = data.map(d => {
    let level = 0;
    if (d.count === 0) level = 0;
    else if (d.count <= 5) level = 1;
    else if (d.count <= 20) level = 2;
    else level = 3;
    return `<div class="heatmap-cell" data-level="${level}" title="${d.key}: ${d.count}"></div>`;
  }).join('');
  return `<div class="stats-heatmap">${cells}</div>`;
}

// ═══════════════════════════════════════════
//  PRO mask wrapper
// ═══════════════════════════════════════════

const DEV_UNLOCK = true; // 测试完改回 false

function proWrap(contentHTML) {
  if (DEV_UNLOCK) {
    return `<div class="stats-blur-wrap"><div>${contentHTML}</div></div>`;
  }
  return `
    <div class="stats-blur-wrap">
      <div class="stats-blur-content">${contentHTML}</div>
      <div class="stats-pro-mask" onclick="showProHint()">
        <span class="pro-badge">PRO</span>
        <span class="stats-pro-hint">${t('pro_hint_unlock')}</span>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Section builders
// ═══════════════════════════════════════════

function _buildTimeSection() {
  const days = calcTotalDays();
  const streak = calcStreak();

  const timeDist = calcTimeDistribution();
  const maxSlot = Math.max(timeDist.morning, timeDist.afternoon, timeDist.evening, timeDist.night, 1);
  const distHtml = `
    <div class="stats-time-dist">
      <div class="stats-time-bar"><div class="stats-time-fill" style="width:${(timeDist.morning / maxSlot * 100).toFixed(1)}%"></div><span class="stats-time-label">${t('stats_time_morning')}</span></div>
      <div class="stats-time-bar"><div class="stats-time-fill" style="width:${(timeDist.afternoon / maxSlot * 100).toFixed(1)}%"></div><span class="stats-time-label">${t('stats_time_afternoon')}</span></div>
      <div class="stats-time-bar"><div class="stats-time-fill" style="width:${(timeDist.evening / maxSlot * 100).toFixed(1)}%"></div><span class="stats-time-label">${t('stats_time_evening')}</span></div>
      <div class="stats-time-bar"><div class="stats-time-fill" style="width:${(timeDist.night / maxSlot * 100).toFixed(1)}%"></div><span class="stats-time-label">${t('stats_time_night')}</span></div>
    </div>
  `;

  return `
    <div class="stats-section">
      <div class="stats-section-head">${t('stats_time_title')}</div>
      <div class="stats-streak-row">
        <div class="stats-streak-block">
          <div class="stats-streak-num">${days}</div>
          <div class="stats-streak-label">${t('stats_total_days')}</div>
        </div>
        <div class="stats-streak-block">
          <div class="stats-streak-num">${streak}</div>
          <div class="stats-streak-label">${t('stats_streak_label')}</div>
        </div>
      </div>
      <div class="stats-section-sub">${t('stats_heatmap_title')}</div>
      ${proWrap(renderHeatmap())}
      <div class="stats-section-sub">${t('stats_time_dist_title')}</div>
      ${proWrap(distHtml)}
    </div>
  `;
}

function _buildAnalysisSection() {
  const stitchStats = calcStitchStats();
  const top3 = stitchStats.slice(0, 3).map(([sid, count], i) =>
    `<div class="stats-rank-row"><span class="stats-rank-num">${i + 1}</span><span class="stats-rank-name">${sid}</span><span class="stats-rank-count">${count}</span></div>`
  ).join('') || `<div class="stats-empty">${t('stats_no_data')}</div>`;

  const top3Html = `<div class="stats-rank-list">${top3}</div>`;
  const paletteHtml = `<div class="stats-empty">${t('stats_no_data')}</div>`;
  const crossHtml = `<div class="stats-empty">${t('stats_no_data')}</div>`;

  return `
    <div class="stats-section">
      <div class="stats-section-head">${t('stats_analysis_title')}</div>
      <div class="stats-section-sub">${t('stats_top_stitches')}</div>
      ${proWrap(top3Html)}
      <div class="stats-section-sub">${t('stats_current_palette')}</div>
      ${proWrap(paletteHtml)}
      <div class="stats-section-sub">${t('stats_cross_proj')}</div>
      ${proWrap(crossHtml)}
    </div>
  `;
}

function _buildRecordsSection() {
  const bestDay = calcBestDay();
  const bestDayHtml = `<div class="stats-record-row"><span class="stats-record-date">${bestDay[0]}</span><span class="stats-record-value">${bestDay[1]} ${term('stitches')}</span></div>`;

  const longest = calcLongestRound();
  const longestHtml = `<div class="stats-record-row"><span class="stats-record-label">${t('stats_longest_round')}</span><span class="stats-record-value">${longest} ${term('stitches')}</span></div>`;

  const avgFocus = calcAvgFocus();
  const avgFocusHtml = `<div class="stats-record-row"><span class="stats-record-label">${t('stats_avg_focus')}</span><span class="stats-record-value">${formatFocusTime(avgFocus)}</span></div>`;

  return `
    <div class="stats-section">
      <div class="stats-section-head">${t('stats_records_title')}</div>
      <div class="stats-section-sub">${t('stats_best_day')}</div>
      ${proWrap(bestDayHtml)}
      <div class="stats-section-sub">${t('stats_longest_round')}</div>
      ${proWrap(longestHtml)}
      <div class="stats-section-sub">${t('stats_avg_focus')}</div>
      ${proWrap(avgFocusHtml)}
    </div>
  `;
}

// ═══════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════

export function showProHint() {
  showToast(t('pro_hint_toast'));
}

export function buildStatsHTML() {
  return `
    <div class="stats-page">
      <button class="stats-back-btn" onclick="renderHome()">‹ ${t('nav_back')}</button>
      <div class="stats-sections">
        ${_buildTimeSection()}
        ${_buildAnalysisSection()}
        ${_buildRecordsSection()}
      </div>
    </div>
  `;
}

export function openStatsPage() {
  if (!isPro()) {
    showToast('详细统计为 PRO 功能，敬请期待');
    return;
  }
  document.documentElement.classList.remove('in-project');

  const lt = document.getElementById('large-title-wrap');
  if (lt) lt.style.display = 'none';

  const navBack = document.getElementById('nav-back');
  const navSmall = document.getElementById('nav-small-title');
  const navActions = document.getElementById('nav-actions');

  if (navBack) {
    navBack.classList.add('visible');
    navBack.onclick = () => window.renderHome();
  }
  if (navSmall) {
    navSmall.textContent = t('stats_page_title');
    navSmall.classList.add('visible');
    navSmall.style.cursor = 'default';
    navSmall.onclick = null;
  }
  if (navActions) navActions.innerHTML = '';

  document.getElementById('tab-nav')?.style.setProperty('display', 'none');

  const fab = document.getElementById('home-fab');
  if (fab) fab.style.display = 'none';

  const screenContent = document.getElementById('screen-content');
  if (screenContent) {
    screenContent.innerHTML = buildStatsHTML();
  }
}
