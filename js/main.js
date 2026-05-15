import { STITCH_LIB, COLOR_THEMES, OLD_ID_MAP, ALIAS_TO_ID, STITCHES, SM, parsePattern, extractStitches, normalizeStitch, resolveColor } from '../stitches.js';
import { state, NUMBER_MAP, uid, getProj, getActivePart, isPartEmpty, getEditingPartId } from './state.js';
import { saveData, loadData, migrateData, exportPDF, exportData, exportSingleProject, checkStorageQuota } from './storage.js';
import { esc, showToast, showSheet, closeSheet, showEntryChoiceSheet, showConfirmDialog, confirmDialog, closeDialog } from './ui.js';
import { playSound, initRecognition, toggleVoiceMode, setVoicePulse, updateVoiceButton, openVoiceTutorial } from './voice.js';
import { openSettings, renderSettings, changeTheme, changeStitchTheme, toggleVoiceDefault, toggleVoiceSound, toggleHighlightEnabled, clearAllData, navigateToSubPage, goBackFromSubPage, editProfileName, pickProfileAvatar, showAvatarSheet, openGlobalStitchLibrary, openGlobalStitchCustomize, saveGlobalStitchCustomize, resetGlobalStitchCustomize, deleteGlobalCustomStitch, openGlobalNewStitchForm, saveGlobalNewStitch } from './settings.js';
import {
  startImportFlow, startManualFlow, dismissEntryChoice,
  toggleSelectAllInSetup, startImportFromSetup,
  openPatternPasteSheet, cancelPasteSheet, handleParsePattern,
  showLoading, hideLoading, loadTesseract, handleOCR,
  openParseConfirmSheet, removeParsedItem, confirmImport,
  updateCurrentPart, addNewPart, normalizeRoundNums,
  startStitchOnlyFlow,
} from './pattern.js';
import {
  getUnitLabel, toggleRowTerms, getProjColor, renderSpillHTML, renderTaskSlide,
  editExpectedCount, renderDynamicPalette, toggleFilterByRound, renderFilterToggle,
  renderBarRow, pushStitch, undoStitch, stitchTap, changeStitch, deleteStitch,
  startInsert, doInsert, openStitchSetup, toggleSetupStitch, openStitchCustomize,
  saveStitchCustomize, resetStitchCustomize, backToSetupGrid, openNewStitchForm,
  saveNewStitch, deleteCustomStitch, saveProjectStitches, closeSetupSheet,
  triggerEdgeGlow, openInstructionEdit, saveRoundInstruction,
  toggleHighlightMode, updateHighlightButton, updateImmersiveButton,
  toggleImmersiveMode, renderImmersive, renderToggleRow,
  goNextRound, refreshBottomBar,
  instrEditorInsert, instrEditorInsertNum, instrEditorInsertSymbol,
  instrEditorBackspace, instrEditorClear, instrEditorConfirm, instrEditorToggleKB,
  openMultiRoundEditor, instrEditorPrevRound, instrEditorNextRound, instrEditorConfirmMulti,
  openMarkerSheet, openMarkersReviewSheet, saveMarker, removeMarker, markerSelectColor,
  copyRoundStructure
} from './stitch.js';
import {
  addRound, addRoundBlank, toggleRound, deleteRound, undoDeleteRound, setActiveRound
} from './round.js';
import {
  addPart, switchPart, renamePart, deletePart, startEditPartName,
  partNameBlur, handleEditBtnClick, handleDeleteBtnClick
} from './part.js';
import {
  showNewProjectDialog, openProject, renameProject, deleteProject, toggleProjMenu,
  archiveProject, showArchiveSuccessSheet, unarchiveProject, importData,
  handlePwaHintOptOut, showPwaTutorial,
  startFocusSession, tickFocusSession, flushFocusSession,
  getTotalFocusTime, formatFocusTime, getTodayFocusTime, getTodayStitchCount,
  bumpDailyCount
} from './project.js';
import { pickCover, setProjectCover, removeProjectCover, addRefImage, removeRefImage, getRefImage, showRefImagesSheet, openRefImageViewer, pickRefImages } from './image.js';
import { handleGenerateShare, showShareSheet, downloadShareImage, shareImageNative } from './share.js';
import { openShareSheet, openImportShareSheet } from './share-pattern.js';
import { openAnnotator, saveAnnotation } from './annotator.js';
import { expandInstruction, getNextStitchSid, renderHighlightReel } from './highlight.js';
import { renderHome, renderProject } from './render.js';
import { t, term, setLang, getLang, setNotation, getNotationKey, SUPPORTED_LANGS, getShowSymbol, setShowSymbol } from './i18n.js';

let _onboardStep = 0;
const ONBOARD_KEY = 'knit_onboarded_v1';

window.state = state;

export function setPageView(view) {
  document.documentElement.classList.remove('home-view', 'settings-view');
  if (view) document.documentElement.classList.add(view);
}

// ── navigation ──
function goHome() {
  if (window._isAnnotatorOpen && window._isAnnotatorOpen()) {
    window._exitAnnotator(() => _doGoHome());
    return;
  }
  _doGoHome();
}

function _doGoHome() {
  document.documentElement.classList.remove('ipad-split');
  const splitLeft = document.getElementById('ipad-split-left');
  if (splitLeft) splitLeft.remove();

  if (state.voiceMode) {
    state.flowState.voiceState = 'off';
    if (state.recognition) {
      try { state.recognition.abort(); } catch (_) {}
      state.recognition = null;
    }
    state.voiceMode = false;
    setVoicePulse(false);
    updateVoiceButton();
  }
  if (state.immersiveMode) {
    state.immersiveMode = false;
  }
  const navBar = document.getElementById('nav-bar');
  if (navBar) navBar.style.display = '';
  document.documentElement.classList.remove('immersive-mode');
  flushFocusSession();
  setPageView('home-view');
  state.curProjId = null; state.expandedRounds.clear(); state.selectedStitch = null;
  state.highlightMode = false;
  state.highlightIndex = 0;
  state.flowState.projMenuId = null;
  document.getElementById("bottom-bar")?.style.setProperty("display", "none");
  document.getElementById("tab-nav")?.style.setProperty("display", "");
  state.currentTab = 'projects';
  updateTabNav();
  const screen = document.getElementById("screen");
  screen.classList.add("enter-back");
  screen.addEventListener("animationend", () => screen.classList.remove("enter-back"), { once: true });
  renderHome();
}

function switchTab(tab) {
  if (state.currentTab === tab) return;
  if (tab === 'settings') flushFocusSession();
  state.currentTab = tab;
  updateTabNav();

  const content = document.getElementById('screen-content');
  if (content) {
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.18s';
  }

  requestAnimationFrame(() => {
    if (tab === 'projects') {
      renderHome();
    } else if (tab === 'settings') {
      renderSettings();
    }
    if (content) {
      requestAnimationFrame(() => {
        content.style.opacity = '1';
      });
    }
  });
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
  addRound, addRoundBlank, toggleRound, deleteRound, undoDeleteRound, setActiveRound,
  pushStitch, undoStitch, stitchTap,
  changeStitch, deleteStitch, startInsert, doInsert,
  showSheet, closeSheet, openPatternPasteSheet,
  handleParsePattern, handleOCR, removeParsedItem, confirmImport, updateCurrentPart, addNewPart,
  showLoading, hideLoading, loadTesseract,
  startImportFlow, startManualFlow, startStitchOnlyFlow, dismissEntryChoice,
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
  openVoiceTutorial, toggleImmersiveMode, goNextRound,
  renderDynamicPalette, renderFilterToggle, renderToggleRow, renderBarRow, triggerEdgeGlow, openInstructionEdit, saveRoundInstruction, refreshBottomBar,
  instrEditorInsert, instrEditorInsertNum, instrEditorInsertSymbol, instrEditorBackspace, instrEditorClear, instrEditorConfirm, instrEditorToggleKB,
  openMultiRoundEditor, instrEditorPrevRound, instrEditorNextRound, instrEditorConfirmMulti,
  toggleHighlightMode, updateHighlightButton, updateImmersiveButton,
  openSettings, changeTheme, changeStitchTheme, toggleVoiceDefault, toggleVoiceSound, toggleHighlightEnabled, clearAllData,
  switchTab, renderSettings, updateTabNav,
  navigateToSubPage, goBackFromSubPage,
  editProfileName, pickProfileAvatar, showAvatarSheet,
  openGlobalStitchLibrary, openGlobalStitchCustomize, saveGlobalStitchCustomize, resetGlobalStitchCustomize, deleteGlobalCustomStitch, openGlobalNewStitchForm, saveGlobalNewStitch,
  editExpectedCount,
  pickCover, setProjectCover, removeProjectCover, addRefImage, removeRefImage, getRefImage, showRefImagesSheet, openRefImageViewer, pickRefImages,
  handleGenerateShare, showShareSheet, downloadShareImage, shareImageNative,
  openShareSheet, openImportShareSheet,
  startFocusSession, tickFocusSession, flushFocusSession, getTotalFocusTime, formatFocusTime, getTodayFocusTime, getTodayStitchCount, bumpDailyCount,
  expandInstruction, getNextStitchSid, renderHighlightReel,
  setPageView,
  t, term, setLang, getLang, setNotation, getNotationKey, getShowSymbol, setShowSymbol,
  onboardNext,
  initStaticText,
  openMarkerSheet, openMarkersReviewSheet, saveMarker, removeMarker, markerSelectColor,
  copyRoundStructure,
  openAnnotator, saveAnnotation
};
Object.entries(_globals).forEach(([k, v]) => { window[k] = v; });

function initStaticText() {
  // Page title
  document.title = t('app_name');
  // Nav bar
  const navBack = document.querySelector('.nav-back-label');
  if (navBack) navBack.textContent = t('nav_back');
  // Tab nav
  const tabProj = document.querySelector('#tab-projects .tab-label');
  if (tabProj) tabProj.textContent = t('tab_projects');
  const tabSet = document.querySelector('#tab-settings .tab-label');
  if (tabSet) tabSet.textContent = t('tab_settings');
  // Loading
  const loadingText = document.getElementById('loading-text');
  if (loadingText) loadingText.textContent = t('loading');
  // Dialog
  const dlgTitle = document.getElementById('dlg-title');
  if (dlgTitle) dlgTitle.textContent = t('new_project');
  const dlgInput = document.getElementById('dlg-input');
  if (dlgInput) dlgInput.placeholder = t('project_name_placeholder');
  const dlgBtns = document.querySelectorAll('#dialog .dialog-btn');
  if (dlgBtns[0]) dlgBtns[0].textContent = t('cancel');
  if (dlgBtns[1]) dlgBtns[1].textContent = t('confirm');
  // Onboarding
  const obTitle1 = document.querySelector('.onboard-slide:nth-child(1) .onboard-title');
  if (obTitle1) obTitle1.textContent = t('onboard_step1_title');
  const obDesc1 = document.querySelector('.onboard-slide:nth-child(1) .onboard-desc');
  if (obDesc1) obDesc1.textContent = t('onboard_step1_desc');
  const obMockCount = document.querySelector('.onboard-mock-count');
  if (obMockCount) obMockCount.textContent = t('onboard_step2_label');
  const obTitle2 = document.querySelector('.onboard-slide:nth-child(2) .onboard-title');
  if (obTitle2) obTitle2.textContent = t('onboard_step2_title');
  const obDesc2 = document.querySelector('.onboard-slide:nth-child(2) .onboard-desc');
  if (obDesc2) obDesc2.textContent = t('onboard_step2_desc');
  const obAppName = document.querySelector('.onboard-app-name');
  if (obAppName) obAppName.textContent = t('app_name');
  const obTitle3 = document.querySelector('.onboard-slide:nth-child(3) .onboard-title');
  if (obTitle3) obTitle3.textContent = t('onboard_step3_title');
  const obDesc3 = document.querySelector('.onboard-slide:nth-child(3) .onboard-desc');
  if (obDesc3) obDesc3.textContent = t('onboard_step3_desc');
  const obBtn = document.getElementById('onboard-btn');
  if (obBtn) obBtn.textContent = t('onboard_next');
}
initStaticText();


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

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.curProjId) {
    flushFocusSession();
  }
});

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
    if (btn) btn.textContent = t('onboard_start');
  }
}

function initOnboarding() {
  const el = document.getElementById('onboarding');
  if (!el) return;
  if (localStorage.getItem(ONBOARD_KEY)) {
    el.classList.add('done');
  }
}

