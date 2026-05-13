import { state, getProj, getActivePart, getEditingPartId, getTodayKey, getDailyLog, calcTotalDays } from './state.js';
import { esc } from './ui.js';
import { saveData } from './storage.js';
import { renderTaskSlide, refreshBottomBar,
         renderFilterToggle,
         renderSpillHTML, getProjColor, getUnitLabel } from './stitch.js';
import { setPageView } from './main.js';
import { renderHighlightReel } from './highlight.js';
import { getProjImage } from './image.js';
import { t, term } from './i18n.js';

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

    document.getElementById("tab-nav")?.style.setProperty("display", "flex");

    const totalProjs = state.data.projects.length;
    const totalNeedles = state.data.projects.reduce((sum, p) =>
      sum + (p.parts || []).reduce((s, pt) =>
        s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0), 0);

    const todayCount = getDailyLog()[getTodayKey()] || 0;
    const totalDays = calcTotalDays();

    const largeTitleWrap = document.getElementById('large-title-wrap');
    if (largeTitleWrap) {
      largeTitleWrap.style.display = '';
      const moti = todayCount === 0
        ? `<div class="stats-card-moti">${t('home_empty_moti')}</div>`
        : '';
      largeTitleWrap.innerHTML = `
        <div class="stats-card">
          <div class="stats-card-appname">${t('app_name')}</div>
          <div class="stats-card-label">${t('home_today_label')}</div>
          <div class="stats-today-number">${todayCount.toLocaleString()}</div>
          <div class="stats-unit">${term('stitches')}</div>
          ${moti}
          <div class="stats-card-row">
            <span class="stats-card-stat">${t('home_total_stitches').replace('{count}', `<strong>${totalNeedles.toLocaleString()}</strong>`)}</span>
            <span class="stats-card-sep"></span>
            <span class="stats-card-stat">${t('home_total_projects').replace('{count}', `<strong>${totalProjs}</strong>`)}</span>
            <span class="stats-card-sep"></span>
            <span class="stats-card-stat">${t('home_total_days').replace('{count}', `<strong>${totalDays}</strong>`)}</span>
          </div>
        </div>
      `;
    }

    let html = '';

    const activeProjs = state.data.projects.filter(p => !p.archived);
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
      const allNeedles = (p.parts || []).reduce((s, pt) => s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0);
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
        const allNeedles = (p.parts || []).reduce((s, pt) => s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0);
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

    html += `
    <div class="home-footer">
      <button class="home-new-btn" onclick="showNewProjectDialog()">
        ${t('home_new_project_btn')}
      </button>
    </div>`;

    document.getElementById("screen-content").innerHTML = html;
    document.getElementById("bottom-bar")?.style.setProperty("display", "none");
  } catch (e) {
    alert('renderHome error: ' + e.message + '\n' + e.stack);
  }
}


export function renderProject() {
  // 编辑模式下禁止 DOM 重构，避免打断输入焦点
  if (window.editingPartId !== null) return;

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
  const part = getActivePart(proj);
  const unit = getUnitLabel(proj);

  if (navActions) {
    navActions.innerHTML = `
      <button class="nav-btn nav-toggle-mode" onclick="toggleRowTerms()" aria-label="${t('toggle_row_terms')}">
        <span class="toggle-mode-dot">◉</span> <span class="toggle-mode-label">${unit}</span>
      </button>
      <button class="nav-btn" onclick="openSettings()" aria-label="${t('settings')}">⚙️</button>
    `;
  }

  document.getElementById("tab-nav")?.style.setProperty("display", "none");

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
    const exp = state.expandedRounds.has(r.id) || isActive;
    const total = r.seq.length;
    const dots = r.seq.slice(-8).map(sid => `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${getProjColor(sid)};margin-right:2px"></span>`).join("");

    html += `<div class="round-card" id="round-${r.id}">
    <div class="round-hdr" onclick="toggleRound('${r.id}')">
      <div class="round-badge${isActive ? " active" : ""}" onclick="event.stopPropagation();setActiveRound(null,'${r.id}')" style="cursor:pointer" title="${t('set_as_current').replace('{unit}', unit)}">${r.isTextCard ? "文" : (r.roundNum === 0 ? "起" : (r.roundNum != null ? r.roundNum : i + 1))}</div>
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
    if (r.seq.length === 0) {
      html += `<span class="seq-empty">${t('empty_round_hint')}</span>`;
    } else {
      r.seq.forEach((sid, idx) => {
        html += renderSpillHTML(sid, idx, r, proj);
      });
    }
    html += `</div>`;
    html += `</div></div>`;
  });

  html += `</div>`;
  document.getElementById("screen-content").innerHTML = html;

  const bar = document.getElementById("bottom-bar");
  if (bar) bar.style.display = "block";
  refreshBottomBar(proj);
  const barH = bar ? bar.offsetHeight : 0;
  if (barH) document.documentElement.style.setProperty('--bottom-bar-h', barH + 'px');
  renderHighlightReel(proj);
}
