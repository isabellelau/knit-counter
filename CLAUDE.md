# 织影（ZhiYing）— Claude Code 工作上下文

## 当前分支：capacitor-prep

本分支目标：为 Capacitor 打包和 TestFlight 提交做准备。
不涉及新功能开发，只做适配层和基础设施改造。

---

## 项目基本信息

- **应用名称**: 织影（ZhiYing）—— 钩织针法追踪 App
- **技术栈**: 原生 JS (ES Modules)，无构建步骤，无框架
- **架构**: 事件驱动 + 领域模块化，伪 SPA（DOM 整体替换）
- **状态管理**: 全局单例 `state`（`js/state.js`），通过 `saveData()` 持久化
- **样式**: 单文件 `styles.css`（~3500 行），CSS 变量主题系统
- **国际化**: `js/i18n.js` + `js/locales/{zh,en,terms}.js`

---

## 目录结构

```
knit/
├── index.html
├── styles.css
├── sw.js                   # Service Worker（Pages 版用，Capacitor 版跳过）
├── manifest.json
├── stitches.js             # 针法库定义
├── js/
│   ├── main.js             # 入口 + _globals 注册 + 全局错误兜底
│   ├── state.js            # 全局状态
│   ├── storage.js          # 数据持久化（当前：IndexedDB，本分支：拆适配层）
│   ├── config.js           # PRO 功能开关（本分支新增）
│   ├── utils.js            # escapeHtml 等工具函数（本分支新增）
│   ├── ui.js               # Toast / Sheet / Dialog
│   ├── render.js           # 页面渲染
│   ├── project.js          # 项目管理
│   ├── stitch.js           # 针法操作
│   ├── round.js            # 圈/行操作
│   ├── part.js             # 部件操作
│   ├── pattern.js          # 图解导入 / OCR
│   ├── voice.js            # 语音模式（本分支：加 Capacitor 适配层）
│   ├── voice-intent.js     # 语音意图解析 L1/L2
│   ├── image.js            # 图片处理
│   ├── annotator.js        # 图片标注
│   ├── highlight.js        # 流式模式
│   ├── share.js            # 分享图片生成
│   ├── share-pattern.js    # KNIT1 格式导出/导入
│   ├── i18n.js
│   ├── stats.js
│   └── locales/
│       ├── zh.js
│       ├── en.js
│       └── terms.js
```

---

## 本分支已完成的工作（main 分支合并过来）

以下内容已完成验证，本分支不要重复修改：

- **XSS 防护**：`js/utils.js` 的 `escapeHtml()`，全项目 innerHTML 插值已覆盖
- **数据迁移安全**：`migrateData()` 加了原子性保护、上界检查、导入前强制迁移
- **内存泄漏修复**：annotator Canvas GPU 释放、voice SpeechRecognition 销毁、image 大图限制
- **全局错误兜底**：`main.js` 的 `unhandledrejection` + `error` 监听器
- **_globals 收拢**：从 132 个精简到 70 个，所有 `window.xxx` 赋值统一管理
- **PRO 开关**：`js/config.js`，`isPro()` 控制 L1/L2 路由、流式模式、统计页、KNIT1 导出
- **SW 注册保护**：仅在 `location.protocol === 'https:'` 时注册

---

## 本分支待完成的任务

### 任务 1：storage 适配层拆分（最高优先级）

**背景**：iOS WKWebView 会在存储压力下随机清除 IndexedDB，Capacitor 版必须改用原生存储。

**目标结构**：
```
js/
  storage.js              ← 改为路由层（环境检测 + 分发）
  adapters/
    storage-idb.js        ← 现有 IndexedDB 逻辑搬过来（Pages 版 / 浏览器版）
    storage-cap.js        ← 新写 Capacitor Preferences + Filesystem 适配
```

**关键约束**：
- `storage.js` 对外导出的函数签名不变（`saveData`、`loadData`、`exportData` 等）
- 调用方（`main.js`、`project.js` 等）零改动
- 环境检测：`window.Capacitor?.isNativePlatform()` 为 true 走 cap 适配，否则走 idb 适配
- 主数据（JSON）→ Capacitor Preferences plugin（`@capacitor/preferences`）
- 封面图 / 参考图 / 标注数据（Blob）→ Capacitor Filesystem plugin（`@capacitor/filesystem`）
- 迁移逻辑（`migrateData()`）保留在 `storage.js` 路由层，两个适配层都复用同一份迁移

**已安装插件**（确认 package.json）：
- `@capacitor/core`
- `@capacitor/preferences`
- `@capacitor/filesystem`

### 任务 2：voice.js 适配层

**背景**：`webkitSpeechRecognition` 在 WKWebView 中不存在，需要接 Capacitor 语音插件。

**关键约束**：
- `handleVoiceResult(text, isFinal)` 往下的所有逻辑**一行不动**
- 只改 `initRecognition()` 和 `toggleVoiceMode()` 中的输入源
- 双路分支：Capacitor 环境走插件，浏览器环境走现有 Web Speech API（Pages 版保留）
- 插件：`@capacitor-community/speech-recognition`

### 任务 3：字体本地化

**背景**：`index.html` 引用了 CDN 的 LXGW WenKai 字体，离线不可用。

- 下载 woff2 到 `assets/fonts/`
- 改为 `@font-face` 本地引用
- 在 `sw.js` 预缓存列表中加入字体文件（Pages 版）

### 任务 4：Capacitor App 生命周期

**背景**：`beforeunload` 在 Capacitor 中不可靠。

- 在 `main.js` 中加入 `App.addListener('pause', ...)` 触发 `flushFocusSession()`
- 仅在 Capacitor 环境下注册，浏览器环境保留现有 `beforeunload`

### 任务 5：AudioContext resume()

- 在 `voice.js` 的 `toggleVoiceMode()` 开启分支中加 `await _audioCtx.resume()`
- 防止 iOS 首次 `playSound()` 静默失败

---

## 重要规范（每次修改前必读）

### 样式
- **只改 `styles.css`**，不在任何 JS 或 HTML 中新增 CSS

### 全局函数
- HTML `onclick` 调用的函数必须在 `js/main.js` 的 `_globals` 中注册
- 模块间调用直接 import，不通过 `window`
- 新增全局函数流程：模块 export → main.js import → 加入 `_globals`

### 翻译
- 新增文案必须同时在 `js/locales/zh.js` 和 `js/locales/en.js` 中添加

### 数据结构
- 新增字段必须：在 `js/state.js` 定义默认值 + 在 `js/storage.js` 的 `migrateData()` 添加迁移 + bump `LATEST_SCHEMA`

### XSS
- 所有用户输入插入 innerHTML 时必须用 `escapeHtml()`（来自 `js/utils.js`）
- `t()` / `term()` 返回值、sid、数字不需要转义

### PRO 功能
- 新增 PRO 功能在入口处 `import { isPro } from './config.js'` 并加门禁
- 不在 `config.js` 之外硬编码任何 pro 判断

---

## 部署架构

| 版本 | 运行环境 | 存储 | 语音 | SW | PRO |
|------|---------|------|------|----|-----|
| App Store 版 | Capacitor / WKWebView | Capacitor Preferences + Filesystem | SFSpeechRecognizer（插件） | 不运行 | `config.js` 控制 |
| TestFlight 版 | 同上 | 同上 | 同上 | 不运行 | 全开（`proMode: 'all'`） |
| Pages 版 | 浏览器 | IndexedDB | Web Speech API | 运行 | 无 PRO 内容（独立分支） |

**发布切换**：提交 App Store 前只需改 `js/config.js` 第一行：
```javascript
proMode: 'locked',  // 从 'all' 改为 'locked'
```

---

## 当前 schema 版本

`LATEST_SCHEMA = 16`（`js/storage.js`）

版本历史见 `js/storage.js` 文件头注释。

---

## 不在本分支处理的内容

- SW 更新竞态（搁置，Pages 版影响有限）
- Pages 版 PRO 代码删除（等 App 版稳定后独立任务）
- TypeScript 迁移（TestFlight 后再做）
- iCloud 同步（未来 PRO 功能）
- 详细统计页 PRO 遮罩重构（现有实现保持不变）
