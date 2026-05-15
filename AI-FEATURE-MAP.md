# 织影 功能-代码映射报告

## 项目概览

- **应用名称**: 织影（ZhiYing）
- **技术栈**: 原生 JS (ES Modules) + PWA (Service Worker + Web Manifest)，无前端框架
- **架构模式**: 事件驱动 + 领域模块化（每个功能域一个 JS 文件），伪 SPA（DOM 整体替换实现页面切换）
- **状态管理**: 全局单例 `state` 对象 (`js/state.js`)，数据直接就地修改，通过 `saveData()` 持久化到 IndexedDB
- **样式方案**: 单文件 `styles.css`，CSS 自定义属性实现玫瑰灰莫兰迪主题，`html.theme-light` / `html.theme-dark` 类名控制深浅色
- **国际化**: `js/i18n.js` + `js/locales/{zh,en,terms}.js`，支持中英文 UI + 4 种针法符号体系
- **构建工具**: 无构建步骤，原生 ES Module 直接运行；`scripts/inject-version.js` 注入版本号到 HTML/SW
- **包管理**: 无（纯前端项目，Tesseract.js / html2canvas 动态 CDN 加载）
- **离线方案**: Service Worker (`sw.js`) 缓存优先策略 + Web App Manifest (`manifest.json`)
- **数据存储**: IndexedDB（主存储，`knit_db`）+ localStorage（每日计数器 + 旧版兼容）

## 功能模块统计

- **页面级视图**: 3 个（首页项目列表、项目详情页、设置页）+ Onboarding 引导页 + 设置子页面（外观/针法库/语言/数据/进阶）
- **可复用 UI 组件**: 4 个（Sheet 弹窗、Dialog 对话框、Toast 提示、Loading 遮罩）
- **业务逻辑模块**: 16 个 JS 文件（按领域拆分）
- **国际化文件**: 3 个（`locales/zh.js`、`locales/en.js`、`locales/terms.js`）
- **样式文件**: 1 个（`styles.css`，约 3500 行）
- **配置文件**: 2 个（`manifest.json`、`sw.js`）

## 目录结构概览

```
knit/
├── index.html              # 入口 HTML + SW 注册 + 更新提示
├── styles.css              # 全局样式（唯一样式来源，约 3500 行）
├── sw.js                   # Service Worker（离线缓存）
├── manifest.json           # PWA 配置
├── stitches.js             # 针法库（STITCH_LIB 定义 + 别名映射 + 图解解析器 + 颜色主题）
├── scripts/
│   └── inject-version.js   # 构建时版本号注入
├── knit-counter/           # 独立子项目（钩织计数器）
└── js/
    ├── main.js             # 入口模块 + 全局函数注册 + Onboarding 逻辑 + 滚动行为
    ├── state.js            # 全局状态 + 辅助函数 + 每日计数器
    ├── storage.js          # 数据持久化（IndexedDB 适配层 + 迁移逻辑 v1→v11）
    ├── ui.js               # 通用 UI 组件（Toast/Sheet/Dialog/EntryChoiceSheet）
    ├── render.js           # 页面渲染（首页统计卡片 / 项目详情 / iPad 分屏）
    ├── project.js          # 项目管理（新建/删除/归档/导入/PWA教程/专注计时）
    ├── stitch.js           # 针法操作（添加/撤销/修改/插入/调色板/任务进度/沉浸模式/记号扣/指令编辑器）
    ├── round.js            # 圈/行操作（增删切换/空白圈/循环标记）
    ├── part.js             # 部件操作（增删改切换）
    ├── pattern.js          # 图解导入（粘贴/OCR/解析确认）
    ├── voice.js            # 语音识别（Web Speech API + 音效）
    ├── image.js            # 图片处理（封面压缩/存取 + 参考图管理 + 参考图查看器）
    ├── annotator.js        # 图片标注工具（画笔/橡皮擦/颜色/撤销/缩放）
    ├── highlight.js        # 流式模式（指令分词器/下一针预测/高亮卷轴渲染）
    ├── i18n.js             # 国际化（UI 语言/针法符号体系切换）
    ├── share.js            # 分享图片生成（html2canvas 渲染分享卡片）
    ├── share-pattern.js    # 图解分享（文本复制 + KNIT1 格式导出/导入）
    └── locales/
        ├── zh.js           # 中文语言包
        ├── en.js           # 英文语言包
        └── terms.js        # 针法术语翻译表（4 种符号体系）
```


---

## 功能映射表

### 系统 - 主题系统（深色/浅色模式 + 针法颜色主题）

**用户描述方式**:
- 主要: "主题颜色"、"深色模式"、"浅色模式"、"夜间模式"、"针法配色"
- 别名: "theme"、"dark mode"、"配色方案"、"莫兰迪"、"夜色"、"浮梦"、"stitch theme"

**代码位置**:
- CSS 变量定义: `styles.css:8-132` — `:root`（浅色默认）、`@media (prefers-color-scheme: dark)`（跟随系统）、`html.theme-light`（强制浅色）、`html.theme-dark`（强制深色）
- UI 主题切换: `js/settings.js:717-742` — `changeTheme(themeKey)`，3 个选项（morandi / night / float）
- 针法颜色主题: `js/settings.js:391-474` — `changeStitchTheme(themeKey)`，独立于 UI 主题
- 针法颜色定义: `stitches.js:57-67` — `COLOR_THEMES.morandi`（玫瑰灰莫兰迪浅色语义分色）
- 针法颜色映射: `js/stitch.js:54-74` — `ALL_THEMES`（morandi: null → 基色 / night: 深色方案 / float: 浮梦淡彩方案）
- 初始化恢复: `js/main.js:162-169`
- 默认值: `js/state.js:9-10` — `settings.theme: "morandi"`、`settings.stitchTheme: "morandi"`
- 颜色解析: `js/stitch.js:80-98` — `getProjColor()`（按项目针法主题查找颜色）
- 设置页 UI: 外观子页面，6 个主题卡片（3 个 UI 主题 + 3 个针法颜色主题），各自显示颜色圆点预览

**视觉标识**:
- 玫瑰灰莫兰迪色系：`--bg: #FAF5F5`（暖粉底）、`--accent: #C9969F`（干枯玫瑰）
- 深色模式：`--bg: #2A2123`（深棕底）、`--accent: #C4909A`
- CSS 变量体系：`--bg`, `--bg-secondary`, `--card`, `--border`, `--border-strong`, `--text`, `--text-secondary`, `--muted`, `--accent`, `--accent-dark`, `--accent-bg`, `--danger`, `--danger-bg`, `--glass-bg`
- 设置页采用子页面导航，外观页包含 UI 主题和针法主题两组卡片
- 选中卡片有 `var(--accent)` 色边框高亮

**修改指引**:
- 修改浅色主题配色: 编辑 `styles.css:8-74` 的 `:root` 变量
- 修改深色主题配色: 编辑 `styles.css:76-99` 的 `@media (prefers-color-scheme: dark)` 块 和 `styles.css:117-132` 的 `html.theme-dark` 块
- 修改针法颜色（浅色）: 编辑 `stitches.js:57-67` 的 `COLOR_THEMES.morandi`
- 修改针法颜色（深色）: 编辑 `js/stitch.js:56-63` 的 `ALL_THEMES.night`
- 修改针法颜色（浮梦）: 编辑 `js/stitch.js:65-73` 的 `ALL_THEMES.float`
- 新增 UI 主题: 在 `js/settings.js` 的 themes 数组添加条目，在 `styles.css` 添加对应 CSS 类
- 新增针法颜色主题: 在 `js/stitch.js` 的 `ALL_THEMES` 添加，在 `js/settings.js` 的 stitchThemes 数组添加条目


### 界面元素 - iOS Nav Bar（顶部导航栏）

**用户描述方式**:
- 主要: "顶部导航栏"、"header"、"标题栏"、"nav bar"
- 别名: "iOS 导航栏"、"顶部栏"、"返回按钮区域"

**代码位置**:
- HTML 结构: `index.html:102-109` — `<header class="nav-bar">` 含 `nav-back`、`nav-small-title`、`nav-actions`
- 样式: `styles.css:183-289` — `.nav-bar`, `.nav-back`, `.nav-small-title`, `.nav-actions`, `.nav-btn`, `.nav-btn--pill`
- 首页/项目页状态切换: `js/render.js:24-39`（首页隐藏返回、显示 stats）、`js/render.js:172-260`（项目页显示返回、渲染操作按钮含参考图）
- 滚动隐藏行为（项目页）: `js/main.js:95-113` — 向下滚 >4px 隐藏 `.nav-bar.hidden`，向上滚 >4px 显示
- 大标题与小标题切换: `js/main.js:82-93` — IntersectionObserver 监听首页 stats 区域

**视觉标识**:
- 粘性定位顶部，毛玻璃半透明背景（`var(--glass-bg)` + `backdrop-filter: blur(12px)`）
- 高度 `calc(44px + env(safe-area-inset-top))`，补偿刘海/灵动岛
- 首页：返回按钮隐藏、中间小标题不显示、右侧无操作按钮
- 项目页：左侧"‹ 返回"按钮可见、中间显示项目名（点击可重命名）、右侧显示圈/行切换 + 设置 + PDF + 参考图按钮
- 首页滚过 stats 区域后，小标题"织影"淡入
- 项目页向下滚时整条 nav-bar 上移隐藏（`translateY(-100%)`），向上滚时重新出现

**修改指引**:
- 修改 nav-bar 高度: 编辑 `styles.css:190` — `height: calc(44px + env(safe-area-inset-top))`
- 修改毛玻璃效果: 编辑 `styles.css:192-194` 的 `background` 和 `backdrop-filter`
- 修改小标题文字: 首页 → `js/render.js:34`，项目页 → `js/render.js:162`
- 修改返回按钮文字/符号: 编辑 `index.html:103-106` 的 `nav-back-arrow` 和 `nav-back-label`
- 修改滚动隐藏阈值: 编辑 `js/main.js:106-108` 的 `>4` / `<4` 像素


### 界面元素 - 首页统计卡片

**用户描述方式**:
- 主要: "首页统计"、"今日针数"、"统计卡片"、"首页概览"
- 别名: "stats card"、"今日钩了多少针"、"累计统计"、"专注时长"

**代码位置**:
- 渲染: `js/render.js:22-168` — `renderHome()` 内统计卡片 HTML
- 样式: `styles.css:291-415` — `.home-stats`, `.home-stat-big`, `.home-stat-row`, `.home-stat-item`, `.home-stat-value`, `.home-stat-label`, `.home-motd`
- 今日针数: `js/render.js:43-50` — 从 `getDailyLog()` + `getTodayKey()` 计算
- 专注时长: `js/project.js:349-380` — `getTotalFocusTime(proj)` 汇总 focusSessions
- 统计文案: `js/render.js:48-49` — 总项目数/总针数/专注天数/专注时长
- 滚动联动: `js/main.js:82-93` — IntersectionObserver 监听 stats 区域与 nav small title 切换

**视觉标识**:
- 首页顶部应用名"织影"（34px 粗体）
- 大号今日针数数字（48px）+ "今日已钩" 标签
- 统计行：N 个项目 / 累计 N 针 / N 天专注 / N 分钟
- 每日一句激励语（随机）
- 只在首页显示，进入项目页后隐藏
- 顶部有 safe-area 补偿 padding

**修改指引**:
- 修改标题文字: 编辑 `js/render.js:37`
- 修改统计格式: 编辑 `js/render.js:48-49`
- 修改激励语: 编辑 locale 文件 `home_motd_*` 键
- 修改大数字字号: 编辑 `styles.css` 中 `.home-stat-big`


### 页面导航 - Onboarding 引导页

**用户描述方式**:
- 主要: "引导页"、"首次使用介绍"、"新手引导"、"欢迎页"
- 别名: "onboarding"、"入门引导"、"功能介绍卡片"

**代码位置**:
- HTML 结构: `index.html:19-99` — 3 张幻灯片 + 底部圆点指示器 + 下一步按钮
- 样式: `styles.css:1344-1552` — `.onboarding`, `.onboard-slide`, `.onboard-visual`, `.onboard-mock-*`, `.onboard-text`, `.onboard-footer`, `.onboard-dots`, `.onboard-btn`
- 逻辑: `js/main.js:39-40`（`_onboardStep` + `ONBOARD_KEY`）、`js/main.js:177-210`（`onboardNext()` / `initOnboarding()`）
- 入口: `js/main.js:170` — `initOnboarding()` 在 loadData 前调用
- 持久化 key: `localStorage` key `"knit_onboarded_v1"`

**视觉标识**:
- 全屏固定遮罩（z-index 100），覆盖所有内容
- 3 张卡片横向排列，滑动切换（`transform: translateX`，.35s 动画）
- 卡片 1：模拟项目列表的灰色骨架卡片（项目管理介绍）
- 卡片 2：彩色针法胶囊 + "已记录 N 针"（智能计数介绍）
- 卡片 3：应用图标 + "织影"（开始使用）
- 底部圆点指示器（active 态为拉长椭圆）
- 最后一张卡片按钮文字变为"开始使用"
- 点"开始使用"或完成第三步后写入 localStorage，`.onboarding.done` 永久隐藏

**修改指引**:
- 修改幻灯片内容: 编辑 `index.html:22-87` 的 HTML 结构
- 修改 mock 视觉效果: 编辑 `styles.css:1386-1455` 的 `.onboard-mock-*` 样式
- 修改动画速度: 编辑 `styles.css:1361` — `transition: 0.35s`
- 修改持久化 key: 编辑 `js/main.js:40` 的 `ONBOARD_KEY`
- 跳过引导页: 在 localStorage 设置 `knit_onboarded_v1 = '1'`


### 界面元素 - Safe Area 适配

**用户描述方式**:
- 主要: "刘海屏适配"、"灵动岛适配"、"安全区域"
- 别名: "safe area"、"顶部补偿"、"底部安全区"、"全面屏适配"

**代码位置**:
- CSS 变量: `styles.css:73` — `--nav-h: calc(44px + env(safe-area-inset-top))`
- Nav Bar 高度: `styles.css:190` — `height: calc(44px + env(safe-area-inset-top))`
- Nav Bar padding: `styles.css:191` — `padding: env(safe-area-inset-top) 8px 0`
- Stats 区域 padding: `styles.css:294` — `padding-top: max(8px, calc(env(safe-area-inset-top) + 8px))`
- Body padding: `styles.css:155` — `padding-bottom: env(safe-area-inset-bottom)`
- Bottom bar padding: `styles.css:657` — `padding-bottom: calc(8px + env(safe-area-inset-bottom))`
- Tab nav padding: `styles.css:725` — `padding-bottom: env(safe-area-inset-bottom)`
- Home footer padding: `styles.css:399` — `padding-bottom: calc(20px + env(safe-area-inset-bottom))`
- Onboarding padding: `styles.css:1352-1353` — `padding-top` / `padding-bottom`
- Viewport meta: `index.html:6` — `viewport-fit=cover`

**视觉标识**:
- 所有固定/粘性定位元素都会在顶部/底部额外留出系统安全区域高度
- 支持 iPhone 刘海屏（inset-top ≈ 44px）和灵动岛（inset-top ≈ 59px）
- 底部的 tab nav、bottom bar 均补齐 `safe-area-inset-bottom`

**修改指引**:
- 调整顶部安全区补偿: 修改各处 `calc(X + env(safe-area-inset-top))` 中 X 值
- 调整底部安全区补偿: 修改各处 `calc(X + env(safe-area-inset-bottom))` 中 X 值


### 页面导航 - 浮动胶囊标签栏（Floating Pill Tab Bar）

**用户描述方式**:
- 主要: "底部导航栏"、"底部标签"、"浮动胶囊"、"底部切换栏"
- 别名: "Tab 栏"、"底部菜单"、"导航切换"、"pill tab"

**代码位置**:
- HTML 结构: `index.html:124-133` — 两个按钮 `tab-projects` / `tab-settings`，各含 `tab-icon` + `tab-label`
- 样式: `styles.css:1071-1129` — `#tab-nav`（浮动胶囊，`border-radius: 32px`），`.tab-btn`（flex column），`.tab-icon`（24px），`.tab-label`（10px, display:none），`.tab-notch`（FAB 槽位）
- 切换逻辑: `js/main.js:57-72` — `switchTab()` / `updateTabNav()`
- 显示/隐藏: `js/render.js:41`（首页显示）、`js/render.js:205`（项目页隐藏）、`js/settings.js:77`（设置页显示项目时隐藏）
- FAB 槽位联动: `js/render.js:41` — 首页添加 `has-notch` 类为 FAB 留空

**视觉标识**:
- 浮动在屏幕底部上方（`bottom: calc(18px + env(safe-area-inset-bottom))`），水平居中，左右各 16px 边距
- 毛玻璃背景（`var(--glass-bg)` + `backdrop-filter: blur(10px)`）+ 阴影 + 细边框
- 圆角 32px 胶囊形状，grid 3 列布局（左按钮 / 中槽位 / 右按钮）
- 两个纯图标按钮：⊞ 项目 / ⚙︎ 设置（标签文字 `display:none`）
- 选中时图标为 `var(--accent)`（玫瑰色）并 `scale(1.1)`，未选中为 `var(--muted)`
- 首页中间出现 68px 槽位（`.tab-notch`）容纳 FAB

**修改指引**:
- 修改标签图标: 编辑 `index.html:126` 和 `index.html:130` 的 `tab-icon` 内容
- 修改选中高亮颜色: 编辑 `styles.css:749` — `.tab-btn.active` 的 `color: var(--accent)`
- 修改胶囊圆角: 编辑 `styles.css:1075` — `border-radius: 32px`
- 修改浮动位置: 编辑 `styles.css:1077` — `bottom` 值
- 恢复文字标签: 编辑 `styles.css:763` — `.tab-label` 的 `display` 改为 `block`
- 修改切换行为: 编辑 `js/main.js:57-65`


### 界面元素 - FAB 悬浮新建按钮

**用户描述方式**:
- 主要: "新建项目按钮"、"加号按钮"、"悬浮按钮"、"FAB"
- 别名: "floating action button"、"＋ 按钮"、"创建按钮"

**代码位置**:
- HTML 结构: `index.html:136` — `<button id="home-fab">`
- 样式: `styles.css:1131-1157` — `#home-fab`（圆形 60px，渐变背景，z-index: 21）
- 显示/隐藏: `js/render.js:41`（首页显示）、`js/render.js:205`（项目页隐藏）
- 点击行为: 触发 `showNewProjectDialog()`

**视觉标识**:
- 固定定位，底部居中（`bottom: calc(36px + env(safe-area-inset-bottom))`）
- 60×60px 圆形，`var(--accent)` 渐变色背景
- z-index: 21（高于 tab nav 的 20），与 tab notch 配合形成嵌入效果
- `:active` 时 scale(0.92) 按下反馈
- 只在首页显示

**修改指引**:
- 修改按钮大小: 编辑 `styles.css:1132-1133` — `width/height: 60px`
- 修改渐变颜色: 编辑 `styles.css:1136` — `background: linear-gradient(...)`
- 修改位置: 编辑 `styles.css:1131` — `bottom` 值
- 修改点击行为: 编辑 `index.html:136` 的 `onclick`


### 页面导航 - 页面切换动画

**用户描述方式**:
- 主要: "页面切换动画"、"滑入效果"、"过渡动画"
- 别名: "切换动效"、"slide 动画"、"进退场动画"

**代码位置**:
- CSS 动画: `styles.css:168-181` — `slide-in-right` / `slide-in-left` keyframes + `.enter-forward` / `.enter-back` 类
- 触发逻辑: `js/project.js:10-11`（打开项目 → `enter-forward`），`js/main.js:52-53`（返回首页 → `enter-back`）

**视觉标识**:
- 进入项目: 从右滑入（0.25s cubic-bezier）
- 返回首页: 从左滑入（0.25s cubic-bezier）

**修改指引**:
- 修改动画速度/缓动: 编辑 `styles.css:180-181` 的 `animation` 属性
- 修改动画关键帧: 编辑 `styles.css:168-179` 的 `@keyframes`
- 修改触发时机: 编辑 `js/project.js:10-11` 和 `js/main.js:52-53`


### 数据管理 - 项目列表页（首页）

**用户描述方式**:
- 主要: "首页"、"项目列表"、"我的项目页面"
- 别名: "主页"、"home 页"、"所有项目"、"项目总览"

**代码位置**:
- 渲染函数: `js/render.js:22-168` — `renderHome()`
- Nav Bar 状态: `js/render.js:24-41` — 恢复首页 Nav Bar + FAB + tab notch
- 统计卡片: `js/render.js:43-50` — 今日针数/总针数/项目数/专注天数/专注时长
- 激活项目卡片: `js/render.js:64-89`（iOS 卡片风格，异步加载封面）
- 归档项目区域: `js/render.js:93-125`（半透明 + "📦 已归档" 标题）
- 空状态: `js/render.js:62` — 国际化提示（`t('home_empty')`）
- 封面颜色生成: `js/render.js:10-16` — `COVER_COLORS` + `getCoverColor()` / `getProjectInitial()`
- 样式: `styles.css:313-415` — `.proj-list`, `.proj-card`, `.proj-thumb`, `.proj-info`, `.proj-name`, `.proj-meta`, `.proj-more`

**视觉标识**:
- 统计卡片 "织影" + 大号今日针数 + 统计行 + 激励语
- 项目卡片：左侧 48×48 圆角色块（首字大写 + COVER_COLORS 背景）或封面图片 → 项目名 + 部件/圈/针统计 + 最后修改时间 → ··· 菜单按钮
- 卡片有 `:active` 按下变暗效果
- 首页无独立新建按钮 — 通过 FAB 创建

**修改指引**:
- 修改首页标题: 编辑 `js/render.js:37`
- 修改空状态提示: 编辑 locale 文件 `home_empty` 键
- 修改项目卡片外观: 编辑 `styles.css:321-390` 的 `.proj-card` 系列
- 修改封面颜色方案: 编辑 `js/render.js:10-12` 的 `COVER_COLORS`
- 修改统计卡片格式: 编辑 `js/render.js:43-50`


### 数据管理 - 新建项目

**用户描述方式**:
- 主要: "新建项目"、"创建项目"、"添加新项目"
- 别名: "＋ 按钮"、"开始新项目"、"创建钩织项目"

**代码位置**:
- FAB 按钮: `index.html:136` — FAB 触发
- Dialog 弹窗: `js/project.js:81-108` — `showNewProjectDialog()`
- 创建确认: `js/project.js:81-108` — 创建 project 对象并保存
- 创建后流程: `js/ui.js:92-113` — `showEntryChoiceSheet()`（粘贴图解 / 手动创建 / 跳过）
- Dialog HTML: `index.html:146-156`

**视觉标识**:
- 首页底部 FAB 圆形按钮（渐变背景）
- 点击后弹出 Dialog 输入框，placeholder 为国际化文案
- 输入名称后弹出创建方式选择 Sheet：粘贴图解（自动配置）/ 手动创建（自定义针法）/ 跳过（使用全部针法）

**修改指引**:
- 修改按钮样式: 编辑 `styles.css:1131-1157` — `#home-fab`
- 修改输入框 placeholder: 编辑 locale 文件对应键
- 修改新项目默认结构: 编辑 `js/project.js:81-108`
- 修改创建方式选项: 编辑 `js/ui.js:92-113`


### 数据管理 - 项目卡片菜单（···）

**用户描述方式**:
- 主要: "项目菜单"、"三个点菜单"、"项目操作菜单"
- 别名: "弹出菜单"、"卡片菜单"、"··· 按钮"

**代码位置**:
- 菜单展开: `js/project.js:110-177` — 通过 `showSheet()` 显示操作列表
- 菜单项：设置封面 / 移除封面 / 分享项目 / 归档（或取消归档）/ 分割线 / 删除项目
- 触发: `js/render.js:86-87`（激活项目卡片）、`js/render.js:120-121`（归档项目卡片）
- 样式: `styles.css:376-390`（`.proj-more` 按钮）

**视觉标识**:
- Sheet 底部弹窗，标题显示项目名
- 菜单项：🖼 设置封面 / 🗑 移除封面（有封面时）/ 📤 分享项目 / 📦 归档（或 📤 取消归档）/ 🗑 删除项目（红色）
- 底部有"取消"按钮

**修改指引**:
- 修改菜单项: 编辑 `js/project.js:110-177`
- 修改菜单外观: 编辑 Sheet 相关样式 `styles.css:845-1000`
- 新增菜单项: 在删除项之前添加新按钮


### 数据管理 - 归档/取消归档项目

**用户描述方式**:
- 主要: "归档项目"、"取消归档"、"隐藏已完成项目"
- 别名: "存档"、"放入归档"、"恢复项目"、"archive"

**代码位置**:
- 归档功能: `js/project.js:178-192` — `archiveProject()`
- 取消归档: `js/project.js:288-291` — `unarchiveProject()`
- 归档成功弹窗: `js/project.js:193-250` — `showArchiveSuccessSheet()`
- 归档卡片样式: `styles.css:392-394` — `.proj-card.archived`（opacity 0.55）

**视觉标识**:
- 归档项目显示在首页下方独立区域"📦 已归档 (N)"
- 归档卡片半透明（opacity 0.55）
- 归档成功后弹出 Sheet 显示项目摘要 + PWA 安装提示 + 备份下载按钮

**修改指引**:
- 修改归档确认文案: 编辑 `js/project.js:182`
- 修改归档成功弹窗内容: 编辑 `js/project.js:193-250`
- 修改已归档区域标题: 编辑 `js/render.js:95`
- 修改归档卡片透明度: 编辑 `styles.css:393`


### 数据管理 - 删除项目

**用户描述方式**:
- 主要: "删除项目"、"移除项目"、"删除整个项目"
- 别名: "delete project"、"彻底删除"、"清除项目"

**代码位置**:
- 删除功能: `js/project.js:293-303` — `deleteProject()`
- 确认弹窗: 调用 `showConfirmDialog`，文案通过 `t()` 国际化

**视觉标识**:
- 菜单项为红色"🗑 删除项目"
- 确认弹窗：居中 Dialog

**修改指引**:
- 修改确认提示文案: 编辑 locale 文件对应键
- 修改删除逻辑: 编辑 `js/project.js:293-303`


### 数据管理 - 导出/导入备份

**用户描述方式**:
- 主要: "导出数据"、"备份数据"、"导入备份"、"恢复数据"
- 别名: "下载备份"、"数据迁移"、"备份还原"、"导出 JSON"

**代码位置**:
- 导出全部: `js/storage.js:260-270` — `exportData()`
- 导出单个项目: `js/storage.js:272-298` — `exportSingleProject(id)`
- 导入备份: `js/project.js:45-79` — `importData(input)`
- 设置页入口: 数据管理子页面

**视觉标识**:
- 设置 → 数据管理子页面中三个按钮：📤 导出备份 / 📥 导入备份（文件选择）/ 🗑 清空所有数据
- 导出下载文件名为 `织影备份_YYYY-MM-DD.json`
- 单个导出为 `项目名_日期.knt`
- 导入后弹出确认弹窗

**修改指引**:
- 修改导出文件名: 编辑 `js/storage.js:265`（全部）, `js/storage.js:287`（单个）
- 修改导入校验规则: 编辑 `js/project.js:45-79`
- 修改导入确认文案: 编辑 `js/project.js:59`


### 数据管理 - 清空所有数据

**用户描述方式**:
- 主要: "清空所有数据"、"重置应用"、"删除全部项目"
- 别名: "清除数据"、"全部删除"、"恢复出厂"

**代码位置**:
- 功能: `js/settings.js:758-776` — `clearAllData()`
- 入口: 设置 → 数据管理子页面红色按钮

**修改指引**:
- 修改确认文案: 编辑 `js/settings.js:760`
- 修改按钮颜色: 编辑 `styles.css:1139-1142` — `.settings-btn-danger`


### 业务功能 - 进入项目详情页

**用户描述方式**:
- 主要: "打开项目"、"进入项目"、"查看项目详情"
- 别名: "点击项目卡片"、"进入钩织页面"、"打开项目详情"

**代码位置**:
- 打开项目: `js/project.js:10-43` — `openProject(id)`
- 渲染项目页: `js/render.js:172-377` — `renderProject()`
- 触发: 首页项目卡片 `onclick="openProject('${p.id}')"`

**视觉标识**:
- 点击卡片后页面从右滑入
- Nav Bar 切换为项目模式（返回按钮 + 项目名 + 操作按钮含参考图）
- 统计卡片隐藏
- 显示部件选项卡、任务进度条、圈/行列表、底部调色板操作栏
- iPad 横屏时显示左右分屏布局

**修改指引**:
- 修改打开项目时的初始状态: 编辑 `js/project.js:10-43`
- 修改页面渲染结构: 编辑 `js/render.js:172-377`


### 业务功能 - 项目名称编辑

**用户描述方式**:
- 主要: "修改项目名"、"重命名项目"、"编辑项目标题"
- 别名: "更改名称"、"项目改名"、"点击标题编辑"

**代码位置**:
- Nav Bar 小标题点击: `js/render.js:162-183` — `navSmall.onclick`，弹出 Dialog 输入新名称
- 重命名逻辑: `js/project.js:304-309` — `renameProject(name)`

**视觉标识**:
- 项目页 Nav Bar 中间显示项目名，点击弹出 Dialog 输入框
- 或通过首页卡片菜单操作

**修改指引**:
- 修改编辑触发方式: 编辑 `js/render.js:164-182`
- 修改重命名逻辑: 编辑 `js/project.js:304-309`


### 业务功能 - 部件选项卡

**用户描述方式**:
- 主要: "部件切换"、"分类标签"、"部件 Tab"、"分部件管理"
- 别名: "part tabs"、"部件导航"、"分组切换"

**代码位置**:
- 渲染: `js/render.js:213-233` — 部件选项卡 HTML（胶囊按钮 + ✎/× 按钮 + ＋ 新增）
- 新增部件: `js/part.js:5-23` — `addPart()`
- 切换部件: `js/part.js:25-34` — `switchPart(partId)`
- 编辑部件名: `js/part.js:52-60` — `startEditPartName()` / `partNameBlur()`
- 重命名部件: `js/part.js:69-75` — `renamePart()`
- 删除部件: `js/part.js:77-89` — `deletePart(partId)`
- 样式: `styles.css:421-521` — `.part-tabs-wrap`, `.part-tabs-scroll`, `.part-tab`, `.part-name-input`, `.part-tab-add`

**视觉标识**:
- 横向可滚动胶囊按钮列表
- 激活 Tab 为 `var(--accent)` 实心填充，其余为白底灰字
- 每个 Tab 有 ✎ 编辑按钮（点击切换输入框）和 × 删除按钮（仅多部件时显示）
- 最右侧有 ＋ 新增按钮

**修改指引**:
- 修改新增部件默认标题: 编辑 `js/part.js:12` — `'部件 ' + ...`
- 修改 Tab 外观: 编辑 `styles.css:435-521` 的 `.part-tab` 系列
- 修改删除确认文案: 编辑 `js/part.js:82`


### 业务功能 - 圈/行管理

**用户描述方式**:
- 主要: "圈号列表"、"行号列表"、"钩织进度"、"每一圈的记录"
- 别名: "rounds"、"回合"、"行数"、"圈数"、"步骤列表"

**代码位置**:
- 渲染: `js/render.js:237-269` — 圈/行卡片 HTML（含记号扣圆点、循环标记）
- 新增圈: `js/round.js:9-65` — `addRound()`
- 新增空白圈: `js/round.js:66-83` — `addRoundBlank()`
- 展开/收起: `js/round.js:85-99` — `toggleRound(rid)`
- 设置活跃圈: `js/round.js:176-253` — `setActiveRound(proj, rid)`
- 删除圈: `js/round.js:101-152` — `deleteRound()`
- 撤销删除: `js/round.js:153-175` — `undoDeleteRound()`
- 循环标记: `js/stitch.js:1737-1795` — `copyRoundStructure()` 创建循环圈
- 样式: `styles.css:527-604` — `.round-card`, `.round-hdr`, `.round-badge`, `.round-label`, `.round-body`，`.round-markers`

**视觉标识**:
- 每圈一个白色圆角卡片
- 左侧方形 badge：数字（圈号）或"起"（起针）或"文"（备注卡）或"循"（循环标记）
- 活跃圈 badge 为 `var(--accent)` 填充 + 标签后显示"编辑中"棕色标签
- 展开后显示针法序列（彩色胶囊标签）+ 记号扣彩色圆点
- 右侧有"编辑"文本按钮、× 删除按钮、› 展开箭头
- 循环圈显示"循环 R2-R3"样式

**修改指引**:
- 修改新建圈后的滚动行为: 编辑 `js/round.js:19-22`
- 修改删除撤销时长: 编辑 `js/round.js:145` 的 `5000`
- 修改圈号显示格式: 编辑 `js/render.js:246`
- 修改展开图标: 编辑 `js/render.js:253` 的 `›` 字符


### 交互功能 - 添加针法（点按钮）

**用户描述方式**:
- 主要: "添加一针"、"记录针法"、"点针法按钮"
- 别名: "加针"、"添加 stitch"、"记录钩了什么针"、"push stitch"

**代码位置**:
- 针法按钮渲染: `js/stitch.js:1531-1623` — `renderDynamicPalette(proj)`
- 添加针法: `js/stitch.js:930-973` — `pushStitch(sid)`
- 按钮点击: `onclick="pushStitch('${sid}')"`
- 每日计数同步: `js/state.js:105-111` — `addDailyCount(n)`

**视觉标识**:
- 底部 3 列彩色按钮（`.palette` 容器，`.pal-btn` 按钮），各代表一种针法
- 按钮显示针法中文名 + 缩写 ID（如"短针 X"）+ 国际符号（开启时）
- 语音模式下按钮显示数字（1-9）
- 沉浸模式下按钮增大（88px 高度）
- 添加后对应圈自动展开，滚动到该圈视图中央
- 流式模式：根据当前圈图解自动高亮下一针按钮

**修改指引**:
- 修改默认针法列表: 编辑 `js/stitch.js:1540` 的 fallback 数组
- 修改按钮颜色逻辑: 编辑 `js/stitch.js:80-98` — `getProjColor()`
- 修改添加后的滚动行为: 编辑 `js/stitch.js:966-973`
- 修改每日计数: 编辑 `js/state.js:105-111` — `addDailyCount()`


### 交互功能 - 撤销上一针

**用户描述方式**:
- 主要: "撤销"、"删除最后一针"、"撤回上一步"
- 别名: "undo"、"取消"、"回退一针"

**代码位置**:
- 撤销功能: `js/stitch.js:974-1013` — `undoStitch()`
- 按钮: 底部操作栏"↩ 撤销"按钮

**视觉标识**:
- 底部操作栏左侧灰色按钮"↩ 撤销"
- 删除当前活跃圈最后一针并更新界面

**修改指引**:
- 修改按钮文字: 底部操作栏渲染处
- 修改撤销行为: 编辑 `js/stitch.js:974-1013`


### 交互功能 - 点击针法胶囊（修改/删除/插入单针）

**用户描述方式**:
- 主要: "修改某一针"、"替换针法"、"删除某一针"、"插入针法"
- 别名: "点击胶囊"、"stitch tap"、"编辑已添加的针"

**代码位置**:
- 点击触发: `js/stitch.js:1014-1089` — `stitchTap(roundId, idx)`
- 弹出面板: `js/stitch.js:1014-1089` — 内联 Sheet
- 替换针法: `js/stitch.js:1218-1248` — `changeStitch()`
- 删除单针: `js/stitch.js:1249-1283` — `deleteStitch()`
- 插入针法: `js/stitch.js:1284-1312` — `startInsert()` / `doInsert()`
- 记号扣: `js/stitch.js:1090-1217` — `openMarkerSheet()` 添加彩色标记
- 胶囊渲染: `js/render.js:243-267` — 圈卡片内针法序列 HTML
- 胶囊样式: `styles.css:606-650` — `.seq-wrap`, `.spill`, `.spill-idx`, `.spill-abbr`

**视觉标识**:
- 每针显示为彩色圆角胶囊：序号 + 缩写（如 `1 X`）+ 国际符号（开启时）
- 点击后弹出 Sheet：显示当前针法名称、可替换为其他针法（3 列网格）、在前后插入、添加记号扣、删除此针
- 记号扣显示为胶囊上的彩色小圆点

**修改指引**:
- 修改胶囊样式: 编辑 `styles.css:621-650` 的 `.spill` 系列
- 修改替换面板布局: 编辑 `js/stitch.js:1014-1089`
- 修改插入面板: 编辑 `js/stitch.js:1284-1312`
- 修改记号扣面板: 编辑 `js/stitch.js:1090-1217`


### 业务功能 - 针法配置（自定义调色板）

**用户描述方式**:
- 主要: "增减针法"、"配置常用针法"、"自定义针法面板"
- 别名: "针法设置"、"调色板配置"、"选择针法"、"stitch setup"

**代码位置**:
- 打开配置: `js/stitch.js:1902-2040` — `openStitchSetup(mode)`
- 切换选中: `js/stitch.js` — `toggleSetupStitch(sid)`
- 保存配置: `js/stitch.js` — `saveProjectStitches(mode)`
- 触发入口: 底部"＋增减"虚线按钮
- 样式: `styles.css:967-1000` — `.picker-grid`, `.picker-btn`
- 全局针法库联动: `js/settings.js:778-920` — 全局自定义针法

**视觉标识**:
- Sheet 弹窗，标题"选择常用针法"
- 针法按 4 分类分组：基础针法 / 加针类 / 减针类 / 特殊针法
- 每个针法显示为 3 列按钮，已选中为实心彩色，未选中为白底
- 底部按钮栏：全选 / 📋 导入图解 / ＋ 新建针法 / 取消 / 更新配置
- 全局自定义针法显示虚线边框
- 创建模式按钮文字为"开始钩织"

**修改指引**:
- 修改分类名称: 编辑 `js/stitch.js:1902-2040` 的 `categories` 对象
- 修改按钮列数: 编辑 `js/stitch.js` 中的 `repeat(3,1fr)`
- 修改全选按钮逻辑: 编辑 `js/pattern.js:25-45` — `toggleSelectAllInSetup()`


### 业务功能 - 全局针法库

**用户描述方式**:
- 主要: "全局针法库"、"自定义针法管理"、"管理所有自定义针法"
- 别名: "global stitch library"、"针法库管理"、"自定义 stitch 列表"

**代码位置**:
- 打开管理页: `js/settings.js:778-824` — `openGlobalStitchLibrary()`
- 自定义名称/颜色: `js/settings.js:825-896` — `openGlobalStitchCustomize()` / `saveGlobalStitchCustomize()` / `resetGlobalStitchCustomize()`
- 新建自定义针法: `js/settings.js:921-968` — `openGlobalNewStitchForm()` / `saveGlobalNewStitch()`
- 删除自定义: `js/settings.js:897-920` — `deleteGlobalCustomStitch()`
- 存储: `state.data.settings.globalCustomStitches` + `state.data.settings.globalStitchCustomizations`
- 入口: 设置 → 针法库子页面

**视觉标识**:
- 设置子页面，列出所有内置针法 + 自定义针法
- 每个针法显示彩色预览 + 名称 + 缩写
- 自定义针法有编辑和删除按钮
- 底部"＋ 新建针法"按钮

**修改指引**:
- 修改针法库入口: 编辑 `js/settings.js:778`
- 修改新建针法表单: 编辑 `js/settings.js:921-968`
- 修改全局自定义存储结构: 注意更新 `js/state.js` 默认值和 `js/storage.js` 迁移逻辑


### 业务功能 - 自定义针法名称和颜色

**用户描述方式**:
- 主要: "自定义针法名称"、"修改针法颜色"、"个性化针法"
- 别名: "改针法颜色"、"重命名针法"、"stitch customize"

**代码位置**:
- 打开自定义面板: `js/stitch.js:2041-2092` — `openStitchCustomize(sid)`
- 保存自定义: `js/stitch.js:2093-2119` — `saveStitchCustomize(sid)`
- 恢复默认: `js/stitch.js:2120-2134` — `resetStitchCustomize(sid)`
- 入口: 配置面板中针法按钮的"✎ 自定义"小字
- 全局版: `js/settings.js:825-896` — 设置页全局针法自定义

**视觉标识**:
- Sheet 弹窗，显示针法名称、名称输入框、颜色选择器（native color input）、恢复默认按钮
- 自定义过的针法在配置面板中有黄色小圆点标记
- 自定义名称覆盖预设中文名
- 全局自定义影响所有项目

**修改指引**:
- 修改名称输入框 maxlength: 编辑 `js/stitch.js:2062`
- 修改颜色选择器默认值: 编辑 `js/stitch.js:2068-2069`
- 修改保存逻辑: 编辑 `js/stitch.js:2093-2119`
- 注意：项目级自定义已废弃，统一使用全局针法自定义


### 业务功能 - 创建自定义针法

**用户描述方式**:
- 主要: "新建针法"、"创建自定义针法"、"添加新 stitch"
- 别名: "自定义 stitch"、"新增针法类型"

**代码位置**:
- 项目级: `js/stitch.js:2135-2191` — `openNewStitchForm(prefillId)`
- 保存: `js/stitch.js:2192-2218` — `saveNewStitch()`
- 删除: `js/stitch.js:2219-2244` — `deleteCustomStitch(sid)`
- 全局版: `js/settings.js:921-968` — `openGlobalNewStitchForm()` / `saveGlobalNewStitch()`
- 入口: 配置面板底部虚线按钮"＋ 新建针法" 或 设置页针法库

**视觉标识**:
- Sheet 弹窗表单：缩写 ID（英文输入，自动大写）、中文名称、颜色选择器、分类单选（基础/加针/减针/特殊）
- 自定义针法在配置面板中显示为虚线边框
- 删除按钮为红色

**修改指引**:
- 修改 ID 输入限制: 编辑 `js/stitch.js:2147` 的 `oninput` 正则
- 修改分类选项: 编辑 `js/stitch.js:2165-2168`
- 注意：推荐使用全局版（`js/settings.js`），项目级入口保留兼容


### 业务功能 - 圈/行 显示术语切换

**用户描述方式**:
- 主要: "切换圈/行显示"、"圈和行的叫法切换"
- 别名: "显示圈还是行"、"术语切换"、"toggle row terms"

**代码位置**:
- 切换逻辑: `js/stitch.js:37-52` — `toggleRowTerms()`
- 获取术语: `js/stitch.js:7-10` — `getUnitLabel(proj)`
- UI 入口: `js/render.js:197-199` — Nav Bar 右侧胶囊按钮"圈"或"行"

**视觉标识**:
- 项目页 Nav Bar 右侧胶囊样式小按钮（`nav-btn--pill`）
- 所有 UI 文本跟随变化

**修改指引**:
- 修改默认术语: 编辑 `js/stitch.js:9` 的 fallback
- 修改 UI 入口样式: 编辑 `styles.css:280-289` — `.nav-btn--pill`


### 业务功能 - 任务进度条

**用户描述方式**:
- 主要: "当前圈进度条"、"任务进度"、"完成度显示"、"图解进度"
- 别名: "task slide"、"进度追踪"、"还差多少针"、"完成多少针"

**代码位置**:
- 渲染: `js/stitch.js:1435-1530` — `renderTaskSlide(proj)`
- 自动计算预期针数: `js/stitch.js` — `calcExpectedCount()` / `countTokens()`
- 手动修改预期: `js/stitch.js` — `editExpectedCount(el)`
- 样式: `styles.css:1224-1279` — `.task-slide`, `.task-slide-text`, `.exp-count`, `.exp-count-input`

**视觉标识**:
- 粘性定位在部件 Tab 下方（`top: var(--hdr-h)`）
- 显示当前圈的图解文字
- 进度条：已完成/预期针数，超出时变红（`#EF4444`）
- 预期针数可点击编辑（数字输入框）
- 切换活跃圈时文字有 fade 过渡动画

**修改指引**:
- 修改无图解时的提示: 编辑 `js/stitch.js:1450-1451`
- 修改进度条颜色: 编辑 `js/stitch.js:1465` 的 `progressColor`
- 修改预期针数解析算法: 编辑 `js/stitch.js` — `calcExpectedCount()`


### 业务功能 - 针法筛选开关

**用户描述方式**:
- 主要: "只显示当前圈的针法"、"针法筛选"、"过滤针法按钮"
- 别名: "filter by round"、"筛选开关"、"按圈过滤"

**代码位置**:
- 切换逻辑: `js/stitch.js:1624-1640` — `toggleFilterByRound()`
- 渲染开关: `js/stitch.js` — `renderFilterToggle()`
- 过滤逻辑在 `renderDynamicPalette()` 内部
- 默认开启: `js/state.js:32` — `filterByRound: true`

**视觉标识**:
- 底部操作栏上方，滑动开关 + 文字"仅显示本圈针法"

**修改指引**:
- 修改开关文字: 编辑 `js/stitch.js` `renderFilterToggle()` 中文字
- 修改开关外观: 编辑对应内联样式
- 修改默认值: 编辑 `js/state.js:32`


### 业务功能 - 当前圈切换

**用户描述方式**:
- 主要: "切换当前编辑的圈"、"设置当前圈"、"激活某一圈"
- 别名: "选择当前圈"、"set active round"

**代码位置**:
- 切换逻辑: `js/round.js:176-253` — `setActiveRound(proj, rid)`
- 点击触发: 圈 badge 的 `onclick="setActiveRound(null,'${r.id}')"`
- 效果: 更新 activeRoundId、更新 UI badge/label、刷新底部调色板、刷新任务进度、流式模式更新

**视觉标识**:
- 点击圈 badge 切换活跃圈
- 活跃圈 badge 变 `var(--accent)` 填充 + 标签后出现"编辑中"标签
- 底部针法面板和任务进度同步更新
- 流式模式高亮卷轴同步更新

**修改指引**:
- 修改活跃圈 badge 样式: 编辑 `styles.css:563-567` — `.round-badge.active`
- 修改"编辑中"标签样式: 编辑 `js/render.js:248`


### 业务功能 - 图解编辑（点击式指令编辑器）

**用户描述方式**:
- 主要: "编辑图解文字"、"修改图解说明"、"填写钩织图解"、"点击输入指令"
- 别名: "编辑 instruction"、"图解文本"、"编辑图解"、"tap editor"

**代码位置**:
- 打开编辑面板: `js/stitch.js:154-251` — `openInstructionEdit(roundId)`
- 点击插入针法: `js/stitch.js:252-256` — `instrEditorInsert(sid)`
- 插入数字: `js/stitch.js:257-261` — `instrEditorInsertNum(n)`
- 插入符号: `js/stitch.js:262-266` — `instrEditorInsertSymbol(c)`
- 多圈编辑器: `js/stitch.js:544-753` — `openMultiRoundEditor(projId)`
- 保存: `js/stitch.js:754-929` — `saveRoundInstruction(roundId)`
- 点击入口: 圈卡片右侧"编辑"按钮 (`js/render.js:251`)

**视觉标识**:
- Sheet 弹窗，标题"编辑图解"
- 上半部分为文本框（可手动输入）
- 下半部分为自定义键盘：针法按钮行（彩色胶囊）、数字行（1-9）、符号行（括号等）、操作行（退格/清空/确认）
- 点击针法按钮即插入对应缩写到文本框光标位置
- 多圈编辑器：同时显示所有圈的文本框，批量编辑
- 保存后刷新进度条

**修改指引**:
- 修改键盘布局: 编辑 `js/stitch.js:154-251`
- 修改插入符号列表: 编辑 `js/stitch.js:262-266`
- 修改多圈编辑器: 编辑 `js/stitch.js:544-753`
- 修改保存逻辑: 编辑 `js/stitch.js:754-929`


### 业务功能 - 图解导入（粘贴/OCR）

**用户描述方式**:
- 主要: "导入图解"、"粘贴图解文字"、"拍照识别图解"、"OCR 识别"
- 别名: "图案导入"、"图解解析"、"导入钩织图解"、"pattern import"

**代码位置**:
- 粘贴面板: `js/pattern.js:55-74` — `openPatternPasteSheet()`
- 解析预览: `js/pattern.js:83-96` — `handleParsePattern()`
- OCR 识别: `js/pattern.js:135-174` — `handleOCR(input)`
- 确认导入: `js/pattern.js:176-227` — `openParseConfirmSheet(parsed)`
- 导入执行: `js/pattern.js:240-312` — `confirmImport(mode)`
- Tesseract 加载: `js/pattern.js:98-133` — `loadTesseract()` / `showLoading()` / `hideLoading()`
- 创建方式入口: `js/ui.js:92-113` — `showEntryChoiceSheet()`
- 底部按钮入口: "📥 图解"按钮

**视觉标识**:
- 粘贴面板：文本域 + 📷 识别图片（虚线边框） + 🔍 解析预览
- 解析确认面板：每圈可编辑输入框、检测到的针法、× 删除按钮 + 循环标记支持
- 导入选项：当前部件为空→"确认导入并开始"，有数据→"覆盖当前部件"或"作为新部件导入"

**修改指引**:
- 修改文本域 placeholder: 编辑 `js/pattern.js:60-61`
- 修改 OCR 识别语言: 编辑 `js/pattern.js:153` — `'chi_sim+eng'`
- 修改 Tesseract CDN 地址: 编辑 `js/pattern.js:128`
- 修改图解解析规则: 编辑 `stitches.js:87-203` — `parsePattern()`（含循环标记解析 + 自定义针法正则）


### 业务功能 - 流式模式（Flow Mode）

**用户描述方式**:
- 主要: "流式模式"、"智能高亮"、"跟着图解钩"、"下一步提示"
- 别名: "flow mode"、"highlight mode"、"高亮模式"、"下一针指引"

**代码位置**:
- 状态: `js/state.js:27-28` — `highlightMode: false`、`highlightIndex: 0`
- 指令分词: `js/highlight.js:176-201` — `expandInstructionFull(instruction)` 递归下降解析器
- 下一针预测: `js/highlight.js:202-220` — `getNextStitchSid(proj)` 根据当前进度确定下一步
- 高亮卷轴: `js/highlight.js:221-260` — `renderHighlightReel(proj)` 水平滚动 stitch-by-stitch 序列
- 按钮联动: `js/stitch.js:1531-1623` — 调色板中非下一针按钮变暗
- 设置开关: `js/settings.js:476-579` — `toggleHighlightEnabled()`（设置 → 进阶子页面，PRO 徽标装饰）
- 退出方式: 长按任意针法按钮

**视觉标识**:
- 开启后底部调色板仅高亮"下一针"按钮，其余变暗
- 高亮卷轴（`highlight-reel`）横向显示当前圈完整针法序列，当前针有脉冲动画
- 每添加一针自动推进 `highlightIndex`
- 设置中显示为"流式模式"（带 PRO 装饰徽标，功能已免费）
- PRO 徽标为纯视觉装饰，无功能限制

**修改指引**:
- 修改分词逻辑: 编辑 `js/highlight.js:176-201` — `expandInstructionFull()`
- 修改下一针预测: 编辑 `js/highlight.js:202-220` — `getNextStitchSid()`
- 修改高亮卷轴样式: 编辑 `styles.css:3389-3431` — `.highlight-reel*`
- 修改 PRO 徽标样式: 编辑 `styles.css:3433-3445` — `.highlight-pro-badge`
- 修改开关默认值: 编辑 `js/state.js:19` — `highlightEnabled`


### 业务功能 - 沉浸模式

**用户描述方式**:
- 主要: "沉浸模式"、"大字模式"、"全屏钩织"、"专注模式"
- 别名: "immersive mode"、"大按钮模式"、"逐步模式"

**代码位置**:
- 状态: `js/state.js:24` — `immersiveMode: false`
- 切换: `js/stitch.js:1796-1901` — `toggleImmersiveMode()`
- 渲染: `js/stitch.js:1664-1795` — `renderImmersive(proj)` 显示当前圈放大视图
- 开关按钮: `js/stitch.js:1641-1663` — `renderImmersiveToggle()`
- 样式: `styles.css:3447-3469` — `.immersive-mode` 系列

**视觉标识**:
- 调色板按钮放大至 88px 高度，适合不低头操作
- 只显示当前活跃圈的针法内容
- "下一圈"按钮推进到下一个圈
- 退出按钮返回正常模式

**修改指引**:
- 修改按钮大小: 编辑 `styles.css:3447-3469` — `.immersive-mode .pal-btn`
- 修改切换逻辑: 编辑 `js/stitch.js:1796-1901`
- 修改沉浸视图: 编辑 `js/stitch.js:1664-1795`


### 业务功能 - 记号扣（Stitch Markers）

**用户描述方式**:
- 主要: "记号扣"、"标记某一针"、"针目标记"、"彩色标记"
- 别名: "stitch marker"、"针目标签"、"marker"、"记号标记"

**代码位置**:
- 添加/编辑: `js/stitch.js:1090-1217` — `openMarkerSheet(roundId, idx)`
- 查看全部: `js/stitch.js` — `openMarkersReviewSheet()`
- 保存: `js/stitch.js` — `saveMarker()`
- 删除: `js/stitch.js` — `removeMarker()`
- 渲染: `js/render.js:243-267` — 圈卡片针法胶囊上的彩色小圆点
- 存储: `proj.markers[]` — `{id, roundId, index, color, note}`
- 颜色选项: 6 种预设颜色（红/橙/黄/绿/蓝/紫）

**视觉标识**:
- 点击针法胶囊 → Sheet 弹出 → "添加记号扣"选项
- 记号扣在胶囊右上角显示为彩色小圆点（6px）
- 记号扣面板：6 色选择 + 备注文本输入 + 保存/删除按钮
- 圈卡片头部汇总显示该圈所有记号扣颜色圆点

**修改指引**:
- 修改颜色选项: 编辑 `js/stitch.js:1090-1217` 中的颜色数组
- 修改记号扣圆点样式: 编辑 `styles.css` — `.round-markers` / `.marker-dot`
- 修改存储结构: 注意更新 `js/storage.js` schema 迁移（v10）


### 业务功能 - 参考图系统

**用户描述方式**:
- 主要: "参考图"、"参考图片"、"上传图解照片"、"看图钩织"
- 别名: "reference image"、"图解照片"、"参考照片"、"ref image"

**代码位置**:
- 选择图片: `js/image.js:399-415` — `pickRefImages(projId)`（支持多选）
- 添加/替换: `js/image.js:300-398` — `addRefImage()` / `setRefImage()` / `getRefImage()`
- 删除: `js/image.js:300-398` — `removeRefImage()`
- 管理 Sheet: `js/image.js:300-398` — `showRefImagesSheet()`
- 全屏查看器: `js/image.js:300-398` — `openRefImageViewer(projId, currentKey)`（支持滑动翻页）
- 入口: 项目页 Nav Bar 🖼 按钮 + 设置页
- 存储: `proj.refImages[]` → IndexedDB covers store（`ref_{projId}_{n}` key）
- iPad 分屏集成: 左侧面板显示参考图

**视觉标识**:
- Nav Bar 右侧参考图按钮
- 管理 Sheet：缩略图网格 + 添加/删除按钮
- 全屏查看器：黑色背景、图片居中、左右滑动翻页、页码指示器、标注按钮
- iPad 横屏时参考图固定显示在左侧分屏面板

**修改指引**:
- 修改查看器样式: 编辑 `styles.css:1375-1460` — `.ref-viewer-*`
- 修改缩略图样式: 编辑 `styles.css:1159-1215` — `.ref-img-thumb`
- 修改图片存储大小限制: 编辑 `js/image.js:300-398`
- 修改 iPad 分屏面板: 编辑 `js/render.js:381-463` — `_renderSplitLeft()`


### 业务功能 - 图片标注工具

**用户描述方式**:
- 主要: "在参考图上画画"、"标注图解"、"图片笔记"、"画笔工具"
- 别名: "annotator"、"涂鸦"、"画线"、"擦除标注"

**代码位置**:
- 打开标注器: `js/annotator.js:30-420` — `openAnnotator(projId, key)`
- Canvas 标注层覆盖在参考图上
- 工具：画笔（多色）、橡皮擦、撤销、缩放（pinch-zoom）
- 保存: 标注数据存入 IndexedDB covers store（`annot_{projId}_{key}`）
- 样式: `styles.css:1217-1373` — `.annotator-*`（工具栏/颜色选择/画布覆盖层）

**视觉标识**:
- 全屏标注界面，工具栏在顶部
- 颜色选择器：红/橙/黄/绿/蓝/紫/黑/白
- 画笔/橡皮擦切换按钮
- 撤销按钮
- 双指缩放支持
- 离开页面时自动保存

**修改指引**:
- 修改颜色选项: 编辑 `js/annotator.js:30-420` 中颜色数组
- 修改画笔粗细: 编辑 Canvas lineWidth 设置
- 修改工具栏样式: 编辑 `styles.css:1217-1373`


### 业务功能 - iPad 横屏分屏布局

**用户描述方式**:
- 主要: "iPad 横屏"、"分屏布局"、"左右面板"、"平板适配"
- 别名: "split pane"、"iPad landscape"、"双栏布局"

**代码位置**:
- 检测与激活: `js/render.js:225-234` — 检测 `(min-width: 768px) and (orientation: landscape)` → 添加 `html.ipad-split` 类
- 左侧面板: `js/render.js:381-463` — `_renderSplitLeft()` 创建参考图轨道
- 样式: `styles.css:1499-1674` — `html.ipad-split` 下的大量布局覆盖
- 左侧面板: `#ipad-split-left`（固定宽度，参考图 + 滑动导航 + 标注按钮）
- 右侧面板: 正常项目内容流

**视觉标识**:
- 768px+ 横屏时自动切换为左右分屏
- 左面板：参考图大图显示 + 左右滑动翻页 + 页码圆点 + 🖌 标注按钮
- 右面板：部件选项卡 + 圈列表 + 底部操作栏（正常布局）
- 竖屏或窄屏恢复单栏布局

**修改指引**:
- 修改分屏断点: 编辑 `styles.css:1499` — `@media (min-width: 768px)`
- 修改左侧面板宽度: 编辑 `styles.css:1509` — `#ipad-split-left` 的 `width`
- 修改分屏条件: 编辑 `js/render.js:225`


### 业务功能 - 国际化（i18n）+ 针法符号体系

**用户描述方式**:
- 主要: "语言切换"、"中文英文切换"、"针法符号"、"国际标准符号"
- 别名: "i18n"、"翻译"、"简写符号"、"notation"、"显示 X 还是 SC"

**代码位置**:
- 翻译函数: `js/i18n.js:17-28` — `t(key)` 从当前语言包取翻译
- 针法术语: `js/i18n.js:29-38` — `term(sid)` 从 terms.js 取当前符号体系的针法缩写
- UI 语言: `js/i18n.js:47-63` — `setLang()` / `getLang()`（zh / en）
- 符号体系: `js/i18n.js:39-46` — `setNotation()` / `getNotationKey()`（symbol / zh / en_us / en_uk）
- 国际符号开关: `js/i18n.js:64-78` — `getShowSymbol()` / `setShowSymbol()`
- 语言包: `js/locales/zh.js`（中文 25KB）、`js/locales/en.js`（英文 25KB）
- 术语表: `js/locales/terms.js`（4 种符号体系对照）
- 设置入口: 设置 → 语言子页面

**四种针法符号体系**:
- `symbol`: 国际标准符号（X=短针, V=加针, A=减针...）
- `zh`: 中文简写（短/加/减...）
- `en_us`: 美式英文（SC/INC/DEC...）
- `en_uk`: 英式英文（DC/INC/DEC...）

**视觉标识**:
- 设置 → 语言子页面：UI 语言选择（中文/English）+ 针法符号体系选择（4 选项）+ 国际标准符号开关
- 开启国际符号后针法按钮额外显示对应符号（如 `X ✖`）
- 针法胶囊也同步更新显示

**修改指引**:
- 修改翻译文本: 编辑 `js/locales/zh.js` 或 `js/locales/en.js` 对应键值
- 新增翻译键: 在 zh.js 和 en.js 中同时添加
- 修改符号体系: 编辑 `js/locales/terms.js` 的 `STITCH_TERMS` 表
- 修改符号开关: 编辑 `js/i18n.js:64-78`
- 新增符号体系: 在 `js/locales/terms.js` 添加新列 + 在 `js/i18n.js` NOTATION_OPTIONS 添加选项


### 业务功能 - 分享图片

**用户描述方式**:
- 主要: "分享项目图片"、"生成分享卡片"、"项目统计图"
- 别名: "share image"、"分享卡片"、"下载分享图"、"项目海报"

**代码位置**:
- 生成分享图: `js/share.js:158-215` — `showShareSheet(projId, imageDataUrl)`
- 下载: `js/share.js:216-230` — `downloadShareImage(dataUrl, filename)`
- 渲染引擎: 使用 `html2canvas`（CDN 动态加载）渲染分享卡片 HTML
- 卡片内容: 项目名 + 封面图 + top 针法统计 + 总针数/圈数/专注时长 + 用户昵称
- 入口: 项目卡片菜单"📤 分享项目"

**视觉标识**:
- Sheet 弹窗预览分享卡片
- 卡片展示项目摘要信息（名称、封面、统计、TOP 针法排行）
- 底部下载按钮 + 原生分享（Web Share API）
- 卡片有品牌标识"织影"

**修改指引**:
- 修改卡片布局: 编辑 `js/share.js:158-215` 中的 HTML 模板
- 修改 html2canvas CDN: 编辑 `js/share.js` 中加载地址
- 修改下载文件名: 编辑 `js/share.js:216`
- 修改卡片样式: 编辑 `js/share.js` 内联 CSS


### 业务功能 - 图解分享与 KNIT1 格式导入/导出

**用户描述方式**:
- 主要: "分享图解"、"导出项目文件"、"导入织影项目"、"KNIT1 格式"
- 别名: "share pattern"、"项目导出"、"织影项目导入"、"压缩分享"

**代码位置**:
- 打开分享面板: `js/share-pattern.js:191-242` — `openShareSheet(projId)`
- 文本生成: `js/share-pattern.js` — `generateTextPattern()` 纯文本图解
- KNIT1 导出: `js/share-pattern.js` — `stripProjectForExport()` + `compressAndEncode()`（gzip + base64）
- 导入面板: `js/share-pattern.js:243-304` — `openImportShareSheet()`
- 解码导入: `js/share-pattern.js` — `_doImportShared()` 匹配 `KNIT1:base64`、解压、校验、创建项目
- 导出格式: `【织影项目】${name}\nKNIT1:${base64}`
- 入口: 项目页底部"📤 分享"按钮

**视觉标识**:
- Sheet 弹窗，两个选项：
  1. 📋 复制文本图解（免费）— 纯文本格式，可直接粘贴分享
  2. 📦 导出完整项目（带 PRO 装饰徽标，功能已免费）— KNIT1 压缩格式，可跨设备导入
- 导入面板：文本域粘贴 KNIT1 数据 → 解析 → 创建项目
- PRO 徽标纯视觉装饰（`styles.css:3472-3484` — `.pro-badge`）

**修改指引**:
- 修改导出格式: 编辑 `js/share-pattern.js` — `stripProjectForExport()`
- 修改压缩参数: 编辑 `js/share-pattern.js` — `compressAndEncode()`
- 修改导入校验: 编辑 `js/share-pattern.js` — `_doImportShared()`
- 修改 PRO 徽标样式: 编辑 `styles.css:3472-3484`
- 修改 KNIT1 正则匹配: 编辑 `js/share-pattern.js` 中 `/KNIT1:(\S+)/`


### 业务功能 - 专注计时

**用户描述方式**:
- 主要: "专注计时"、"钩织时长统计"、"计时器"、"钩了多久"
- 别名: "focus session"、"计时"、"专注时间"、"session timer"

**代码位置**:
- 开始计时: `js/project.js:316-320` — `startFocusSession()`
- 计时跳动: `js/project.js:321-330` — `tickFocusSession()`（每秒更新）
- 保存记录: `js/project.js:331-348` — `flushFocusSession()`
- 汇总计算: `js/project.js:349-380` — `getTotalFocusTime(proj)` / `formatFocusTime()` / `getTodayFocusTime()`
- 存储: `proj.focusSessions[]` — `{start, end}` 时间戳数组
- 显示: 首页统计卡片"专注时长"

**视觉标识**:
- 进入项目页时自动开始计时
- 离开项目页时自动保存时段记录
- 首页显示累计专注时长（分钟/小时格式）

**修改指引**:
- 修改计时精度: 编辑 `js/project.js:316-348`
- 修改时长格式: 编辑 `js/project.js:349-380` — `formatFocusTime()`
- 修改统计显示: 编辑 `js/render.js:43-50`


### 业务功能 - 每日针数统计

**用户描述方式**:
- 主要: "今日针数"、"每天钩了多少"、"每日统计"
- 别名: "daily count"、"今日记录"、"每日针数"

**代码位置**:
- 每日日志: `js/state.js:89-120` — `getTodayKey()` / `getDailyLog()` / `addDailyCount(n)` / `calcTotalDays()` / `clearDailyLog()`
- 持久化 key: `localStorage` key `"knit_daily_log"`（独立于主数据库）
- 触发: `pushStitch()` 时自动调用 `addDailyCount(1)`
- 显示: 首页统计卡片大号"今日已钩 N 针"

**视觉标识**:
- 首页最显眼位置：大号数字 + "今日已钩"
- 独立于项目数据，全局累计今日所有项目的针数
- 统计行显示"累计 N 针"、"N 天专注"

**修改指引**:
- 修改日志 key: 编辑 `js/state.js:90` — `DAILY_LOG_KEY`
- 修改日期格式: 编辑 `js/state.js:92-96` — `getTodayKey()`
- 修改每日重置逻辑: 日期 key 格式为 `YYYY-MM-DD`，次日自动新建


### 业务功能 - 语音模式

**用户描述方式**:
- 主要: "语音输入"、"语音控制"、"声控钩织"、"说数字加针"
- 别名: "voice mode"、"语音识别"、"语音计数"、"喊针法"

**代码位置**:
- 语音开关: `js/voice.js:105-188` — `toggleVoiceMode()`（3 状态：off / starting / on）
- 语音识别初始化: `js/voice.js:50-103` — `initRecognition()`
- 识别处理: `js/voice.js:58-84` — 匹配数字 1-9 或撤销关键词
- 视觉效果: `js/stitch.js` — `triggerEdgeGlow()`
- 呼吸指示器: `js/voice.js:190-200` — `setVoicePulse()`
- 按钮状态: `js/voice.js:202-224` — `updateVoiceButton()`
- 音效: `js/voice.js:12-48` — `playSound()`
- 底部按钮: "🎙 语音"按钮
- 语音提示横幅: `js/render.js:278-293`
- 语音教程: `js/voice.js:232-260` — `openVoiceTutorial()`

**视觉标识**:
- 底部"🎙 语音"按钮三种状态：
  - 关闭: 灰色普通按钮
  - 启动中: 橙色（#F59E0B）+ 脉冲动画
  - 已开启: 红色（#EF4444）+ 脉冲动画
- 屏幕右下角红色脉冲圆点（voice breathing 动画，1.8s）
- 语音模式按钮显示数字 1-9
- 添加针法时屏幕边缘闪烁对应颜色

**修改指引**:
- 修改识别语言: 编辑 `js/voice.js:54` — `r.lang = 'zh-CN'`
- 修改撤销关键词: 编辑 `js/voice.js:62`
- 修改数字映射: 编辑 `js/state.js:59-69` — `NUMBER_MAP`
- 修改按钮颜色: 编辑 `js/voice.js:202-224`
- 修改边缘闪烁时长: 编辑 `js/stitch.js` — `triggerEdgeGlow()`


### 业务功能 - 语音提示横幅

**用户描述方式**:
- 主要: "语音提示条"、"语音模式引导横幅"、"语音提示 banner"
- 别名: "voice hint"、"语音功能提示"、"首次语音提示"

**代码位置**:
- 渲染: `js/render.js:278-293` — 在底部操作栏上方附加
- 关闭: `js/voice.js:226-229` — `dismissVoiceHint()`
- 持久化 key: `localStorage` key `"voice_hint_shown"`

**视觉标识**:
- 黄色背景横幅（#FEF3C7），固定在底部操作栏上方
- 文字"🎙 试试语音模式，解放双手钩织"
- 右侧"了解 ›"链接 + × 关闭按钮

**修改指引**:
- 修改横幅文字: 编辑 `js/render.js:284`
- 修改显示条件: 编辑 `js/render.js:278`
- 修改横幅样式: 编辑 `js/render.js:279-293` 内联样式


### 界面元素 - Sheet 底部弹窗

**用户描述方式**:
- 主要: "底部弹窗"、"操作面板"、"弹出菜单"、"底部滑出面板"
- 别名: "Sheet"、"底部面板"、"滑出菜单"、"action sheet"

**代码位置**:
- HTML 容器: `index.html:136-137` — `<div class="overlay">` + `<div class="sheet">`
- 样式: `styles.css:829-1000` — `.overlay`, `.sheet`, `.sheet-handle`, `.sheet-title`, `.sheet-section`, `.sheet-item`, `.sheet-cancel`
- 打开/关闭: `js/ui.js:69-89` — `showSheet(html)` / `closeSheet()`

**视觉标识**:
- 从底部滑出（spring 缓动），圆角顶部（18px）、顶部有灰色拖拽手柄横条
- 半透明深色遮罩层
- 固定最大高度 80vh，内容区可滚动

**修改指引**:
- 修改弹出动画: 编辑 `styles.css:862-863` — `.sheet.show` 的 `transform`
- 修改圆角: 编辑 `styles.css:853` — `border-radius`
- 修改关闭行为: 编辑 `js/ui.js:74-89`


### 界面元素 - Dialog 确认对话框

**用户描述方式**:
- 主要: "确认弹窗"、"对话框"、"确认删除提示"
- 别名: "Dialog"、"模态框"、"alert 弹窗"

**代码位置**:
- HTML 结构: `index.html:146-156` — 标题、消息、输入框、取消/确定按钮
- 样式: `styles.css:1144-1222` — `.dialog`, `.dialog-box`, `.dialog-title`, `.dialog-input`, `.dialog-row`, `.dialog-btn`
- 打开/关闭: `js/ui.js:127-155` — `showConfirmDialog()` / `confirmDialog()` / `closeDialog()`

**视觉标识**:
- 居中弹出、白色圆角卡片、半透明深色遮罩
- 确定按钮为 `var(--accent)` 背景，取消按钮为灰色

**修改指引**:
- 修改按钮文字: 编辑 `index.html:152-153`
- 修改对话框宽度: 编辑 `styles.css:1165` — `max-width: 340px`
- 修改确定/取消逻辑: 编辑 `js/ui.js:127-155`


### 界面元素 - Toast 提示

**用户描述方式**:
- 主要: "底部提示"、"操作成功提示"、"toast 消息"
- 别名: "轻提示"、"snackbar"、"通知条"

**代码位置**:
- 实现: `js/ui.js:8-67` — `showToast(message, action, duration)`
- 使用场景遍布多个文件

**视觉标识**:
- 固定在屏幕底部、深棕色背景（#2D1E10）、白色文字
- 从下方淡入，4 秒后自动消失
- 可选右侧操作按钮（如"撤销"），使用 `var(--accent)` 背景

**修改指引**:
- 修改显示时长: 调用时第三个参数 `duration`（默认 4000ms）
- 修改外观: 编辑 `js/ui.js:13-31` 的 `toast.style.cssText`
- 修改动画: 编辑 `js/ui.js:34` 的 `@keyframes toast-in`


### 界面元素 - Loading 加载遮罩

**用户描述方式**:
- 主要: "加载中遮罩"、"加载动画"、"loading 画面"
- 别名: "加载提示"、"读取中"、"spinner"

**代码位置**:
- HTML 结构: `index.html:140-143`
- 样式: `styles.css:1297-1342` — `.loading-mask`, `.loading-spinner`, `@keyframes spin`
- 打开/关闭: `js/pattern.js:102-112` — `showLoading()` / `hideLoading()`

**视觉标识**:
- 全屏半透明白色遮罩 + 毛玻璃效果
- 中间旋转圆环（`var(--accent)` 顶部色） + 文字提示
- 仅在 OCR 识别时使用

**修改指引**:
- 修改加载文字: 调用 `showLoading('自定义文字')`
- 修改旋转动画速度: 编辑 `styles.css:1319` — `animation: spin 1s`


### 业务功能 - 项目封面图片

**用户描述方式**:
- 主要: "项目封面"、"设置封面图"、"封面照片"、"项目缩略图"
- 别名: "cover image"、"封面"、"项目图片"、"更换封面"、"移除封面"

**代码位置**:
- 选择封面: `js/image.js:145-170` — `pickCover(projectId)`
- 压缩处理: `js/image.js:19-45` — `compressImage(file)`，Canvas 压缩到 200px、JPEG 0.72
- 保存封面: `js/image.js:48-57` — `setProjectCover(projectId, input)`
- 移除封面: `js/image.js:59-67` — `removeProjectCover(projectId)`
- 读取封面: `js/image.js:40-45` — `getProjImage(projId)`
- 存储位置: IndexedDB covers store（`img_{projId}`）
- 本地头像: `js/image.js:153-168` — `getProfileAvatar()` / `setProfileAvatar()` / `removeProfileAvatar()`
- 渲染显示: `js/render.js:66-73`（首页封面/色块占位，异步加载）
- 入口: 项目卡片菜单"🖼 设置封面" + "🗑 移除封面"

**视觉标识**:
- 项目卡片左侧：有封面显示 48×48 圆角图片，无封面显示首字大写色块（COVER_COLORS 之一）
- 菜单"设置封面"打开系统文件选择器

**修改指引**:
- 修改压缩尺寸: 编辑 `js/image.js:19` 的 `maxSize` 默认值 200
- 修改图片质量: 编辑 `js/image.js:20` — `'image/jpeg', 0.72`
- 修改封面占位样式: 编辑 `styles.css:346-354` — `.proj-thumb--fallback`
- 修改 COVER_COLORS: 编辑 `js/render.js:10-12`


### 应用设置 - 设置页面（子页面导航架构）

**用户描述方式**:
- 主要: "设置页面"、"设置"、"应用设置"、"设置子页面"
- 别名: "settings page"、"设置中心"、"偏好设置"

**代码位置**:
- Sheet 版: `js/settings.js:26-36` — `openSettings()`（从项目页头部按钮调用）
- 全页版: `js/settings.js:37-240` — `renderSettings()`（通过 Tab Bar 切换调用，含 profile header + 子页面列表）
- 子页面导航: `js/settings.js:242-295` — `navigateToSubPage(key)` + `goBackFromSubPage()`（栈式导航）
- 子页面列表: 外观（UI 主题 + 针法颜色）/ 针法库 / 语言 & 符号 / 数据管理 / 进阶功能 / 关于
- 身份卡: `js/settings.js:71-93` — profile header（头像 + 昵称 + 统计）
- 头像加载: `js/settings.js:47-54` — `_loadProfileAvatar()`
- 昵称编辑: `js/settings.js:580-601` — `editProfileName()`
- 头像更换: `js/settings.js:602-631` — `pickProfileAvatar()` / `showAvatarSheet(event)`
- 入口: 底部标签栏 ⚙︎ + 项目页 Nav Bar ⚙️ 按钮

**视觉标识**:
- 顶部身份卡：圆形头像（48px）+ 昵称 + N个项目·累计N针统计
- 子页面列表：每项有标题 + 副标题 + › 箭头
- 点击进入子页面（带返回箭头 + 标题）
- 子页面采用栈式导航，支持多级返回
- 头像未上传时显示 🧶 emoji 占位
- 点击昵称弹出 Dialog 编辑，点击头像弹出 Sheet 更换/移除

**修改指引**:
- 新增子页面: 在 `renderSettings()` 添加列表项 + 创建对应渲染函数 + 在 `navigateToSubPage()` 添加路由
- 修改身份卡样式: 编辑 `styles.css` 中 `.profile-card` / `.profile-header` 系列
- 修改默认昵称: 编辑 locale 文件 `profile_default_name` 键
- 修改子页面导航栈: 编辑 `js/settings.js:242-295`


### 应用设置 - 语音默认开关 & 音效开关

**用户描述方式**:
- 主要: "默认开启语音"、"语音自动启动"、"音效开关"
- 别名: "voice default"、"语音音效"、"提示音开关"

**代码位置**:
- 默认语音开关 UI + 逻辑: `js/settings.js:744-750` — `toggleVoiceDefault()`
- 音效开关 UI + 逻辑: `js/settings.js:751-757` — `toggleVoiceSound()`
- 存储: `state.data.settings.voiceEnabled` / `voiceSoundEnabled`

**视觉标识**:
- 滑动开关（toggle switch），开启时 `var(--accent)` 背景

**修改指引**:
- 修改标签文字: 编辑 `js/settings.js:747` 和 `js/settings.js:754`
- 修改开关样式: 编辑 `styles.css:1067-1097` — `.settings-toggle` 系列


### 其他功能 - 导出 PDF / 打印

**用户描述方式**:
- 主要: "打印项目"、"导出 PDF"、"打印图解"
- 别名: "print"、"PDF 导出"、"打印版"

**代码位置**:
- 功能: `js/storage.js:255-257` — `exportPDF()`，调用 `window.print()`
- 触发按钮: `js/render.js:201` — Nav Bar 📄 按钮
- 打印样式: `styles.css:767-827` — `@media print`

**视觉标识**:
- Nav Bar PDF 图标按钮（仅在项目页显示）
- 打印时自动隐藏所有交互 UI，只保留圈/行卡片和针法序列

**修改指引**:
- 修改打印隐藏的元素: 编辑 `styles.css:781-790` 的 `display:none` 列表
- 修改打印时标题大小: 编辑 `styles.css:801-804`


### 其他功能 - PWA 安装引导

**用户描述方式**:
- 主要: "添加到主屏幕"、"安装为 App"、"PWA 安装教程"
- 别名: "install"、"桌面快捷方式"、"安装教程"

**代码位置**:
- 教程弹窗: `js/project.js:251-287` — `showPwaTutorial()`
- 提示横幅: `js/project.js:157-169`（归档成功后显示）
- 入口: 设置页"📲 安装到主屏幕"按钮 + 归档成功弹窗中的 PWA 提示
- PWA 配置: `manifest.json`、`sw.js`

**修改指引**:
- 修改安装教程内容: 编辑 `js/project.js:251-287`
- 修改 PWA 应用名/图标: 编辑 `manifest.json`
- 修改 PWA 提示 opt-out 逻辑: `js/project.js:193-205`


### 其他功能 - 版本更新提示

**用户描述方式**:
- 主要: "新版本提示"、"更新提醒"、"发现新版本"
- 别名: "update toast"、"版本更新"、"刷新提示"

**代码位置**:
- 更新 Toast: `index.html:214-249` — `showUpdateToast()`
- SW 更新检测: `index.html:188-211` — Service Worker `updatefound` 事件 + postMessage
- 版本号: `index.html:10` — `<meta name="version">`

**视觉标识**:
- 页面顶部棕色横幅"✨ 发现新版本"，右侧"立即刷新"按钮
- 或底部 Toast"新版本已就绪，刷新后生效" + 刷新操作按钮

**修改指引**:
- 修改更新提示文字: 编辑 `index.html:234`
- 修改更新检测逻辑: 编辑 `index.html:191-206`
- 修改版本号生成: 编辑 `scripts/inject-version.js`


### 数据层 - 数据存储结构

**用户描述方式**:
- 主要: "数据结构"、"存储格式"、"数据在哪里"
- 别名: "data model"、"存储结构"、"JSON 格式"、"localStorage key"

**代码位置**:
- 全局状态定义: `js/state.js:4-51` — `state` 对象
- 持久化 key: `js/storage.js:95` — `"crochet_v4"`（IndexedDB key）
- 数据加载/迁移: `js/storage.js:100-250` — `loadData()` + localStorage→IndexedDB 一次性迁移
- 存储适配器: `js/storage.js:65-93` — `storageAdapter`（IndexedDB 读写）
- 封面图片存储: IndexedDB covers store（`img_{projId}`）
- 参考图存储: IndexedDB covers store（`ref_{projId}_{n}`）
- 标注数据存储: IndexedDB covers store（`annot_{projId}_{key}`）
- 每日计数器: `localStorage` key `"knit_daily_log"`（独立存储）

**数据结构概览**:
```
state.data = {
  schemaVersion: LATEST_SCHEMA,     // 当前 schema 版本号（11）
  projects: [{
    id, name, archived,
    useRowTerms,                    // 用"行"还是"圈"
    activePartId,                   // 当前活跃部件 ID
    lastModified,                   // 最后修改时间戳
    parts: [{
      id, title, rawPattern,
      customPalette: ["X","V",...], // null 表示自动检测
      activeRoundId,
      lastPosition: { roundId, stitchIdx }, // 钩织进度记忆（v11）
      rounds: [{
        id, roundNum,               // null=备注卡, 0=起针
        seq: ["X","V",...],         // 针法序列（sid 数组）
        instruction: "",            // 图解说明文字
        isTextCard: false,          // 是否为纯文本备注卡
        isLoopMarker: false,        // 是否为循环标记卡
        loopFrom, loopTo,           // 循环范围
        expectedCount: null         // 预期针数（手动设定）
      }]
    }],
    refImages: ["ref_{projId}_{n}"], // 参考图 IndexedDB keys（v8）
    focusSessions: [{start, end}],   // 专注时段记录（v9）
    dailyCount: {},                  // 项目级每日针数（v9）
    markers: [{id, roundId, index, color, note}], // 记号扣（v10）
    customSettings: {
      names: { sid: "自定义名称" },
      colors: { sid: "#hex" },
      customStitches: { sid: { id, label, color, category } }
    }  // ⚠️ 已废弃（v7），保留兼容，新代码使用全局版本
  }],
  settings: {
    theme: "morandi",               // UI 主题："morandi"|"night"|"float"
    stitchTheme: "morandi",         // 针法颜色主题："morandi"|"night"|"float"
    customColors: {},               // 全局自定义颜色
    globalCustomStitches: {},       // 全局自定义针法库（v7）
    globalStitchCustomizations: {
      names: {},                    // 全局针法名称自定义
      colors: {}                    // 全局针法颜色自定义
    },
    voiceEnabled: false,            // 进入项目默认开启语音
    voiceSoundEnabled: false,       // 语音模式音效
    highlightEnabled: false,        // 流式模式开关（v3）
    profile: { name: '' }           // 本地昵称（v6）
  }
}
```

**修改指引**:
- 新增字段: 先在 `js/state.js` 定义默认值，在 `js/storage.js` 的 `migrateData()` 添加兼容逻辑，bump `LATEST_SCHEMA`
- 修改 IndexedDB key: 编辑 `js/storage.js:95`
- 修改存储适配器行为: 编辑 `js/storage.js:65-93`
- 新增 IndexedDB store: 编辑 `js/storage.js:39-63` — `openDB()` 的 `onupgradeneeded`


### 数据层 - 数据迁移逻辑

**用户描述方式**:
- 主要: "旧数据兼容"、"数据升级"、"老版本数据迁移"
- 别名: "data migration"、"格式转换"、"数据升级脚本"

**代码位置**:
- 迁移函数: `js/storage.js:248-420` — `migrateData(d)`
- 调用时机: `js/storage.js:234` — `loadData()` 读取数据后立即调用
- schema 版本常量: `js/storage.js:97` — `LATEST_SCHEMA`（当前值为 11）
- 版本历史: `js/storage.js:1-28` — 文件头注释块
- 旧 ID 映射: `stitches.js:42-45` — `OLD_ID_MAP`
- 一次性迁移: `js/storage.js:100-138` — localStorage → IndexedDB 自动迁移

**版本门控迁移规则**（每次改数据形状必须遵循）:
1. Bump `LATEST_SCHEMA` 常量 +1
2. 更新文件顶部版本历史注释
3. 在 `migrateData()` 中添加 `if (d.schemaVersion < N) { ... }` 块
4. 更新本文档的本节内容

**迁移项目**:
- **v0 → v1** (schemaVersion < 1):
  - 补全 `customSettings` 结构
  - 旧版 `p.rounds` → 新版 `p.parts[].rounds` 封装
  - 补全每个 part 的字段
  - 针法 ID 通过 `OLD_ID_MAP` 映射
  - 补全 `archived` 默认值
- **v1 → v2** (schemaVersion < 2):
  - `proj.coverImage`（base64）迁移到独立 localStorage key `img_{projId}`
  - 从项目对象中删除 `coverImage` 字段
  - 随后由 `migrateFromLocalStorage()` 迁入 IndexedDB covers store
- **v2 → v3** (schemaVersion < 3):
  - 补全 `settings.highlightEnabled` 字段（默认 false）
- **v3 → v4** (schemaVersion < 4):
  - 补全所有项目的 `lastModified` 时间戳
- **v4 → v5** (schemaVersion < 5):
  - 补全 `settings.globalCustomStitches` 字段
- **v5 → v6** (schemaVersion < 6):
  - 补全 `settings.profile` 字段（`{ name: '' }`）
  - 本地头像单独存取于 storageAdapter key `profile_avatar`
- **v6 → v7** (schemaVersion < 7):
  - 项目级自定义针法合并到全局 `globalCustomStitches` / `globalStitchCustomizations`
  - 废弃项目级 `customSettings` 的针法定义字段
- **v7 → v8** (schemaVersion < 8):
  - 新增 `project.refImages`（参考图，数组存储 IndexedDB keys）
- **v8 → v9** (schemaVersion < 9):
  - 新增 `project.focusSessions`（专注时长记录）+ `project.dailyCount`（每日针数）
- **v9 → v10** (schemaVersion < 10):
  - 新增 `project.markers`（记号扣，针目级彩色标记+备注）
- **v10 → v11** (schemaVersion < 11):
  - 新增 `part.lastPosition`（钩织进度记忆，记录最后钩织位置）

**修改指引**:
- 添加新的数据迁移规则: 编辑 `js/storage.js:248-420`
- 添加旧 ID 映射: 编辑 `stitches.js:42-45` — `OLD_ID_MAP`
- 修改当前 schema 版本: 编辑 `js/storage.js:97` — `LATEST_SCHEMA`


### 基础设施 - 针法库定义

**用户描述方式**:
- 主要: "针法列表"、"全部针法"、"针法缩写定义"
- 别名: "stitch library"、"针法库"、"STITCH_LIB"、"内置针法"

**代码位置**:
- 针法库: `stitches.js:4-39` — `STITCH_LIB` 对象（22 种预设针法）
- 针法分类: 每个针法的 `category` 字段（basic / increase / decrease / special）
- 别名映射: `stitches.js:48-52` — `ALIAS_TO_ID`（中文名 → 英文 ID）
- 针法数组: `stitches.js:68-74` — `STITCHES`、`SM`
- 图解解析器: `stitches.js:87-203` — `parsePattern()`、`extractStitches()`、`normalizeStitch()`、`resolveColor()`
- 颜色主题: `stitches.js:57-67` — `COLOR_THEMES`
- 动态正则: `js/stitch.js` — `rebuildDynamicTokenRE()` 支持自定义针法

**内置针法分类**:
- 基础: X(短针), T(中长针), F(长针), E(长长针), CH(锁针), SL(引拔), SK(空针)
- 加针: V, W, TV, TW, FV, FW, EV
- 减针: A, M, TA, TM, FA, FM, EA
- 特殊: G(爆米花针), Q(枣形针)

**注意**: BLO/FLO 已从内置针法库移除，但 `extractStitches()` 的正则仍保留 BLO/FLO 匹配以向后兼容图解解析

**修改指引**:
- 新增预设针法: 在 `stitches.js` 的 `STITCH_LIB` 中添加条目 + 更新 `COLOR_THEMES` 和 `ALL_THEMES` 颜色映射
- 修改针法中文名: 编辑对应条目的 `label` 字段
- 修改别名映射: 编辑 `stitches.js:48-52` 的 `ALIAS_TO_ID` 构建逻辑
- 修改图解解析规则: 编辑 `stitches.js:87-203`
- 注意：新增针法后需更新 `js/locales/terms.js` 的术语翻译


### 基础设施 - 全局状态管理

**用户描述方式**:
- 主要: "应用状态"、"全局数据"、"应用记忆"
- 别名: "state"、"全局变量"、"应用上下文"、"数据存储"

**代码位置**:
- 状态定义: `js/state.js:4-51` — 完整的 `state` 对象
- 辅助函数: `js/state.js:72-87` — `uid()`, `getProj()`, `getActivePart()`, `isPartEmpty()`, `getEditingPartId()`
- 每日计数: `js/state.js:89-120` — `getTodayKey()`, `getDailyLog()`, `addDailyCount()`, `calcTotalDays()`, `clearDailyLog()`
- 数字映射: `js/state.js:59-69` — `NUMBER_MAP`
- 全局暴露: `js/main.js:42` — `window.state = state`
- editingPartId 同步: `js/state.js:54-57` — `Object.defineProperty(window, 'editingPartId', ...)`

**状态字段说明**:
- `curProjId`: 当前打开的项目 ID
- `immersiveMode`: 沉浸模式开关
- `expandedRounds`: Set，记录展开的圈 ID
- `selectedStitch`: 被选中的针法位置 {roundId, idx}
- `highlightMode`: 流式模式是否开启
- `highlightIndex`: 流式模式当前针序号
- `pendingInsert`: 待插入状态 {roundId, idx, dir}
- `filterByRound`: 是否按圈筛选针法（默认 true）
- `editingPartId`: 正在编辑名称的部件 ID
- `currentTab`: 当前标签页（'projects' / 'settings'）
- `voiceMode`: 语音模式是否开启
- `recognition`: SpeechRecognition 实例
- `flowState.*`: 各种临时流程状态
- `_lastDeletedRound`: 最后删除的圈（撤销用）
- `_sessionStart`: 会话开始时间戳

**修改指引**:
- 新增全局状态: 在 `js/state.js:4-51` 添加字段
- 修改 uid 生成算法: 编辑 `js/state.js:72`
- 修改 getProj 查找逻辑: 编辑 `js/state.js:73`
- 新增辅助函数: 在 `js/state.js:72-87` 区域添加


### 基础设施 - 全局函数注册机制

**用户描述方式**:
- 主要: "全局函数"、"HTML onclick 调用"、"window 函数注册"
- 别名: "_globals"、"函数暴露"、"inline handler"

**代码位置**:
- 注册机制: `js/main.js:126-157` — `_globals` 对象 + `Object.entries` 遍历挂到 `window`
- 所有模块的 export 函数通过 `_globals` 暴露给 HTML 的 `onclick` 属性
- import 列表: `js/main.js:1-37` — 所有模块导入声明

**运作方式**:
- 各 JS 模块通过 ES Module `export` 导出函数
- `main.js` import 所有需要的函数
- 在 `_globals` 对象中列出需要暴露到 `window` 的函数
- 通过 `Object.entries(_globals).forEach(...) => window[k] = v` 注册

**修改指引**:
- 新增全局函数: 在对应模块中 export，在 `main.js` 顶部 import，在 `_globals` 对象中添加条目
- 移除全局函数: 从 `_globals` 中删除对应条目
- 修改全局注册方式: 编辑 `js/main.js:157`


---

## 使用说明

### 对于用户
当你想修改某个功能时，只需告诉 AI：

- "我想修改新建项目按钮的颜色"
- "搜索框的位置需要调整"
- "圈号 badge 的颜色不对"
- "删除确认弹窗的文案要改"
- "语音模式说'撤销'没反应"
- "导出备份的文件名想改成中文"
- "进度条超出的红色太刺眼了"
- "怎么新增一种预设针法"
- "我想在引导页加一张新卡片"
- "深色模式配色想调亮一点"
- "Nav Bar 滚动隐藏太快了"
- "流式模式怎么关掉 PRO 徽标"
- "分享卡片想改一下布局"
- "记号扣颜色想加粉色"
- "参考图标注画笔太细了"
- "iPad 横屏左边太大了"
- "针法符号想换成美式的"
- "想给首页加个统计数据"
- "FAB 按钮颜色想换"
- "沉浸模式按钮太小了"

### 对于 AI
收到用户需求后：

1. 在映射表中搜索相关的"用户描述方式"关键词
2. 定位到对应的"代码位置"
3. 根据"修改指引"提供具体的修改方案
4. 优先使用 `Edit` 工具做精确修改，避免大段重写
5. **样式只能改 `styles.css`，不要在任何 JS 或 HTML 中新增 CSS**
6. **ui-redesign 分支上不修改 js/ 目录下的逻辑文件**
7. **新增翻译文本时必须在 zh.js 和 en.js 中同时添加对应键值**
8. **修改数据结构时必须 bump LATEST_SCHEMA 并添加迁移逻辑**
