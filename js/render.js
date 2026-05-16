import { state, getProj, getActivePart, getEditingPartId } from './state.js';
import { esc } from './ui.js';
import { saveData } from './storage.js';
import { renderTaskSlide, refreshBottomBar,
         renderFilterToggle,
         renderSeqHTML, getProjColor, getUnitLabel, countSeqStitches } from './stitch.js';
import { setPageView } from './main.js';
import { renderHighlightReel } from './highlight.js';
import { getProjImage, getRefImage } from './image.js';
import { t, term } from './i18n.js';
import { getTotalFocusTime, formatFocusTime, getTodayStitchCount } from './project.js';

const COVER_COLORS = [
  '#EAD8DA', '#E6D7CF', '#D8CFC7', '#D8D0DA', '#D3D9D1'
];

function getCoverColor(projectId) {
  return COVER_COLORS[projectId % COVER_COLORS.length];
}

function getProjectInitial(name) {
  return name?.trim()?.[0]?.toUpperCase() || '🧶';
}

export async function renderHome() {
  try {
    document.documentElement.classList.remove('in-project');

    // --- Nav Bar：首页状态 ---
    setPageView('home-view');
    const navBar       = document.getElementById('nav-bar');
    const navBack      = document.getElementById('nav-back');
    const navSmall     = document.getElementById('nav-small-title');
    const navActions   = document.getElementById('nav-actions');

    if (navBack)    { navBack.classList.remove('visible'); navBack.onclick = () => window.goHome(); }
    if (navBar)     navBar.classList.remove('hidden');
    if (navSmall)   { navSmall.textContent = t('app_name'); navSmall.classList.remove('visible'); navSmall.onclick = null; }
    if (navActions) navActions.innerHTML = '';

    document.getElementById("tab-nav")?.style.setProperty("display", "");

    const activeProjs = state.data.projects.filter(p => !p.archived);

    const largeTitleWrap = document.getElementById('large-title-wrap');
    if (largeTitleWrap) {
      largeTitleWrap.style.display = '';

      const totalProjsCount = activeProjs.length;
      const totalNeedlesAll = state.data.projects.reduce((sum, p) =>
        sum + (p.parts || []).reduce((s, pt) =>
          s + (pt.rounds || []).reduce((ss, r) => ss + countSeqStitches(r.seq), 0), 0), 0);

      let todayStitchesAll = 0;
      let totalFocusAll = 0;
      state.data.projects.forEach(p => {
        todayStitchesAll += getTodayStitchCount(p);
        totalFocusAll += getTotalFocusTime(p);
      });

      const moti = todayStitchesAll === 0
        ? `<div class="stats-card-moti">${t('home_empty_moti')}</div>`
        : '';
      largeTitleWrap.innerHTML = `
        <div class="stats-card">
          <div class="stats-card-appname">${t('app_name')}</div>
          <div class="stats-card-label">${t('home_today_label')}</div>
          <div class="stats-today-number">${todayStitchesAll.toLocaleString()}</div>
          <div class="stats-unit">${term('stitches')}</div>
          ${moti}
          <div class="stats-card-row">
            <span class="stats-card-stat">${t('home_total_stitches').replace('{count}', `<strong>${totalNeedlesAll.toLocaleString()}</strong>`)}</span>
            <span class="stats-card-sep"></span>
            <span class="stats-card-stat">${t('home_total_projects').replace('{count}', `<strong>${totalProjsCount}</strong>`)}</span>
            <span class="stats-card-sep"></span>
            <span class="stats-card-stat">${t('home_stats_focus')} <strong>${formatFocusTime(totalFocusAll)}</strong></span>
          </div>
          <button class="stats-detail-btn" onclick="openStatsPage()">${t('stats_detail_btn')}</button>
        </div>
      `;
    }

    let html = '';

    const archivedProjs = state.data.projects.filter(p => p.archived);

    const coverMap = new Map();
    const allProjs = [...activeProjs, ...archivedProjs];
    await Promise.all(allProjs.map(async p => {
      const cover = await getProjImage(p.id);
      if (cover) coverMap.set(p.id, cover);
    }));

    html += `<div class="proj-list">`;
    if (activeProjs.length === 0 && archivedProjs.length === 0) {
      html += `<div style="text-align:center;color:var(--muted);font-size:14px;padding:40px 16px">${t('home_empty')}</div>`;
    }
    activeProjs.forEach(p => {
      const allRounds = (p.parts || []).reduce((s, pt) => s + (pt.rounds?.length || 0), 0);
      const allNeedles = (p.parts || []).reduce((s, pt) => s + (pt.rounds || []).reduce((ss, r) => ss + countSeqStitches(r.seq), 0), 0);
      const coverImg = coverMap.get(p.id) || null;
      const coverHtml = coverImg
        ? `<img class="proj-thumb" src="${coverImg}" alt="">`
        : `<div class="proj-thumb proj-thumb--fallback"
             style="background:${getCoverColor(p.id)}">
             ${getProjectInitial(p.name)}
           </div>`;

      html += `
    <div class="proj-card" onclick="openProject('${p.id}')">
      ${coverHtml}
      <div class="proj-info">
        <div class="proj-name">${p.name}</div>
        <div class="proj-meta">
          ${(p.parts||[]).length} ${term('part')} ·
          ${allRounds} ${term('round')} ·
          ${allNeedles} ${term('stitches')}
        </div>
      </div>
      <button class="proj-more" onclick="toggleProjMenu('${p.id}', event)"
              aria-label="${t('more_actions')}">···</button>
    </div>`;
    });
    html += `</div>`;

    // 已归档项目
    if (archivedProjs.length > 0) {
      html += `<div style="padding:16px 12px 4px">
      <div class="home-heading" style="margin-bottom:8px;opacity:.7">${t('home_archived_section')} (${archivedProjs.length})</div>
    </div>`;
      html += `<div class="proj-list">`;
      archivedProjs.forEach(p => {
        const allRounds = (p.parts || []).reduce((s, pt) => s + (pt.rounds?.length || 0), 0);
        const allNeedles = (p.parts || []).reduce((s, pt) => s + (pt.rounds || []).reduce((ss, r) => ss + countSeqStitches(r.seq), 0), 0);
        const coverImgArc = coverMap.get(p.id) || null;
        const coverHtmlArc = coverImgArc
          ? `<img class="proj-thumb" src="${coverImgArc}" alt="">`
          : `<div class="proj-thumb proj-thumb--fallback"
               style="background:${getCoverColor(p.id)}">
               ${getProjectInitial(p.name)}
             </div>`;

        html += `
    <div class="proj-card archived" onclick="openProject('${p.id}')">
      ${coverHtmlArc}
      <div class="proj-info">
        <div class="proj-name">${p.name}</div>
        <div class="proj-meta">
          ${(p.parts||[]).length} ${term('part')} ·
          ${allRounds} ${term('round')} ·
          ${allNeedles} ${term('stitches')}
        </div>
      </div>
      <button class="proj-more" onclick="toggleProjMenu('${p.id}', event)"
              aria-label="${t('more_actions')}">···</button>
    </div>`;
      });
      html += `</div>`;
    }

    document.getElementById("screen-content").innerHTML = html;
    document.getElementById("bottom-bar")?.style.setProperty("display", "none");

    // FAB + notch: visible on home
    const fab = document.getElementById('home-fab');
    const tabNav = document.getElementById('tab-nav');
    if (fab) fab.style.display = '';
    if (tabNav) tabNav.classList.add('has-notch');
  } catch (e) {
    alert('renderHome error: ' + e.message + '\n' + e.stack);
  }
}


export function renderProject() {
  // 编辑模式下禁止 DOM 重构，避免打断输入焦点
  if (window.editingPartId !== null) return;

  document.documentElement.classList.add('in-project');

  // 恢复在 blur 之前捕获的编辑状态
  window.editingPartId = state.flowState.captureEdit || window.editingPartId;
  state.flowState.captureEdit = null;

  // --- Nav Bar：项目页状态 ---
  const navBar       = document.getElementById('nav-bar');
  const navBack      = document.getElementById('nav-back');
  const navSmall     = document.getElementById('nav-small-title');
  const navActions   = document.getElementById('nav-actions');
  const largeTitleEl = document.getElementById('large-title-text');
  const largeSubEl   = document.getElementById('large-title-sub');
  const proj         = getProj(state.curProjId);

  if (navBack)  { navBack.classList.add('visible'); navBack.onclick = () => window.goHome(); }
  if (navBar)   navBar.classList.remove('hidden');
  if (navSmall) {
    navSmall.textContent = proj ? proj.name : '';
    navSmall.classList.add('visible');
    navSmall.onclick = () => {
      if (!proj) return;
      document.getElementById('dlg-title').textContent = t('rename_project');
      document.getElementById('dlg-input').value = proj.name;
      document.getElementById('dlg-input').placeholder = t('project_name_placeholder');
      document.getElementById('dlg-input').style.display = '';
      document.getElementById('dlg-msg').style.display = 'none';
      state.dlgCallback = (newName) => {
        const trimmed = newName.trim();
        if (trimmed) {
          proj.name = trimmed;
          proj.lastModified = Date.now();
          saveData();
          navSmall.textContent = trimmed;
          const lt = document.getElementById('large-title-text');
          if (lt) lt.textContent = trimmed;
        }
      };
      state.confirmCallback = null;
      document.getElementById('dialog').classList.add('show');
      setTimeout(() => document.getElementById('dlg-input').focus(), 100);
    };
    navSmall.style.cursor = 'pointer';
  }
  if (largeSubEl) largeSubEl.textContent = '';

  const largeTitleWrap = document.getElementById('large-title-wrap');
  if (largeTitleWrap) largeTitleWrap.style.display = 'none';

  if (!proj) return window.goHome();

  // ── iPad 横屏分栏布局 ──
  const isSplit = window.matchMedia('(min-width: 768px) and (orientation: landscape)').matches;
  if (isSplit) {
    document.documentElement.classList.add('ipad-split');
    _renderSplitLeft(proj);
  } else {
    document.documentElement.classList.remove('ipad-split');
    const left = document.getElementById('ipad-split-left');
    if (left) left.remove();
  }

  const part = getActivePart(proj);
  const unit = getUnitLabel(proj);

  if (navActions) {
    navActions.innerHTML = `
      <button class="nav-btn" onclick="showRefImagesSheet('${proj.id}')" aria-label="${t('ref_images_title')}">🖼</button>
      <button class="nav-btn" onclick="openProjectSettings()" aria-label="${t('project_settings')}">⚙︎</button>
    `;
  }

  document.getElementById("tab-nav")?.style.setProperty("display", "none");
  const fab = document.getElementById('home-fab');
  const tabNav = document.getElementById('tab-nav');
  if (fab) fab.style.display = 'none';
  if (tabNav) tabNav.classList.remove('has-notch');

  // 活跃圈 id：以 activeRoundId 为准，找不到则 fallback 到最后一圈
  const activeRid = part && part.rounds.length ? (part.rounds.find(r => r.id === part.activeRoundId)?.id || part.rounds[part.rounds.length - 1].id) : null;

  let html = "";

  // ── 部件选项卡 ──
  html += `<div class="part-tabs-wrap" id="part-tabs-wrap">
      <div class="part-tabs-scroll" onmousedown="state.flowState.captureEdit=getEditingPartId()">`;
  (proj.parts || []).forEach(pt => {
    const isActive = pt.id === (part?.id || proj.activePartId);
    const isEditing = pt.id === window.editingPartId;
    html += `<button class="part-tab${isActive ? " active" : ""}"
      onclick="switchPart('${pt.id}')"
      title="${esc(pt.title)}">
      <span class="part-name-text" style="${isEditing ? 'display:none' : ''}">${esc(pt.title)}</span>
      <input class="part-name-input" value="${esc(pt.title)}"
        style="${isEditing ? '' : 'display:none'}"
        onclick="event.stopPropagation()"
        onfocus="this.setSelectionRange(this.value.length, this.value.length)"
        onblur="partNameBlur(this, '${pt.id}')"
        onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">
      <span class="part-tab-edit-icon" onclick="handleEditBtnClick(event, '${pt.id}', this)" style="font-size:11px;cursor:pointer;opacity:.6;margin-left:2px" title="${isEditing ? t('finish_edit_name') : t('edit_part_name')}">${isEditing ? '✔' : '✎'}</span>
      ${(proj.parts||[]).length > 1 ? `<span class="part-tab-del" onclick="handleDeleteBtnClick(event, '${pt.id}')" title="${t('delete_part')}">×</span>` : ''}
    </button>`;
  });
  html += `<button class="part-tab part-tab-add" onclick="addPart()" title="${t('add_part')}">＋</button>
      </div></div>`;

  html += `<div class="sticky-wrap">`;
  html += renderTaskSlide(proj);

  html += `<div id="highlight-reel-container"></div>`;
  html += `</div>`;

  html += `<div class="rounds-wrap">`;
  if (part) part.rounds.forEach((r, i) => {
    const isActive = r.id === activeRid;
    const isLoop = r.isLoopMarker;
    const exp = state.expandedRounds.has(r.id) || isActive;
    const total = countSeqStitches(r.seq);
    const dots = r.seq.slice(-8).map(sid => `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${getProjColor(sid)};margin-right:2px"></span>`).join("");

    const roundMarkers = (proj.markers || []).filter(m => m.roundId === r.id);
    let markerDotsHtml = '';
    if (roundMarkers.length > 0) {
      markerDotsHtml = '<span class="round-hdr-markers">';
      roundMarkers.slice(0, 3).forEach(m => {
        markerDotsHtml += `<span class="round-hdr-marker-dot" style="background:${m.color}"></span>`;
      });
      const overflow = roundMarkers.length - 3;
      if (overflow > 0) markerDotsHtml += `<span class="round-hdr-marker-more">+${overflow}</span>`;
      markerDotsHtml += '</span>';
    }

    if (isLoop) {
      // ── 循环标记卡片 ──
      const loopFrom = r.loopFrom || '?';
      const loopTo = r.loopTo || '?';
      html += `<div class="round-card round-card--loop" id="round-${r.id}">
    <div class="round-hdr" onclick="toggleRound('${r.id}')">
      <div class="round-badge round-badge--loop${isActive ? " active" : ""}" onclick="event.stopPropagation();setActiveRound(null,'${r.id}')" style="cursor:pointer" title="${t('set_as_current').replace('{unit}', unit)}">↻</div>
      ${markerDotsHtml}
      <div class="round-info">
        <div class="round-label">${esc(r.instruction || t('loop_marker_label').replace('{from}', loopFrom).replace('{to}', loopTo))}${isActive ? ` <span style='font-size:11px;font-weight:var(--weight-semibold);background:var(--accent);color:#fff;border-radius:6px;padding:2px 7px;margin-left:6px'>${term('active')}</span>` : ""}</div>
        <div class="round-count">${t('round_count_label').replace('{total}', total)} ${dots}</div>
      </div>
      <button class="round-edit-btn" onclick="event.stopPropagation();openInstructionEdit('${r.id}')" title="${t('edit_instruction')}" style="font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;padding:2px 6px;white-space:nowrap"><span style="font-size:13px;color:var(--muted);letter-spacing:1px;">🪡</span></button>
      <button class="round-del" onclick="event.stopPropagation();deleteRound('${r.id}')" title="${t('delete_round').replace('{unit}', unit)}">×</button>
      <span class="round-chev${exp ? " open" : ""}">›</span>
    </div>
    <div class="round-body${exp ? " open" : ""}">
      <div style="padding:8px 12px;text-align:center">
        <button class="bar-btn" style="border-style:dashed;border-color:var(--accent);color:var(--accent);width:100%;padding:10px"
          onclick="copyRoundStructure('${r.id}')">↻ ${t('copy_structure_btn')}</button>
      </div>
      <div class="seq-wrap">`;
      html += renderSeqHTML(r, proj);
      html += `</div>
    </div></div>`;
    } else {
      html += `<div class="round-card" id="round-${r.id}">
    <div class="round-hdr" onclick="toggleRound('${r.id}')">
      <div class="round-badge${isActive ? " active" : ""}${r.source === 'auto' ? " round-badge--auto" : ""}" onclick="event.stopPropagation();setActiveRound(null,'${r.id}')" style="cursor:pointer" title="${t('set_as_current').replace('{unit}', unit)}">${r.source === 'auto' ? '注' : (r.isTextCard ? "文" : (r.roundNum === 0 ? "起" : (r.roundNum != null ? r.roundNum : i + 1)))}</div>
      ${markerDotsHtml}
      <div class="round-info">
        <div class="round-label">${r.isTextCard ? (r.instruction || t('note')) : (r.roundNum === 0 ? term('cast_on') : t('round_label').replace('{n}', r.roundNum != null ? r.roundNum : i + 1).replace('{unit}', unit))}${isActive ? ` <span style='font-size:11px;font-weight:var(--weight-semibold);background:var(--accent);color:#fff;border-radius:6px;padding:2px 7px;margin-left:6px'>${term('active')}</span>` : ""}</div>
        <div class="round-count">${t('round_count_label').replace('{total}', total)} ${dots}</div>
      </div>
      <button class="round-edit-btn" onclick="event.stopPropagation();openInstructionEdit('${r.id}')" title="${t('edit_instruction')}" style="font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;padding:2px 6px;white-space:nowrap"><span style="font-size:13px;color:var(--muted);letter-spacing:1px;">🪡</span></button>
      <button class="round-del" onclick="event.stopPropagation();deleteRound('${r.id}')" title="${t('delete_round').replace('{unit}', unit)}">×</button>
      <span class="round-chev${exp ? " open" : ""}">›</span>
    </div>
    <div class="round-body${exp ? " open" : ""}">`;

    html += `<div class="seq-wrap">`;
    html += renderSeqHTML(r, proj);
    html += `</div>`;
    html += `</div></div>`;
    }
  });

  html += `</div>`;
  html += `<div class="float-state-pills" id="float-state-pills">
    <button class="float-pill ${state.immersiveMode ? 'active' : ''}"
      onclick="toggleImmersiveMode()" aria-label="${t('immersive_enter')}">专注</button>
    <button class="float-pill ${state.filterByRound ? 'active' : ''}"
      onclick="toggleFilterByRound()" aria-label="${t('filter_by_round')}">本圈</button>
  </div>`;
  document.getElementById("screen-content").innerHTML = html;

  const bar = document.getElementById("bottom-bar");
  if (bar) bar.style.display = "block";
  refreshBottomBar(proj);
  const barH = bar ? bar.offsetHeight : 0;
  if (barH) document.documentElement.style.setProperty('--bottom-bar-h', barH + 'px');
  renderHighlightReel(proj);
}

// ── iPad 横屏左栏参考图 ──

function _renderSplitLeft(proj) {
  const refKeys = Array.isArray(proj.refImages) ? [...proj.refImages] : [];

  let left = document.getElementById('ipad-split-left');
  if (!left) {
    left = document.createElement('div');
    left.id = 'ipad-split-left';
    document.body.prepend(left);
  }

  // 保留滑动索引
  const prevIndex = left._splitIndex || 0;
  const index = refKeys.length > 0 ? Math.min(prevIndex, refKeys.length - 1) : 0;
  left._splitIndex = index;
  left._splitKeys = refKeys;
  left._splitProjId = proj.id;

  // 空状态
  if (refKeys.length === 0) {
    left.innerHTML = `
      <div class="ipad-split-ref-empty" onclick="pickRefImages('${proj.id}')">
        <div class="ipad-split-ref-empty-icon">＋</div>
        <div>添加参考图</div>
      </div>`;
    return;
  }

  function _updateAnnotate() {
    const btn = left.querySelector('.ipad-split-annotate-btn');
    if (btn && left._splitKeys && left._splitKeys.length > 0) {
      btn.onclick = () => window.openAnnotator(left._splitProjId, left._splitKeys[left._splitIndex]);
    }
  }

  // 图片轨道
  let html = '<div class="ipad-split-ref-viewport">';
  html += `<div class="ipad-split-ref-track" style="transform:translateX(-${index * 100}%)">`;
  refKeys.forEach(key => {
    html += `<div class="ipad-split-ref-slide"><img src="" data-refkey="${key}" alt=""></div>`;
  });
  html += '</div>';
  if (refKeys.length > 1) {
    html += `<div class="ipad-split-ref-pagination">${index + 1}/${refKeys.length}</div>`;
  }
  html += '<button class="ipad-split-annotate-btn">✏️</button>';
  html += '</div>';

  left.innerHTML = html;
  _updateAnnotate();

  // 滑动切换
  const viewport = left.querySelector('.ipad-split-ref-viewport');
  let startX = 0;

  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) startX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', e => {
    const dx = (e.changedTouches[0]?.clientX || startX) - startX;
    if (Math.abs(dx) > 50 && left._splitKeys && left._splitKeys.length > 1) {
      if (dx < 0 && left._splitIndex < left._splitKeys.length - 1) {
        left._splitIndex++;
      } else if (dx > 0 && left._splitIndex > 0) {
        left._splitIndex--;
      }
      const track = left.querySelector('.ipad-split-ref-track');
      if (track) track.style.transform = `translateX(-${left._splitIndex * 100}%)`;
      const pag = left.querySelector('.ipad-split-ref-pagination');
      if (pag) pag.textContent = `${left._splitIndex + 1}/${left._splitKeys.length}`;
      _updateAnnotate();
    }
  });

  // 异步加载图片
  refKeys.forEach(key => {
    getRefImage(key).then(src => {
      if (!src) return;
      const img = left.querySelector(`img[data-refkey="${key}"]`);
      if (img) img.src = src;
    });
  });
}

window._renderSplitLeft = _renderSplitLeft;
