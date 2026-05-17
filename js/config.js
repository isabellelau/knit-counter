// ─────────────────────────────────────────
// 发布控制：提交 App Store 前将 proMode 改为 'locked'
// ─────────────────────────────────────────
export const FEATURES = {
  proMode: 'all',       // 'all' = 全开 | 'locked' = PRO 锁定
  buildTarget: 'app',   // 'app' | 'pages'（Pages 版构建时替换）
};

export function isPro() {
  return FEATURES.proMode === 'all';
}

export function isPages() {
  return FEATURES.buildTarget === 'pages';
}
