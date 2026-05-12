import { STITCH_LIB, COLOR_THEMES, OLD_ID_MAP, ALIAS_TO_ID, STITCHES, SM, parsePattern, extractStitches, normalizeStitch, resolveColor } from '../stitches.js';
import { state, NUMBER_MAP, uid, getProj, getActivePart, isPartEmpty, getEditingPartId } from './state.js';
import { saveData, loadData, migrateData, exportPDF, exportData, exportSingleProject, checkStorageQuota } from './storage.js';
import { esc, showToast, showSheet, closeSheet, showEntryChoiceSheet, showConfirmDialog, confirmDialog, closeDialog } from './ui.js';
import { playSound, initRecognition, toggleVoiceMode, setVoicePulse, updateVoiceButton, openVoiceTutorial } from './voice.js';
import { openSettings, renderSettings, changeTheme, changeStitchTheme, toggleVoiceDefault, toggleVoiceSound, toggleHighlightEnabled, clearAllData, navigateToSubPage, goBackFromSubPage } from './settings.js';
import {
  startImportFlow, startManualFlow, dismissEntryChoice,
  toggleSelectAllInSetup, startImportFromSetup,
  openPatternPasteSheet, cancelPasteSheet, handleParsePattern,
  showLoading, hideLoading, loadTesseract, handleOCR,
  openParseConfirmSheet, removeParsedItem, confirmImport,
  updateCurrentPart, addNewPart, normalizeRoundNums
} from './pattern.js';
import {
  getUnitLabel, toggleRowTerms, getProjColor, renderSpillHTML, renderTaskSlide,
  editExpectedCount, renderDynamicPalette, toggleFilterByRound, renderFilterToggle,
  renderBarRow, pushStitch, undoStitch, stitchTap, changeStitch, deleteStitch,
  startInsert, doInsert, openStitchSetup, toggleSetupStitch, openStitchCustomize,
  saveStitchCustomize, resetStitchCustomize, backToSetupGrid, openNewStitchForm,
  saveNewStitch, deleteCustomStitch, saveProjectStitches, closeSetupSheet,
  triggerEdgeGlow, openInstructionEdit, saveRoundInstruction,
  toggleHighlightMode, updateHighlightButton
} from './stitch.js';
import {
  addRound, toggleRound, deleteRound, undoDeleteRound, setActiveRound
} from './round.js';
import {
  addPart, switchPart, renamePart, deletePart, startEditPartName,
  partNameBlur, handleEditBtnClick, handleDeleteBtnClick
} from './part.js';
import {
  showNewProjectDialog, openProject, renameProject, deleteProject, toggleProjMenu,
  archiveProject, showArchiveSuccessSheet, unarchiveProject, importData,
  handlePwaHintOptOut, showPwaTutorial
} from './project.js';
import { pickCover, setProjectCover, removeProjectCover } from './image.js';
import { expandInstruction, getNextStitchSid, renderHighlightReel } from './highlight.js';
import { renderHome, renderProject } from './render.js';

let _onboardStep = 0;
const ONBOARD_KEY = 'knit_onboarded_v1';

window.state = state;

export function setPageView(view) {
  document.documentElement.classList.remove('home-view', 'settings-view');
  if (view) document.documentElement.classList.add(view);
}

// ── navigation ──
function goHome() {
  setPageView('home-view');
  state.curProjId = null; state.expandedRounds.clear(); state.selectedStitch = null;
  state.highlightMode = false;
  state.highlightIndex = 0;
  state.flowState.projMenuId = null;
  document.getElementById("bottom-bar")?.style.setProperty("display", "none");
  document.getElementById("tab-nav")?.style.setProperty("display", "flex");
  state.currentTab = 'projects';
  updateTabNav();
  const screen = document.getElementById("screen");
  screen.classList.add("enter-back");
  screen.addEventListener("animationend", () => screen.classList.remove("enter-back"), { once: true });
  renderHome();
}

function switchTab(tab) {
  state.currentTab = tab;
  updateTabNav();
  if (tab === 'projects') {
    renderHome();
  } else if (tab === 'settings') {
    renderSettings();
  }
}

function updateTabNav() {
  const projBtn = document.getElementById('tab-projects');
  const setBtn = document.getElementById('tab-settings');
  if (projBtn) projBtn.classList.toggle('active', state.currentTab === 'projects');
  if (setBtn) setBtn.classList.toggle('active', state.currentTab === 'settings');
}

function initScrollBehavior() {
  const screen   = document.getElementById('screen');
  const navBar   = document.getElementById('nav-bar');
  const navSmall = document.getElementById('nav-small-title');
  const largeTitleWrap = document.getElementById('large-title-wrap');

  // 大标题消失时显示小标题（首页用）
  if (largeTitleWrap && navSmall) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          navSmall.classList.remove('visible');
        } else {
          navSmall.classList.add('visible');
        }
      },
      { root: screen, threshold: 0 }
    );
    observer.observe(largeTitleWrap);
  }

  // 项目页：向下滚隐藏 nav-bar，向上滚显示
  let lastY = 0;
  if (screen) {
    screen.addEventListener('scroll', () => {
      // 只在项目页生效（nav-back visible 说明在项目页）
      const navBack = document.getElementById('nav-back');
      if (!navBack || !navBack.classList.contains('visible')) {
        lastY = screen.scrollTop;
        return;
      }
      const scrollTop = screen.scrollTop;

      // 滚到顶部强制显示
      if (scrollTop <= 0) {
        navBar.classList.remove('hidden');
        lastY = 0;
        return;
      }

      const delta = scrollTop - lastY;
      if (delta < -8) {
        navBar.classList.remove('hidden');
      } else if (delta > 4) {
        navBar.classList.add('hidden');
      }
      lastY = scrollTop;
    }, { passive: true });
  }
}

document.getElementById("dlg-input").addEventListener("keydown", e => {
  if (e.key === "Enter") confirmDialog();
});
document.getElementById("dialog").addEventListener("keydown", e => {
  if (e.key === "Escape") closeDialog();
});

// ═══════════════════════════════════════════
//  暴露全局函数（供 HTML onclick 使用）
// ═══════════════════════════════════════════
const _globals = {
  goHome, openProject, exportPDF, exportData, exportSingleProject, importData, checkStorageQuota,
  showNewProjectDialog, showConfirmDialog, confirmDialog, closeDialog, deleteProject,
  renderProject, renderHome,
  addRound, toggleRound, deleteRound, undoDeleteRound, setActiveRound,
  pushStitch, undoStitch, stitchTap,
  changeStitch, deleteStitch, startInsert, doInsert,
  showSheet, closeSheet, openPatternPasteSheet,
  handleParsePattern, handleOCR, removeParsedItem, confirmImport, updateCurrentPart, addNewPart,
  showLoading, hideLoading, loadTesseract,
  startImportFlow, startManualFlow, dismissEntryChoice,
  toggleSelectAllInSetup, startImportFromSetup, cancelPasteSheet,
  normalizeRoundNums,
  renameProject,
  openStitchSetup, toggleSetupStitch, saveProjectStitches, closeSetupSheet,
  showEntryChoiceSheet,
  toggleFilterByRound, toggleRowTerms, getUnitLabel,
  openStitchCustomize, saveStitchCustomize, resetStitchCustomize, backToSetupGrid,
  openNewStitchForm, saveNewStitch, deleteCustomStitch,
  addPart, switchPart, renamePart, deletePart,
  startEditPartName, partNameBlur, getEditingPartId, handleEditBtnClick, handleDeleteBtnClick,
  toggleProjMenu, archiveProject, showArchiveSuccessSheet, handlePwaHintOptOut, showPwaTutorial, unarchiveProject,
  toggleVoiceMode, updateVoiceButton, setVoicePulse, playSound,
  openVoiceTutorial,
  renderDynamicPalette, renderFilterToggle, renderBarRow, triggerEdgeGlow, openInstructionEdit, saveRoundInstruction,
  toggleHighlightMode, updateHighlightButton,
  openSettings, changeTheme, changeStitchTheme, toggleVoiceDefault, toggleVoiceSound, toggleHighlightEnabled, clearAllData,
  switchTab, renderSettings, updateTabNav,
  navigateToSubPage, goBackFromSubPage,
  editExpectedCount,
  pickCover, setProjectCover, removeProjectCover,
  expandInstruction, getNextStitchSid, renderHighlightReel,
  setPageView,
  onboardNext
};
Object.entries(_globals).forEach(([k, v]) => { window[k] = v; });


document.getElementById("tab-nav")?.style.setProperty("display", "flex");
// 恢复上次的主题设置
const savedTheme = state.data?.settings?.theme || 'morandi';
const html = document.documentElement;
html.classList.remove('theme-light', 'theme-dark');
if (savedTheme === 'morandi') {
  html.classList.add('theme-light');
} else if (savedTheme === 'night') {
  html.classList.add('theme-dark');
}
initOnboarding();
await loadData();
initScrollBehavior();
renderHome();

// ===== Onboarding =====

function onboardNext() {
  const total = 3;
  _onboardStep++;

  if (_onboardStep >= total) {
    localStorage.setItem(ONBOARD_KEY, '1');
    const el = document.getElementById('onboarding');
    if (el) el.classList.add('done');
    return;
  }

  const slides = document.getElementById('onboard-slides');
  if (slides) {
    slides.style.transform = `translateX(-${_onboardStep * (100/3)}%)`;
  }

  const dots = document.querySelectorAll('.onboard-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('onboard-dot--active', i === _onboardStep);
  });

  if (_onboardStep === total - 1) {
    const btn = document.getElementById('onboard-btn');
    if (btn) btn.textContent = '开始使用';
  }
}

function initOnboarding() {
  const el = document.getElementById('onboarding');
  if (!el) return;
  if (localStorage.getItem(ONBOARD_KEY)) {
    el.classList.add('done');
  }
}

