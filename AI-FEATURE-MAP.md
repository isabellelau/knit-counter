# 钩织计数本 功能-代码映射报告

## 项目概览

- **技术栈**: 原生 JS (ES Modules) + PWA (Service Worker + Web Manifest)，无前端框架
- **架构模式**: 事件驱动 + 领域模块化（每个功能域一个 JS 文件），伪 SPA（DOM 整体替换实现页面切换）
- **状态管理**: 全局单例 `state` 对象 (`js/state.js`)，数据直接就地修改，通过 `saveData()` 持久化到 localStorage
- **样式方案**: 单文件 `styles.css`，CSS 自定义属性实现玫瑰灰莫兰迪主题，`html.theme-light` / `html.theme-dark` 类名控制深浅色
- **构建工具**: 无构建步骤，原生 ES Module 直接运行；`scripts/inject-version.js` 注入版本号到 HTML/SW
- **包管理**: 无（纯前端项目，Tesseract.js 动态 CDN 加载）
- **离线方案**: Service Worker (`sw.js`) 缓存优先策略 + Web App Manifest (`manifest.json`)

## 功能模块统计

- **页面级视图**: 3 个（首页项目列表、项目详情页、设置页）+ Onboarding 引导页
- **可复用 UI 组件**: 4 个（Sheet 弹窗、Dialog 对话框、Toast 提示、Loading 遮罩）
- **业务逻辑模块**: 12 个 JS 文件（按领域拆分）
- **样式文件**: 1 个（`styles.css`）
- **配置文件**: 2 个（`manifest.json`、`sw.js`）

## 目录结构概览

```
knit/
├── index.html              # 入口 HTML + SW 注册 + 更新提示
├── styles.css              # 全局样式（唯一样式来源）
├── sw.js                   # Service Worker（离线缓存）
├── manifest.json           # PWA 配置
├── stitches.js             # 针法库（STITCH_LIB 定义 + 别名映射 + 图解解析器 + 颜色主题）
├── scripts/
│   └── inject-version.js   # 构建时版本号注入
├── knit-counter/           # 独立子项目（钩织计数器）
└── js/
    ├── main.js             # 入口模块 + 全局函数注册 + Onboarding 逻辑 + 滚动行为
    ├── state.js            # 全局状态 + 辅助函数
    ├── storage.js          # 数据持久化（localStorage 适配层 + 迁移逻辑）
    ├── ui.js               # 通用 UI 组件（Toast/Sheet/Dialog/EntryChoiceSheet）
    ├── render.js           # 页面渲染（首页 / 项目详情）
    ├── project.js          # 项目管理（新建/删除/归档/导入/PWA教程）
    ├── stitch.js           # 针法操作（添加/撤销/修改/插入/自定义调色板/任务进度）
    ├── round.js            # 圈/行操作（增删切换）
    ├── part.js             # 部件操作（增删改切换）
    ├── pattern.js          # 图解导入（粘贴/OCR/解析确认）
    ├── voice.js            # 语音识别（Web Speech API + 音效）
    ├── settings.js         # 设置页/Sheet（主题/语音/数据管理）
    └── image.js            # 图片处理（封面压缩/存取）
```


---

## 功能映射表

### 系统 - 主题系统（深色/浅色模式）

**用户描述方式**:
- 主要: "主题颜色"、"深色模式"、"浅色模式"、"夜间模式"
- 别名: "theme"、"dark mode"、"配色方案"、"莫兰迪"、"夜色"

**代码位置**:
- CSS 变量定义: `styles.css:8-132` — `:root`（浅色默认）、`@media (prefers-color-scheme: dark)`（跟随系统）、`html.theme-light`（强制浅色）、`html.theme-dark`（强制深色）
- 针法颜色: `stitches.js:55-65` — `COLOR_THEMES.morandi`（玫瑰灰莫兰迪浅色语义分色）、`js/stitch.js:26-37` — `ALL_THEMES.night`（深色方案）
- 切换逻辑: `js/settings.js:166-203` — `changeTheme(themeKey)`
- 初始化恢复: `js/main.js:162-169`
- 默认值: `js/state.js:9` — `settings.theme: "morandi"`
- 颜色解析: `js/stitch.js:39-47` — `getProjColor()`（morandi → 从 `COLOR_THEMES` + `resolveColor()` 取，night → 从 `ALL_THEMES.night` 硬编码映射）
- 设置页 UI: `js/settings.js:15-18`（Sheet 版）、`js/settings.js:86-89`（全页版）— 2 个主题卡片

**视觉标识**:
- 玫瑰灰莫兰迪色系：`--bg: #FAF5F5`（暖粉底）、`--accent: #C9969F`（干枯玫瑰）
- 深色模式：`--bg: #2A2123`（深棕底）、`--accent: #C4909A`
- CSS 变量体系：`--bg`, `--bg-secondary`, `--card`, `--border`, `--border-strong`, `--text`, `--text-secondary`, `--muted`, `--accent`, `--accent-dark`, `--accent-bg`, `--danger`, `--danger-bg`, `--glass-bg`
- 设置页 2 列主题卡片，每个显示 4 个颜色圆点（X/V/A/CH）
- 选中卡片有 `var(--accent)` 色边框高亮

**修改指引**:
- 修改浅色主题配色: 编辑 `styles.css:8-74` 的 `:root` 变量
- 修改深色主题配色: 编辑 `styles.css:76-99` 的 `@media (prefers-color-scheme: dark)` 块 和 `styles.css:117-132` 的 `html.theme-dark` 块
- 修改针法颜色（浅色）: 编辑 `stitches.js:55-65` 的 `COLOR_THEMES.morandi`
- 修改针法颜色（深色）: 编辑 `js/stitch.js:27-36` 的 `ALL_THEMES.night`
- 新增主题: 在 `js/settings.js` 的 themes 数组添加条目，在 `styles.css` 添加对应 CSS 类或媒体查询，在 `js/stitch.js` 的 `ALL_THEMES` 添加颜色映射


### 界面元素 - iOS Nav Bar（顶部导航栏）

**用户描述方式**:
- 主要: "顶部导航栏"、"header"、"标题栏"、"nav bar"
- 别名: "iOS 导航栏"、"顶部栏"、"返回按钮区域"

**代码位置**:
- HTML 结构: `index.html:102-109` — `<header class="nav-bar">` 含 `nav-back`、`nav-small-title`、`nav-actions`
- 样式: `styles.css:183-289` — `.nav-bar`, `.nav-back`, `.nav-small-title`, `.nav-actions`, `.nav-btn`, `.nav-btn--pill`
- 首页/项目页状态切换: `js/render.js:24-39`（首页隐藏返回、显示大标题）、`js/render.js:151-203`（项目页显示返回、隐藏大标题、渲染操作按钮）
- 滚动隐藏行为（项目页）: `js/main.js:95-113` — 向下滚 >4px 隐藏 `.nav-bar.hidden`，向上滚 >4px 显示
- 大标题与小标题切换: `js/main.js:82-93` — IntersectionObserver 监听 `large-title-wrap`

**视觉标识**:
- 粘性定位顶部，毛玻璃半透明背景（`var(--glass-bg)` + `backdrop-filter: blur(12px)`）
- 高度 `calc(44px + env(safe-area-inset-top))`，补偿刘海/灵动岛
- 首页：返回按钮隐藏、中间小标题不显示、右侧无操作按钮
- 项目页：左侧"‹ 返回"按钮可见、中间显示项目名（点击可重命名）、右侧显示圈/行切换 + 设置 + PDF 按钮
- 首页滚过大标题后，小标题"我的项目"淡入
- 项目页向下滚时整条 nav-bar 上移隐藏（`translateY(-100%)`），向上滚时重新出现

**修改指引**:
- 修改 nav-bar 高度: 编辑 `styles.css:190` — `height: calc(44px + env(safe-area-inset-top))`
- 修改毛玻璃效果: 编辑 `styles.css:192-194` 的 `background` 和 `backdrop-filter`
- 修改小标题文字: 首页 → `js/render.js:34`，项目页 → `js/render.js:162`
- 修改返回按钮文字/符号: 编辑 `index.html:103-106` 的 `nav-back-arrow` 和 `nav-back-label`
- 修改滚动隐藏阈值: 编辑 `js/main.js:106-108` 的 `>4` / `<4` 像素


### 界面元素 - Large Title（首页大标题）

**用户描述方式**:
- 主要: "大标题"、"首页标题"、"我的项目标题"
- 别名: "large title"、"iOS 大标题"、"统计副标题"

**代码位置**:
- HTML 结构: `index.html:113-116` — `large-title-wrap` 含 `large-title-text` 和 `large-title-sub`
- 样式: `styles.css:291-311` — `.large-title-wrap`, `.large-title-text`, `.large-title-sub`
- 渲染: `js/render.js:37-39`（首页文字）、`js/render.js:48-49`（首页副标题统计）
- 项目页隐藏: `js/render.js:189` — `largeTitleWrap.style.display = 'none'`
- 滚动联动: `js/main.js:82-93` — IntersectionObserver 监听大标题与 nav small title 切换

**视觉标识**:
- 首页顶部大标题"我的项目"（34px 粗体）+ 副标题"3 个项目 · 累计 1,234 针"（13px 灰色）
- 只在首页显示，进入项目页后隐藏
- 顶部有 safe-area 补偿 padding

**修改指引**:
- 修改大标题文字: 编辑 `js/render.js:37`
- 修改标题字号: 编辑 `styles.css:299` — `var(--text-large-title)` 即 34px
- 修改统计格式: 编辑 `js/render.js:49`


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
- 卡片 3：应用图标 + "钩织计数本"（开始使用）
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
- Large Title padding: `styles.css:294` — `padding-top: max(8px, calc(env(safe-area-inset-top) + 8px))`
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


### 页面导航 - 底部标签栏（Tab Bar）

**用户描述方式**:
- 主要: "底部导航栏"、"底部标签"、"底部切换栏"
- 别名: "Tab 栏"、"底部菜单"、"导航切换"

**代码位置**:
- HTML 结构: `index.html:124-133` — 两个按钮 `tab-projects` / `tab-settings`，各含 `tab-icon` + `tab-label`
- 样式: `styles.css:717-764` — `#tab-nav`（fixed, 毛玻璃）, `.tab-btn`（flex column）, `.tab-icon`（24px）, `.tab-label`（10px, display:none）
- 切换逻辑: `js/main.js:57-72` — `switchTab()` / `updateTabNav()`
- 显示/隐藏: `js/render.js:41`（首页显示）、`js/render.js:205`（项目页隐藏）、`js/settings.js:77`（设置页显示项目时隐藏）

**视觉标识**:
- 固定在屏幕底部，毛玻璃背景（`var(--glass-bg)` + `backdrop-filter: blur(10px)`）
- 两个纯图标按钮：⊞ 项目 / ⚙︎ 设置（标签文字 `display:none`）
- 选中时图标为 `var(--accent)`（玫瑰色）并 `scale(1.1)`，未选中为 `var(--muted)`

**修改指引**:
- 修改标签图标: 编辑 `index.html:126` 和 `index.html:130` 的 `tab-icon` 内容
- 修改选中高亮颜色: 编辑 `styles.css:749` — `.tab-btn.active` 的 `color: var(--accent)`
- 恢复文字标签: 编辑 `styles.css:763` — `.tab-label` 的 `display` 改为 `block`
- 修改切换行为: 编辑 `js/main.js:57-65`


### 页面导航 - 页面切换动画

**用户描述方式**:
- 主要: "页面切换动画"、"滑入效果"、"过渡动画"
- 别名: "切换动效"、"slide 动画"、"进退场动画"

**代码位置**:
- CSS 动画: `styles.css:168-181` — `slide-in-right` / `slide-in-left` keyframes + `.enter-forward` / `.enter-back` 类
- 触发逻辑: `js/project.js:22-23`（打开项目 → `enter-forward`），`js/main.js:52-53`（返回首页 → `enter-back`）

**视觉标识**:
- 进入项目: 从右滑入（0.25s cubic-bezier）
- 返回首页: 从左滑入（0.25s cubic-bezier）

**修改指引**:
- 修改动画速度/缓动: 编辑 `styles.css:180-181` 的 `animation` 属性
- 修改动画关键帧: 编辑 `styles.css:168-179` 的 `@keyframes`
- 修改触发时机: 编辑 `js/project.js:22-23` 和 `js/main.js:52-53`


### 数据管理 - 项目列表页（首页）

**用户描述方式**:
- 主要: "首页"、"项目列表"、"我的项目页面"
- 别名: "主页"、"home 页"、"所有项目"、"项目总览"

**代码位置**:
- 渲染函数: `js/render.js:22-139` — `renderHome()`
- Nav Bar 状态: `js/render.js:24-41` — 恢复首页 Nav Bar
- 统计计算: `js/render.js:43-50`（总项目数/总针数 → `large-title-sub`）
- 激活项目卡片: `js/render.js:64-89`（iOS 卡片风格）
- 归档项目区域: `js/render.js:93-125`（半透明 + "📦 已归档" 标题）
- 空状态: `js/render.js:62` — "还没有项目，点击下方创建第一个 🌸"
- 封面颜色生成: `js/render.js:10-16` — `COVER_COLORS` + `getCoverColor()` / `getProjectInitial()`
- 样式: `styles.css:313-415` — `.proj-list`, `.proj-card`, `.proj-thumb`, `.proj-info`, `.proj-name`, `.proj-meta`, `.proj-more`, `.home-footer`, `.home-new-btn`

**视觉标识**:
- Large Title "我的项目" + 副标题 "N 个项目 · 累计 N 针"
- 项目卡片：左侧 48×48 圆角色块（首字大写 + COVER_COLORS 背景）或封面图片 → 项目名 + 部件/圈/针统计 → ··· 菜单按钮
- 卡片有 `:active` 按下变暗效果
- 底部全宽圆角按钮"＋ 新建项目"（`var(--accent)` 背景）

**修改指引**:
- 修改首页标题: 编辑 `js/render.js:37`
- 修改空状态提示: 编辑 `js/render.js:62`
- 修改项目卡片外观: 编辑 `styles.css:321-390` 的 `.proj-card` 系列
- 修改封面颜色方案: 编辑 `js/render.js:10-12` 的 `COVER_COLORS`
- 修改新建按钮文字: 编辑 `js/render.js:129-130`


### 数据管理 - 新建项目

**用户描述方式**:
- 主要: "新建项目"、"创建项目"、"添加新项目"
- 别名: "＋ 按钮"、"开始新项目"、"创建钩织项目"

**代码位置**:
- 首页按钮: `js/render.js:128-131` — FAB 按钮"＋ 新建项目"
- Dialog 弹窗: `js/project.js:63-90` — `showNewProjectDialog()`
- 创建确认: `js/project.js:68-76` — 创建 project 对象并保存
- 创建后流程: `js/ui.js:91-113` — `showEntryChoiceSheet()`（粘贴图解 / 手动创建 / 跳过）
- Dialog HTML: `index.html:146-156`

**视觉标识**:
- 首页底部全宽圆角按钮（`var(--accent)` 背景）
- 点击后弹出 Dialog 输入框，placeholder "项目名称，例如：粉色帽子"
- 输入名称后弹出创建方式选择 Sheet：粘贴图解（自动配置）/ 手动创建（自定义针法）/ 跳过（使用全部针法）

**修改指引**:
- 修改按钮文字: 编辑 `js/render.js:130`
- 修改输入框 placeholder: 编辑 `index.html:150`
- 修改新项目默认结构: 编辑 `js/project.js:67-76`
- 修改创建方式选项: 编辑 `js/ui.js:91-113`


### 数据管理 - 项目卡片菜单（···）

**用户描述方式**:
- 主要: "项目菜单"、"三个点菜单"、"项目操作菜单"
- 别名: "弹出菜单"、"卡片菜单"、"··· 按钮"

**代码位置**:
- 菜单展开: `js/project.js:92-133` — `toggleProjMenu()`，通过 `showSheet()` 显示操作列表
- 菜单项：设置封面 / 移除封面 / 归档（或取消归档）/ 分割线 / 删除项目
- 触发: `js/render.js:86-87`（激活项目卡片）、`js/render.js:120-121`（归档项目卡片）
- 样式: `styles.css:376-390`（`.proj-more` 按钮）

**视觉标识**:
- Sheet 底部弹窗，标题显示项目名
- 菜单项：🖼 设置封面 / 🗑 移除封面（有封面时）/ 📦 归档（或 📤 取消归档）/ 🗑 删除项目（红色）
- 底部有"取消"按钮

**修改指引**:
- 修改菜单项: 编辑 `js/project.js:100-131`
- 修改菜单外观: 编辑 Sheet 相关样式 `styles.css:845-1000`
- 新增菜单项: 在 `js/project.js:125-131` 之前添加新按钮


### 数据管理 - 归档/取消归档项目

**用户描述方式**:
- 主要: "归档项目"、"取消归档"、"隐藏已完成项目"
- 别名: "存档"、"放入归档"、"恢复项目"、"archive"

**代码位置**:
- 归档功能: `js/project.js:135-147` — `archiveProject()`
- 取消归档: `js/project.js:244-247` — `unarchiveProject()`
- 归档成功弹窗: `js/project.js:149-193` — `showArchiveSuccessSheet()`
- 归档卡片样式: `styles.css:392-394` — `.proj-card.archived`（opacity 0.55）

**视觉标识**:
- 归档项目显示在首页下方独立区域"📦 已归档 (N)"
- 归档卡片半透明（opacity 0.55）
- 归档成功后弹出 Sheet 显示项目摘要 + PWA 安装提示 + 备份下载按钮

**修改指引**:
- 修改归档确认文案: 编辑 `js/project.js:139`
- 修改归档成功弹窗内容: 编辑 `js/project.js:149-193`
- 修改已归档区域标题: 编辑 `js/render.js:95`
- 修改归档卡片透明度: 编辑 `styles.css:393`


### 数据管理 - 删除项目

**用户描述方式**:
- 主要: "删除项目"、"移除项目"、"删除整个项目"
- 别名: "delete project"、"彻底删除"、"清除项目"

**代码位置**:
- 删除功能: `js/project.js:249-257` — `deleteProject()`
- 确认弹窗: 调用 `showConfirmDialog`，文案"确定要删除这个项目吗？此操作不可恢复。"

**视觉标识**:
- 菜单项为红色"🗑 删除项目"
- 确认弹窗：居中 Dialog

**修改指引**:
- 修改确认提示文案: 编辑 `js/project.js:252`
- 修改删除逻辑: 编辑 `js/project.js:253-255`


### 数据管理 - 导出/导入备份

**用户描述方式**:
- 主要: "导出数据"、"备份数据"、"导入备份"、"恢复数据"
- 别名: "下载备份"、"数据迁移"、"备份还原"、"导出 JSON"

**代码位置**:
- 导出全部: `js/storage.js:223-233` — `exportData()`
- 导出单个项目: `js/storage.js:235-261` — `exportSingleProject(id)`
- 导入备份: `js/project.js:27-61` — `importData(input)`
- 设置页入口: `js/settings.js:55-59`（Sheet 版）、`js/settings.js:141-145`（全页版）

**视觉标识**:
- 设置页中三个按钮：📤 导出备份 / 📥 导入备份（文件选择）/ 🗑 清空所有数据
- 导出下载文件名为 `钩织计数本备份_YYYY-MM-DD.json`
- 单个导出为 `项目名_日期.knt`
- 导入后弹出确认弹窗（"确定导入备份？共有 N 个项目..."）

**修改指引**:
- 修改导出文件名: 编辑 `js/storage.js:228`（全部）, `js/storage.js:250`（单个）
- 修改导入校验规则: 编辑 `js/project.js:35-39`
- 修改导入确认文案: 编辑 `js/project.js:41`


### 数据管理 - 清空所有数据

**用户描述方式**:
- 主要: "清空所有数据"、"重置应用"、"删除全部项目"
- 别名: "清除数据"、"全部删除"、"恢复出厂"

**代码位置**:
- 功能: `js/settings.js:219-231` — `clearAllData()`
- 入口: 设置页红色按钮"🗑 清空所有数据"

**修改指引**:
- 修改确认文案: 编辑 `js/settings.js:220`
- 修改按钮颜色: 编辑 `styles.css:1139-1142` — `.settings-btn-danger`


### 业务功能 - 进入项目详情页

**用户描述方式**:
- 主要: "打开项目"、"进入项目"、"查看项目详情"
- 别名: "点击项目卡片"、"进入钩织页面"、"打开项目详情"

**代码位置**:
- 打开项目: `js/project.js:7-25` — `openProject(id)`
- 渲染项目页: `js/render.js:142-300` — `renderProject()`
- 触发: 首页项目卡片 `onclick="openProject('${p.id}')"`

**视觉标识**:
- 点击卡片后页面从右滑入
- Nav Bar 切换为项目模式（返回按钮 + 项目名 + 操作按钮）
- Large Title 隐藏
- 显示部件选项卡、任务进度条、圈/行列表、底部操作栏

**修改指引**:
- 修改打开项目时的初始状态: 编辑 `js/project.js:9-16`
- 修改页面渲染结构: 编辑 `js/render.js:142-300`


### 业务功能 - 项目名称编辑

**用户描述方式**:
- 主要: "修改项目名"、"重命名项目"、"编辑项目标题"
- 别名: "更改名称"、"项目改名"、"点击标题编辑"

**代码位置**:
- Nav Bar 小标题点击: `js/render.js:162-183` — `navSmall.onclick`，弹出 Dialog 输入新名称
- 重命名逻辑: `js/project.js:259-263` — `renameProject(name)`

**视觉标识**:
- 项目页 Nav Bar 中间显示项目名，点击弹出 Dialog 输入框
- 或通过首页卡片菜单操作

**修改指引**:
- 修改编辑触发方式: 编辑 `js/render.js:164-182`
- 修改重命名逻辑: 编辑 `js/project.js:259-263`


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
- 渲染: `js/render.js:237-269` — 圈/行卡片 HTML
- 新增圈: `js/round.js:8-23` — `addRound()`
- 展开/收起: `js/round.js:25-39` — `toggleRound(rid)`
- 设置活跃圈: `js/round.js:114-191` — `setActiveRound(proj, rid)`
- 删除圈: `js/round.js:41-90` — `deleteRound()`
- 撤销删除: `js/round.js:92-112` — `undoDeleteRound()`
- 样式: `styles.css:527-604` — `.round-card`, `.round-hdr`, `.round-badge`, `.round-label`, `.round-body`

**视觉标识**:
- 每圈一个白色圆角卡片
- 左侧方形 badge：数字（圈号）或"起"（起针）或"文"（备注卡）
- 活跃圈 badge 为 `var(--accent)` 填充 + 标签后显示"编辑中"棕色标签
- 展开后显示针法序列（彩色胶囊标签）
- 右侧有"编辑"文本按钮、× 删除按钮、› 展开箭头

**修改指引**:
- 修改新建圈后的滚动行为: 编辑 `js/round.js:19-22`
- 修改删除撤销时长: 编辑 `js/round.js:84` 的 `5000`
- 修改圈号显示格式: 编辑 `js/render.js:246`
- 修改展开图标: 编辑 `js/render.js:253` 的 `›` 字符


### 交互功能 - 添加针法（点按钮）

**用户描述方式**:
- 主要: "添加一针"、"记录针法"、"点针法按钮"
- 别名: "加针"、"添加 stitch"、"记录钩了什么针"、"push stitch"

**代码位置**:
- 针法按钮渲染: `js/stitch.js:578-628` — `renderDynamicPalette(proj)`
- 添加针法: `js/stitch.js:198-227` — `pushStitch(sid)`
- 按钮点击: `onclick="pushStitch('${sid}')"`

**视觉标识**:
- 底部 3 列彩色按钮，各代表一种针法
- 按钮显示针法中文名 + 缩写 ID（如"短针 X"）
- 语音模式下按钮显示数字（1-9）
- 添加后对应圈自动展开，滚动到该圈视图中央

**修改指引**:
- 修改默认针法列表: 编辑 `js/stitch.js:594` 的 fallback 数组
- 修改按钮颜色逻辑: 编辑 `js/stitch.js:39-47` — `getProjColor()`
- 修改添加后的滚动行为: 编辑 `js/stitch.js:221-226`


### 交互功能 - 撤销上一针

**用户描述方式**:
- 主要: "撤销"、"删除最后一针"、"撤回上一步"
- 别名: "undo"、"取消"、"回退一针"

**代码位置**:
- 撤销功能: `js/stitch.js:229-254` — `undoStitch()`
- 按钮: `js/stitch.js:660` — 底部操作栏"↩ 撤销"按钮

**视觉标识**:
- 底部操作栏左侧灰色按钮"↩ 撤销"
- 删除当前活跃圈最后一针并更新界面

**修改指引**:
- 修改按钮文字: 编辑 `js/stitch.js:660`
- 修改撤销行为: 编辑 `js/stitch.js:229-254`


### 交互功能 - 点击针法胶囊（修改/删除/插入单针）

**用户描述方式**:
- 主要: "修改某一针"、"替换针法"、"删除某一针"、"插入针法"
- 别名: "点击胶囊"、"stitch tap"、"编辑已添加的针"

**代码位置**:
- 点击触发: `js/stitch.js:256-258` — `stitchTap(roundId, idx)`
- 弹出面板: `js/stitch.js:261-297` — `openStitchSheet()`
- 替换针法: `js/stitch.js:299-327` — `changeStitch()`
- 删除单针: `js/stitch.js:329-360` — `deleteStitch()`
- 插入针法: `js/stitch.js:362-413` — `startInsert()` / `doInsert()`
- 胶囊渲染: `js/stitch.js:142-153` — `renderSpillHTML()`
- 胶囊样式: `styles.css:606-650` — `.seq-wrap`, `.spill`, `.spill-idx`, `.spill-abbr`

**视觉标识**:
- 每针显示为彩色圆角胶囊：序号 + 缩写（如 `1 X`）
- 点击后弹出 Sheet：显示当前针法名称、可替换为其他针法（3 列网格）、在前后插入、删除此针

**修改指引**:
- 修改胶囊样式: 编辑 `styles.css:621-650` 的 `.spill` 系列
- 修改替换面板布局: 编辑 `js/stitch.js:269-297`
- 修改插入面板: 编辑 `js/stitch.js:362-372`


### 业务功能 - 针法配置（自定义调色板）

**用户描述方式**:
- 主要: "增减针法"、"配置常用针法"、"自定义针法面板"
- 别名: "针法设置"、"调色板配置"、"选择针法"、"stitch setup"

**代码位置**:
- 打开配置: `js/stitch.js:667-765` — `openStitchSetup(mode)`
- 切换选中: `js/stitch.js:767-783` — `toggleSetupStitch(sid)`
- 保存配置: `js/stitch.js:977-1010` — `saveProjectStitches(mode)`
- 触发入口: 底部"＋增减"虚线按钮 (`js/stitch.js:623-625`)
- 样式: `styles.css:967-1000` — `.picker-grid`, `.picker-btn`

**视觉标识**:
- Sheet 弹窗，标题"选择常用针法"
- 针法按 4 分类分组：基础针法 / 加针类 / 减针类 / 特殊针法
- 每个针法显示为 3 列按钮，已选中为实心彩色，未选中为白底
- 底部按钮栏：全选 / 📋 导入图解 / ＋ 新建针法 / 取消 / 更新配置
- 创建模式按钮文字为"开始钩织"

**修改指引**:
- 修改分类名称: 编辑 `js/stitch.js:701-705` 的 `categories` 对象
- 修改按钮列数: 编辑 `js/stitch.js:728` 中的 `repeat(3,1fr)`
- 修改全选按钮逻辑: 编辑 `js/pattern.js:25-45` — `toggleSelectAllInSetup()`


### 业务功能 - 自定义针法名称和颜色

**用户描述方式**:
- 主要: "自定义针法名称"、"修改针法颜色"、"个性化针法"
- 别名: "改针法颜色"、"重命名针法"、"stitch customize"

**代码位置**:
- 打开自定义面板: `js/stitch.js:785-835` — `openStitchCustomize(sid)`
- 保存自定义: `js/stitch.js:837-857` — `saveStitchCustomize(sid)`
- 恢复默认: `js/stitch.js:859-868` — `resetStitchCustomize(sid)`
- 入口: 配置面板中针法按钮的"✎ 自定义"小字

**视觉标识**:
- Sheet 弹窗，显示针法名称、名称输入框、颜色选择器（native color input）、恢复默认按钮
- 自定义过的针法在配置面板中有黄色小圆点标记
- 自定义名称覆盖预设中文名

**修改指引**:
- 修改名称输入框 maxlength: 编辑 `js/stitch.js:806`
- 修改颜色选择器默认值: 编辑 `js/stitch.js:812-813`
- 修改保存逻辑: 编辑 `js/stitch.js:837-857`


### 业务功能 - 创建自定义针法

**用户描述方式**:
- 主要: "新建针法"、"创建自定义针法"、"添加新 stitch"
- 别名: "自定义 stitch"、"新增针法类型"

**代码位置**:
- 打开表单: `js/stitch.js:876-929` — `openNewStitchForm()`
- 保存: `js/stitch.js:931-954` — `saveNewStitch()`
- 删除自定义针法: `js/stitch.js:956-975` — `deleteCustomStitch(sid)`
- 入口: 配置面板底部虚线按钮"＋ 新建针法"

**视觉标识**:
- Sheet 弹窗表单：缩写 ID（英文输入，自动大写）、中文名称、颜色选择器、分类单选（基础/加针/减针/特殊）
- 自定义针法在配置面板中显示为虚线边框
- 删除按钮为红色

**修改指引**:
- 修改 ID 输入限制: 编辑 `js/stitch.js:891` 的 `oninput` 正则
- 修改分类选项: 编辑 `js/stitch.js:909-912`
- 修改创建后的行为: 编辑 `js/stitch.js:952-953`


### 业务功能 - 圈/行 显示术语切换

**用户描述方式**:
- 主要: "切换圈/行显示"、"圈和行的叫法切换"
- 别名: "显示圈还是行"、"术语切换"、"toggle row terms"

**代码位置**:
- 切换逻辑: `js/stitch.js:12-18` — `toggleRowTerms()`
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
- 渲染: `js/stitch.js:504-547` — `renderTaskSlide(proj)`
- 自动计算预期针数: `js/stitch.js:415-502` — `calcExpectedCount()` / `countTokens()`
- 手动修改预期: `js/stitch.js:549-576` — `editExpectedCount(el)`
- 样式: `styles.css:1224-1279` — `.task-slide`, `.task-slide-text`, `.exp-count`, `.exp-count-input`

**视觉标识**:
- 粘性定位在部件 Tab 下方（`top: var(--hdr-h)`）
- 显示当前圈的图解文字
- 进度条：已完成/预期针数，超出时变红（`#EF4444`）
- 预期针数可点击编辑（数字输入框）
- 切换活跃圈时文字有 fade 过渡动画

**修改指引**:
- 修改无图解时的提示: 编辑 `js/stitch.js:510-511`
- 修改进度条颜色: 编辑 `js/stitch.js:525` 的 `progressColor`
- 修改预期针数解析算法: 编辑 `js/stitch.js:415-502`


### 业务功能 - 针法筛选开关

**用户描述方式**:
- 主要: "只显示当前圈的针法"、"针法筛选"、"过滤针法按钮"
- 别名: "filter by round"、"筛选开关"、"按圈过滤"

**代码位置**:
- 切换逻辑: `js/stitch.js:630-640` — `toggleFilterByRound()`
- 渲染开关: `js/stitch.js:642-652` — `renderFilterToggle()`
- 过滤逻辑在 `renderDynamicPalette()` 内部: `js/stitch.js:598-606`
- 默认开启: `js/state.js:21` — `filterByRound: true`

**视觉标识**:
- 底部操作栏上方，滑动开关 + 文字"仅显示本圈针法"

**修改指引**:
- 修改开关文字: 编辑 `js/stitch.js:647`
- 修改开关外观: 编辑 `js/stitch.js:643-651`


### 业务功能 - 当前圈切换

**用户描述方式**:
- 主要: "切换当前编辑的圈"、"设置当前圈"、"激活某一圈"
- 别名: "选择当前圈"、"set active round"

**代码位置**:
- 切换逻辑: `js/round.js:114-191` — `setActiveRound(proj, rid)`
- 点击触发: 圈 badge 的 `onclick="setActiveRound(null,'${r.id}')"`
- 效果: 更新 activeRoundId、更新 UI badge/label、刷新底部调色板、刷新任务进度

**视觉标识**:
- 点击圈 badge 切换活跃圈
- 活跃圈 badge 变 `var(--accent)` 填充 + 标签后出现"编辑中"标签
- 底部针法面板和任务进度同步更新

**修改指引**:
- 修改活跃圈 badge 样式: 编辑 `styles.css:563-567` — `.round-badge.active`
- 修改"编辑中"标签样式: 编辑 `js/render.js:248`


### 业务功能 - 图解编辑

**用户描述方式**:
- 主要: "编辑图解文字"、"修改图解说明"、"填写钩织图解"
- 别名: "编辑 instruction"、"图解文本"、"编辑图解"

**代码位置**:
- 打开编辑面板: `js/stitch.js:92-112` — `openInstructionEdit(roundId)`
- 保存: `js/stitch.js:114-135` — `saveRoundInstruction(roundId)`
- 点击入口: 圈卡片右侧"编辑"按钮 (`js/render.js:251`)

**视觉标识**:
- Sheet 弹窗，标题"编辑图解"
- 文本框 placeholder 显示示例格式："R4: 10(X,V,X)"
- 保存后刷新进度条

**修改指引**:
- 修改 placeholder 示例: 编辑 `js/stitch.js:105`
- 修改文本框样式: 编辑 `js/stitch.js:100-104`


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
- 创建方式入口: `js/ui.js:91-113` — `showEntryChoiceSheet()`
- 底部按钮入口: `js/stitch.js:661` — "📥 图解"按钮

**视觉标识**:
- 粘贴面板：文本域 + 📷 识别图片（虚线边框） + 🔍 解析预览
- 解析确认面板：每圈可编辑输入框、检测到的针法、× 删除按钮
- 导入选项：当前部件为空→"确认导入并开始"，有数据→"覆盖当前部件"或"作为新部件导入"

**修改指引**:
- 修改文本域 placeholder: 编辑 `js/pattern.js:60-61`
- 修改 OCR 识别语言: 编辑 `js/pattern.js:153` — `'chi_sim+eng'`
- 修改 Tesseract CDN 地址: 编辑 `js/pattern.js:128`
- 修改图解解析规则: 编辑 `stitches.js:87-152` — `parsePattern()`


### 业务功能 - 语音模式

**用户描述方式**:
- 主要: "语音输入"、"语音控制"、"声控钩织"、"说数字加针"
- 别名: "voice mode"、"语音识别"、"语音计数"、"喊针法"

**代码位置**:
- 语音开关: `js/voice.js:105-188` — `toggleVoiceMode()`（3 状态：off / starting / on）
- 语音识别初始化: `js/voice.js:50-103` — `initRecognition()`
- 识别处理: `js/voice.js:58-84` — 匹配数字 1-9 或撤销关键词
- 视觉效果: `js/stitch.js:1022-1038` — `triggerEdgeGlow()`
- 呼吸指示器: `js/voice.js:190-200` — `setVoicePulse()`
- 按钮状态: `js/voice.js:202-224` — `updateVoiceButton()`
- 音效: `js/voice.js:12-48` — `playSound()`
- 底部按钮: `js/stitch.js:662` — "🎙 语音"按钮
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
- 修改数字映射: 编辑 `js/state.js:46-56` — `NUMBER_MAP`
- 修改按钮颜色: 编辑 `js/voice.js:202-224`
- 修改边缘闪烁时长: 编辑 `js/stitch.js:1027-1037`


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
- 打开/关闭: `js/ui.js:68-89` — `showSheet(html)` / `closeSheet()`

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
- 打开/关闭: `js/ui.js:116-140` — `showConfirmDialog()` / `confirmDialog()` / `closeDialog()`

**视觉标识**:
- 居中弹出、白色圆角卡片、半透明深色遮罩
- 确定按钮为 `var(--accent)` 背景，取消按钮为灰色

**修改指引**:
- 修改按钮文字: 编辑 `index.html:152-153`
- 修改对话框宽度: 编辑 `styles.css:1165` — `max-width: 340px`
- 修改确定/取消逻辑: 编辑 `js/ui.js:128-139`


### 界面元素 - Toast 提示

**用户描述方式**:
- 主要: "底部提示"、"操作成功提示"、"toast 消息"
- 别名: "轻提示"、"snackbar"、"通知条"

**代码位置**:
- 实现: `js/ui.js:7-66` — `showToast(message, action, duration)`
- 使用场景遍布多个文件：`js/stitch.js`、`js/round.js`、`js/pattern.js` 等

**视觉标识**:
- 固定在屏幕底部（bottom: 90px）、深棕色背景（#2D1E10）、白色文字
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
- 选择封面: `js/image.js:69-75` — `pickCover(projectId)`
- 压缩处理: `js/image.js:4-28` — `compressImage(file)`，Canvas 压缩到 200px、JPEG 0.72
- 保存封面: `js/image.js:48-57` — `setProjectCover(projectId, input)`
- 移除封面: `js/image.js:59-67` — `removeProjectCover(projectId)`
- 读取封面: `js/image.js:40-45` — `getProjImage(projId)`
- 存储位置: localStorage key `img_{projId}`（base64，独立于主 JSON）
- 渲染显示: `js/render.js:66-73`（首页封面/色块占位）
- 入口: 项目卡片菜单"🖼 设置封面" + "🗑 移除封面"

**视觉标识**:
- 项目卡片左侧：有封面显示 48×48 圆角图片，无封面显示首字大写色块（COVER_COLORS 之一）
- 菜单"设置封面"打开系统文件选择器

**修改指引**:
- 修改压缩尺寸: 编辑 `js/image.js:4` 的 `maxSize` 默认值 200
- 修改图片质量: 编辑 `js/image.js:20` — `'image/jpeg', 0.72`
- 修改封面占位样式: 编辑 `styles.css:346-354` — `.proj-thumb--fallback`
- 修改 COVER_COLORS: 编辑 `js/render.js:10-12`


### 应用设置 - 设置页面

**用户描述方式**:
- 主要: "设置页面"、"设置"、"应用设置"
- 别名: "settings page"、"设置中心"、"偏好设置"

**代码位置**:
- Sheet 版: `js/settings.js:7-74` — `openSettings()`（从项目页头部按钮调用）
- 全页版: `js/settings.js:76-164` — `renderSettings()`（通过 Tab Bar 切换调用）
- 入口: 底部标签栏 ⚙︎ + 项目页 Nav Bar ⚙️ 按钮

**视觉标识**:
- 分区：外观（2 列主题卡片）、语音（开关 + 使用说明入口）、数据管理（统计 + 导出/导入/清空）、安装（安装教程）、关于（版本号）
- 主题选中态：`outline: 2px solid var(--accent)`

**修改指引**:
- 修改版本号显示: 编辑 `js/settings.js:158` — "钩织计数本 v0.1"
- 修改设置项顺序: 编辑 `js/settings.js:76-164` 中 html 拼接顺序
- 新增设置项: 在 `js/settings.js` 中参照现有模式添加


### 应用设置 - 语音默认开关 & 音效开关

**用户描述方式**:
- 主要: "默认开启语音"、"语音自动启动"、"音效开关"
- 别名: "voice default"、"语音音效"、"提示音开关"

**代码位置**:
- 默认语音开关 UI + 逻辑: `js/settings.js:114-119` + `js/settings.js:205-210` — `toggleVoiceDefault()`
- 音效开关 UI + 逻辑: `js/settings.js:122-127` + `js/settings.js:212-217` — `toggleVoiceSound()`
- 存储: `state.data.settings.voiceEnabled` / `voiceSoundEnabled`

**视觉标识**:
- 滑动开关（toggle switch），开启时 `var(--accent)` 背景

**修改指引**:
- 修改标签文字: 编辑 `js/settings.js:117` 和 `js/settings.js:123`
- 修改开关样式: 编辑 `styles.css:1067-1097` — `.settings-toggle` 系列


### 其他功能 - 导出 PDF / 打印

**用户描述方式**:
- 主要: "打印项目"、"导出 PDF"、"打印图解"
- 别名: "print"、"PDF 导出"、"打印版"

**代码位置**:
- 功能: `js/storage.js:218-220` — `exportPDF()`，调用 `window.print()`
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
- 教程弹窗: `js/project.js:207-242` — `showPwaTutorial()`
- 提示横幅: `js/project.js:157-169`（归档成功后显示）
- 入口: 设置页"📲 安装到主屏幕"按钮 + 归档成功弹窗中的 PWA 提示
- PWA 配置: `manifest.json`、`sw.js`

**修改指引**:
- 修改安装教程内容: 编辑 `js/project.js:208-242`
- 修改 PWA 应用名/图标: 编辑 `manifest.json`
- 修改 PWA 提示 opt-out 逻辑: `js/project.js:195-205`


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
- 全局状态定义: `js/state.js:4-38` — `state` 对象
- 持久化 key: `js/storage.js:50` — `"crochet_v4"`
- 数据加载/迁移: `js/storage.js:65-138` — `loadData()` + `migrateData()`
- 存储适配器: `js/storage.js:23-48` — `storageAdapter`
- 封面图片存储: 独立 `localStorage` key `img_{projId}`

**数据结构概览**:
```
state.data = {
  schemaVersion: LATEST_SCHEMA,     // 当前 schema 版本号（2）
  projects: [{
    id, name, archived,
    useRowTerms,                    // 用"行"还是"圈"
    activePartId,                   // 当前活跃部件 ID
    parts: [{
      id, title, rawPattern,
      customPalette: ["X","V",...], // null 表示自动检测
      activeRoundId,
      rounds: [{
        id, roundNum,               // null=备注卡, 0=起针
        seq: ["X","V",...],         // 针法序列（sid 数组）
        instruction: "",            // 图解说明文字
        isTextCard: false,          // 是否为纯文本备注卡
        expectedCount: null         // 预期针数（手动设定）
      }]
    }],
    customSettings: {
      names: { sid: "自定义名称" },
      colors: { sid: "#hex" },
      customStitches: { sid: { id, label, color, category } }
    }
  }],
  settings: {
    theme: "morandi",               // "morandi"|"night"
    customColors: {},               // 全局自定义颜色
    voiceEnabled: false,            // 进入项目默认开启语音
    voiceSoundEnabled: false        // 语音模式音效
  }
}
```

**修改指引**:
- 新增字段: 先在 `js/state.js` 定义默认值，在 `js/storage.js` 的 `migrateData()` 添加兼容逻辑，bump `LATEST_SCHEMA`
- 修改 localStorage key: 编辑 `js/storage.js:50`
- 修改存储适配器行为: 编辑 `js/storage.js:23-48`


### 数据层 - 数据迁移逻辑

**用户描述方式**:
- 主要: "旧数据兼容"、"数据升级"、"老版本数据迁移"
- 别名: "data migration"、"格式转换"、"数据升级脚本"

**代码位置**:
- 迁移函数: `js/storage.js:142-216` — `migrateData(d)`
- 调用时机: `js/storage.js:131` — `loadData()` 读取数据后立即调用
- schema 版本常量: `js/storage.js:52` — `LATEST_SCHEMA`（当前值为 2）
- 版本历史: `js/storage.js:1-17` — 文件头注释块
- 旧 ID 映射: `stitches.js:42-45` — `OLD_ID_MAP`

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

**修改指引**:
- 添加新的数据迁移规则: 编辑 `js/storage.js:142-216`
- 添加旧 ID 映射: 编辑 `stitches.js:42-45` — `OLD_ID_MAP`
- 修改当前 schema 版本: 编辑 `js/storage.js:52` — `LATEST_SCHEMA`


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

**内置针法分类**:
- 基础: X(短针), T(中长针), F(长针), E(长长针), CH(锁针), SL(引拔), SK(空针)
- 加针: V, W, TV, TW, FV, FW, EV
- 减针: A, M, TA, TM, FA, FM, EA
- 特殊: G(爆米花针), Q(枣形针)

**注意**: BLO/FLO 已从内置针法库移除，但 `extractStitches()` 的正则仍保留 BLO/FLO 匹配以向后兼容图解解析

**修改指引**:
- 新增预设针法: 在 `stitches.js` 的 `STITCH_LIB` 中添加条目
- 修改针法中文名: 编辑对应条目的 `label` 字段
- 修改别名映射: 编辑 `stitches.js:48-52` 的 `ALIAS_TO_ID` 构建逻辑
- 修改图解解析规则: 编辑 `stitches.js:87-203`


### 基础设施 - 全局状态管理

**用户描述方式**:
- 主要: "应用状态"、"全局数据"、"应用记忆"
- 别名: "state"、"全局变量"、"应用上下文"、"数据存储"

**代码位置**:
- 状态定义: `js/state.js:4-38` — 完整的 `state` 对象
- 辅助函数: `js/state.js:58-74` — `uid()`, `getProj()`, `getActivePart()`, `isPartEmpty()`, `getEditingPartId()`
- 数字映射: `js/state.js:46-56` — `NUMBER_MAP`
- 全局暴露: `js/main.js:42` — `window.state = state`
- editingPartId 同步: `js/state.js:41-44` — `Object.defineProperty(window, 'editingPartId', ...)`

**状态字段说明**:
- `curProjId`: 当前打开的项目 ID
- `expandedRounds`: Set，记录展开的圈 ID
- `selectedStitch`: 被选中的针法位置 {roundId, idx}
- `pendingInsert`: 待插入状态 {roundId, idx, dir}
- `filterByRound`: 是否按圈筛选针法（默认 true）
- `editingPartId`: 正在编辑名称的部件 ID
- `currentTab`: 当前标签页（'projects' / 'settings'）
- `voiceMode`: 语音模式是否开启
- `recognition`: SpeechRecognition 实例
- `flowState.*`: 各种临时流程状态
- `_lastDeletedRound`: 最后删除的圈（撤销用）

**修改指引**:
- 新增全局状态: 在 `js/state.js:4-38` 添加字段
- 修改 uid 生成算法: 编辑 `js/state.js:59`
- 修改 getProj 查找逻辑: 编辑 `js/state.js:60`


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

### 对于 AI
收到用户需求后：

1. 在映射表中搜索相关的"用户描述方式"关键词
2. 定位到对应的"代码位置"
3. 根据"修改指引"提供具体的修改方案
4. 优先使用 `Edit` 工具做精确修改，避免大段重写
5. **样式只能改 `styles.css`，不要在任何 JS 或 HTML 中新增 CSS**
6. **ui-redesign 分支上不修改 js/ 目录下的逻辑文件**
