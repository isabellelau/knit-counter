import zhLocale from './locales/zh.js';
import enLocale from './locales/en.js';
import { STITCH_TERMS } from './locales/terms.js';

const UI_LANGS = { zh: zhLocale, en: enLocale };

function detectLang() {
  const saved = localStorage.getItem('knit_lang');
  if (saved && UI_LANGS[saved]) return saved;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return UI_LANGS[browser] ? browser : 'zh';
}

let currentLang = detectLang();

export function t(key) {
  return UI_LANGS[currentLang]?.[key]
    ?? UI_LANGS['zh']?.[key]
    ?? key;
}

export function term(sid) {
  return STITCH_TERMS[currentLang]?.[sid]
    ?? STITCH_TERMS['zh']?.[sid]
    ?? sid;
}

export function setLang(lang) {
  if (!UI_LANGS[lang]) return;
  currentLang = lang;
  localStorage.setItem('knit_lang', lang);
}

export function getLang() {
  return currentLang;
}

export const SUPPORTED_LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
];
