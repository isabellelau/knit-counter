import { state, getProj, clearDailyLog } from './state.js';
import { showConfirmDialog, showToast, closeSheet } from './ui.js';
import { saveData, checkStorageQuota } from './storage.js';
import { getProjColor, ALL_THEMES } from './stitch.js';
import { COLOR_THEMES } from '../stitches.js';
import { setPageView } from './main.js';
import { removeProjectCover } from './image.js';

let _settingsStack = [];
let _settingsMode = 'page'; // 'page' | 'sheet'

const SUBPAGE_TITLES = {
  color: '配色设置',
  permissions: '系统权限',
  data: '数据管理',
  advanced: '进阶功能',
  about: '关于'
};

// ── Sheet 版（从项目页头部按钮调用，保留兼容）──
export function openSettings() {
  _settingsMode = 'sheet';
  _settingsStack = [];
  const html = `<div class="settings-page" id="settings-page">${_buildSettingsListInnerHTML()}</div>`;
  document.getElementById("sheet").innerHTML = html;
  document.getElementById("sheet").classList.add("show");
  document.getElementById("overlay").classList.add("show");
}

// ── 全页版（从 Tab Bar 切换调用）──
export function renderSettings() {
  setPageView('settings-view');
  _settingsMode = 'page';
  document.getElementById("bottom-bar")?.style.setProperty("display", "none");

  _resetNavBarToSettingsRoot();

  _settingsStack = [];
  _renderSettingsList();
}

function _resetNavBarToSettingsRoot() {
  const navBar    = document.getElementById('nav-bar');
  const navBack   = document.getElementById('nav-back');
  const navSmall  = document.getElementById('nav-small-title');
  const navActions = document.getElementById('nav-actions');
  const largeTitleEl = document.getElementById('large-title-text');
  const largeSubEl   = document.getElementById('large-title-sub');
  const largeTitleWrap = document.getElementById('large-title-wrap');

  if (navBack)    { navBack.classList.remove('visible'); navBack.onclick = null; }
  if (navBar)     navBar.classList.remove('hidden');
  if (navSmall)   { navSmall.textContent = '设置'; navSmall.classList.remove('visible'); navSmall.onclick = null; navSmall.style.cursor = ''; }
  if (navActions) navActions.innerHTML = '';

  if (largeTitleEl)  largeTitleEl.textContent = '设置';
  if (largeTitleEl)  largeTitleEl.contentEditable = 'false';
  if (largeSubEl)    largeSubEl.textContent = '';
  if (largeTitleWrap) largeTitleWrap.style.display = '';
}

// ═════════════════════════════════════
//  一级列表
// ═════════════════════════════════════

function _buildSettingsListInnerHTML() {
  const theme = state.data.settings.theme || 'morandi';
  const themeName = theme === 'morandi' ? '莫兰迪' : theme === 'night' ? '夜色' : '跟随系统';

  return `
    <div class="settings-list">
      <div class="settings-row" onclick="navigateToSubPage('color')">
        <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">🎨</div>
        <span class="settings-row-label">配色设置</span>
        <div class="settings-row-extra">
          <span class="settings-row-value">${themeName}</span>
          <span class="settings-row-chevron">›</span>
        </div>
      </div>

      <div class="settings-row" onclick="navigateToSubPage('permissions')">
        <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">🔒</div>
        <span class="settings-row-label">系统权限</span>
        <div class="settings-row-extra">
          <span class="settings-row-chevron">›</span>
        </div>
      </div>

      <div class="settings-row" onclick="navigateToSubPage('data')">
        <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">🗂</div>
        <span class="settings-row-label">数据管理</span>
        <div class="settings-row-extra">
          <span class="settings-row-value">${state.data.projects.length} 个项目</span>
          <span class="settings-row-chevron">›</span>
        </div>
      </div>

      <div class="settings-row" onclick="navigateToSubPage('advanced')">
        <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">⚡</div>
        <span class="settings-row-label">进阶功能</span>
        <div class="settings-row-extra">
          <span class="settings-badge-pro">PRO</span>
          <span class="settings-row-chevron">›</span>
        </div>
      </div>

      <div class="settings-row" onclick="navigateToSubPage('about')">
        <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">ℹ️</div>
        <span class="settings-row-label">关于</span>
        <div class="settings-row-extra">
          <span class="settings-row-chevron">›</span>
        </div>
      </div>
    </div>
  `;
}

function _buildSettingsListHTML() {
  return `<div class="settings-page" id="settings-page">${_buildSettingsListInnerHTML()}</div>`;
}

function _getContentRoot() {
  if (_settingsMode === 'sheet') {
    return document.getElementById('sheet');
  }
  return document.getElementById('screen-content');
}

function _renderSubPageIntoRoot(html, animClass) {
  const root = _getContentRoot();
  const key = _settingsStack[_settingsStack.length - 1];
  let subhead = '';
  if (key) {
    const title = SUBPAGE_TITLES[key] || '';
    subhead = `
    <div class="settings-subhead">
      <button class="settings-subhead-back" onclick="goBackFromSubPage()">
        <span style="font-size:18px;line-height:1">‹</span>
        <span>设置</span>
      </button>
      <div class="settings-subhead-title">${title}</div>
    </div>`;
  }

  if (_settingsMode === 'sheet') {
    root.innerHTML = `<div class="settings-page ${animClass}" id="settings-page">${subhead}${html}</div>`;
    const page = document.getElementById('settings-page');
    if (page) {
      page.addEventListener('animationend', () => page.classList.remove(animClass), { once: true });
    }
  } else {
    const wrapper = document.createElement('div');
    wrapper.className = `settings-page ${animClass}`;
    wrapper.innerHTML = subhead + html;
    root.innerHTML = '';
    root.appendChild(wrapper);
    wrapper.addEventListener('animationend', () => wrapper.classList.remove(animClass), { once: true });
  }
}

function _renderSettingsList(animDir) {
  const html = _buildSettingsListHTML();
  const content = document.getElementById('screen-content');
  content.innerHTML = html;

  if (animDir) {
    const page = document.getElementById('settings-page');
    if (page) {
      page.classList.add(animDir);
      page.addEventListener('animationend', () => page.classList.remove(animDir), { once: true });
    }
  }
}

// ═════════════════════════════════════
//  二级子页导航
// ═════════════════════════════════════

export function navigateToSubPage(key) {
  _settingsStack.push(key);

  const title = SUBPAGE_TITLES[key] || '';

  if (_settingsMode === 'page') {
    const lt = document.getElementById('large-title-wrap');
    if (lt) lt.style.display = 'none';

    const navBack  = document.getElementById('nav-back');
    const navSmall = document.getElementById('nav-small-title');
    const navActions = document.getElementById('nav-actions');
    if (navBack) {
      navBack.classList.add('visible');
      navBack.onclick = () => goBackFromSubPage();
    }
    if (navSmall) {
      navSmall.textContent = title;
      navSmall.classList.add('visible');
      navSmall.onclick = null;
      navSmall.style.cursor = 'default';
    }
    if (navActions) navActions.innerHTML = '';
  }

  let subHTML;
  switch (key) {
    case 'color':
      subHTML = _buildColorSubPageHTML();
      break;
    case 'permissions':
      subHTML = _buildPlaceholderSubPageHTML('系统权限', '🔒', '麦克风权限管理、通知设置等将在此处配置');
      break;
    case 'data':
      subHTML = _buildDataSubPageHTML();
      checkStorageQuota();
      break;
    case 'advanced':
      subHTML = _buildAdvancedSubPageHTML();
      break;
    case 'about':
      subHTML = _buildAboutSubPageHTML();
      break;
    default:
      _settingsStack.pop();
      return;
  }

  _renderSubPageIntoRoot(subHTML, 'forward');
}

export function goBackFromSubPage() {
  if (_settingsStack.length === 0) return;
  _settingsStack.pop();

  if (_settingsMode === 'page') {
    if (_settingsStack.length === 0) {
      _resetNavBarToSettingsRoot();
      _renderSettingsList('back');
    } else {
      _renderSubPageIntoRoot(_buildSettingsListInnerHTML(), 'back');
    }
  } else {
    // sheet mode
    const listHTML = `<div class="settings-page back" id="settings-page">${_buildSettingsListInnerHTML()}</div>`;
    document.getElementById('sheet').innerHTML = listHTML;
    const page = document.getElementById('settings-page');
    if (page) {
      page.addEventListener('animationend', () => page.classList.remove('back'), { once: true });
    }
  }
}

// ═════════════════════════════════════
//  子页：配色设置
// ═════════════════════════════════════

function _buildColorSubPageHTML() {
  const uiTheme = state.data.settings.theme || 'morandi';
  const stitchTheme = state.data.settings.stitchTheme || 'morandi';
  const dotIds = ['X', 'V', 'A', 'CH'];

  const UI_THEME_META = {
    morandi: { name: '莫兰迪',   sub: '浅色 · 暖调', dots: ['#C9969F', '#FFFFFF', '#F5E6E8', '#2D1E20'] },
    night:   { name: '夜色',     sub: '深色 · 暗调', dots: ['#C4909A', '#3D2D30', '#4A2D32', '#F2E8E9'] },
    system:  { name: '跟随系统', sub: '自动切换',     dots: ['#F5E6E8', '#FFFFFF', '#3D2D30', '#2A2123'] }
  };

  // 针法配色方案：从 COLOR_THEMES + ALL_THEMES 收集所有 key
  const stitchKeys = [...new Set([
    ...Object.keys(COLOR_THEMES || {}),
    ...Object.keys(ALL_THEMES || {})
  ])];

  const STITCH_META = {
    morandi: { name: '暖煦', sub: '莫兰迪暖调' },
    night:   { name: '沉影', sub: '夜色冷调' },
    float:   { name: '浮光', sub: '清透淡彩' }
  };

  function resolveDotColor(tKey, sid) {
    if (ALL_THEMES[tKey] && ALL_THEMES[tKey][sid]) return ALL_THEMES[tKey][sid];
    if (COLOR_THEMES[tKey] && COLOR_THEMES[tKey][sid]) return COLOR_THEMES[tKey][sid];
    return (COLOR_THEMES.morandi && COLOR_THEMES.morandi[sid]) ? COLOR_THEMES.morandi[sid] : '#A8A29E';
  }

  function _renderCards(keys, metaMap, activeKey, onClickFn, dataAttr) {
    return keys.map(tKey => {
      const meta = metaMap[tKey] || { name: tKey, sub: '' };
      const isActive = activeKey === tKey;
      const dotColors = meta.dots || dotIds.map(sid => resolveDotColor(tKey, sid));
      const dots = dotColors.map(c => `<span class="settings-theme-card-dot" style="background:${c}"></span>`).join('');
      return `
        <div class="settings-theme-card${isActive ? ' active' : ''}" ${dataAttr}="${tKey}" onclick="${onClickFn}('${tKey}')">
          <div class="settings-theme-card-dots">${dots}</div>
          <div class="settings-theme-card-label">${meta.name}</div>
          <div class="settings-theme-card-sub">${meta.sub}</div>
        </div>`;
    }).join('');
  }

  return `
    <div class="settings-section-hd">界面主题</div>
    <div class="settings-section-desc" style="padding:0 16px 8px;font-size:var(--text-caption1);color:var(--muted)">切换整体 UI 配色</div>
    <div class="settings-theme-card-grid col3">
      ${_renderCards(Object.keys(UI_THEME_META), UI_THEME_META, uiTheme, 'changeTheme', 'data-theme')}
    </div>

    <div class="settings-section-hd">针法配色</div>
    <div class="settings-section-desc" style="padding:0 16px 8px;font-size:var(--text-caption1);color:var(--muted)">仅影响针法胶囊颜色，不影响 UI 主题</div>
    <div class="settings-theme-card-grid col3">
      ${_renderCards(stitchKeys, STITCH_META, stitchTheme, 'changeStitchTheme', 'data-stitch-theme')}
    </div>

    <div class="settings-section-desc settings-section-desc--bottom">
      在项目内点击针法按钮右上角的 ✎ 可自定义
    </div>
  `;
}

// ═════════════════════════════════════
//  针法配色切换（独立于 UI 主题）
// ═════════════════════════════════════

export function changeStitchTheme(themeKey) {
  state.data.settings.stitchTheme = themeKey;
  saveData();

  // 更新针法配色卡片选中态
  const cards = document.querySelectorAll('.settings-theme-card[data-stitch-theme]');
  cards.forEach(c => c.classList.remove('active'));
  const targets = document.querySelectorAll(`.settings-theme-card[data-stitch-theme="${themeKey}"]`);
  targets.forEach(c => c.classList.add('active'));

  // 如果在项目页，刷新底部调色板和针法颜色
  if (state.curProjId) {
    window.renderProject();
  }
}

// ═════════════════════════════════════
//  子页：系统权限（占位）
// ═════════════════════════════════════

function _buildPlaceholderSubPageHTML(title, icon, desc) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:var(--muted);gap:12px;padding:40px 16px;text-align:center">
      <div style="font-size:40px;opacity:.5">${icon}</div>
      <div style="font-size:var(--text-footnote);line-height:1.6">${desc}</div>
    </div>
  `;
}

// ═════════════════════════════════════
//  子页：数据管理
// ═════════════════════════════════════

function _buildDataSubPageHTML() {
  const totalProjs = state.data.projects.length;
  const totalNeedles = state.data.projects.reduce((sum, p) =>
    sum + (p.parts || []).reduce((s, pt) =>
      s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0), 0);

  return `
    <div class="settings-section-hd">统计</div>
    <div class="settings-stat" style="text-align:left;padding:4px 16px 12px">当前 ${totalProjs} 个项目 · 累计 ${totalNeedles.toLocaleString()} 针</div>

    <div class="settings-section-hd">操作</div>
    <div class="settings-btn-row">
      <button class="settings-btn settings-btn-secondary" onclick="exportData()">📤 导出备份</button>
      <label class="settings-btn settings-btn-secondary" style="display:block;text-align:center">
        📥 导入备份
        <input type="file" accept="application/json,.json" style="display:none" onchange="importData(this)">
      </label>
      <button class="settings-btn settings-btn-danger" onclick="clearAllData()">🗑 清空所有数据</button>
    </div>
  `;
}

// ═════════════════════════════════════
//  子页：进阶功能
// ═════════════════════════════════════

function _buildAdvancedSubPageHTML() {
  const enabled = state.data.settings.highlightEnabled ?? false;

  return `
    <div class="settings-section-hd">针法辅助</div>

    <div class="settings-row" onclick="toggleHighlightEnabled()" style="cursor:pointer">
      <div class="settings-row-icon" style="background:var(--accent-bg);color:var(--accent)">✦</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:var(--text-body);color:var(--text);display:flex;align-items:center;gap:8px">
          智能高亮当前针
          <span class="highlight-pro-badge-inline">PRO</span>
        </div>
        <div style="font-size:var(--text-caption1);color:var(--muted);margin-top:2px">每次只高亮下一针，其他针法降低亮度</div>
      </div>
      <span class="settings-toggle${enabled ? ' on' : ''}" id="settings-highlight-toggle">
        <i class="settings-toggle-knob"></i>
      </span>
    </div>

    <div class="settings-section-desc settings-section-desc--bottom">
      开启后在底部针法面板自动聚焦当前需钩织的下一针
    </div>
  `;
}

export function toggleHighlightEnabled() {
  const enabled = !state.data.settings.highlightEnabled;
  state.data.settings.highlightEnabled = enabled;
  state.highlightMode = enabled;
  state.highlightIndex = 0;
  saveData();

  const el = document.getElementById('settings-highlight-toggle');
  if (el) el.classList.toggle('on', enabled);

  // 如果在项目页，刷新底部调色板
  if (state.curProjId) {
    window.renderProject();
  }

  showToast(enabled ? '智能高亮已开启 · 长按可关闭' : '智能高亮已关闭');
}

// ═════════════════════════════════════
//  子页：关于
// ═════════════════════════════════════

function _buildAboutSubPageHTML() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;gap:8px">
      <div style="font-size:48px">🧶</div>
      <div style="font-size:var(--text-title3);font-weight:var(--weight-semibold);color:var(--text)">织影</div>
      <div style="font-size:var(--text-footnote);color:var(--muted)">v0.1</div>
    </div>

    <div class="settings-section-hd" style="text-align:center">安装</div>
    <div class="settings-btn-row">
      <button class="settings-btn settings-btn-primary" onclick="showPwaTutorial()">📲 安装到主屏幕</button>
    </div>
  `;
}

// ═════════════════════════════════════
//  主题切换
// ═════════════════════════════════════

export function changeTheme(themeKey) {
  state.data.settings.theme = themeKey;
  const html = document.documentElement;
  html.classList.remove('theme-light', 'theme-dark');
  if (themeKey === 'morandi') {
    html.classList.add('theme-light');
  } else if (themeKey === 'night') {
    html.classList.add('theme-dark');
  }
  saveData();

  // 如果是在配色子页中，更新卡片选中态
  const cards = document.querySelectorAll('.settings-theme-card');
  cards.forEach(c => c.classList.remove('active'));
  const targets = document.querySelectorAll(`.settings-theme-card[data-theme="${themeKey}"]`);
  targets.forEach(c => c.classList.add('active'));

  // 如果在项目页，刷新底部调色板
  if (state.curProjId) {
    const proj = getProj(state.curProjId);
    if (proj) {
      const bar = document.getElementById("bottom-bar");
      if (bar) {
        let bhtml = window.renderDynamicPalette(proj);
        bhtml += window.renderFilterToggle();
        bhtml += window.renderBarRow();
        bar.innerHTML = bhtml;
        window.updateVoiceButton();
      }
    }
  }
}

// ═════════════════════════════════════
//  语音设置（保留现有逻辑）
// ═════════════════════════════════════

export function toggleVoiceDefault() {
  state.data.settings.voiceEnabled = !state.data.settings.voiceEnabled;
  saveData();
  const el = document.getElementById('settings-voice-toggle');
  if (el) el.classList.toggle('on');
}

export function toggleVoiceSound() {
  state.data.settings.voiceSoundEnabled = !state.data.settings.voiceSoundEnabled;
  saveData();
  const el = document.getElementById('settings-voice-sound-toggle');
  if (el) el.classList.toggle('on');
}

export function clearAllData() {
  showConfirmDialog("确定要清空所有数据吗？此操作不可恢复。", async (ok) => {
    if (!ok) return;
    await Promise.all(state.data.projects.map(p => removeProjectCover(p.id)));
    state.data.projects = [];
    await saveData();
    clearDailyLog();
    if (state.curProjId) {
      window.goHome();
    } else {
      window.renderHome();
    }
    showToast("所有数据已清空");
  });
}
