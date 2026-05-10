# 📂 钩织计数本 功能-代码映射报告

## 🏗️ 项目概览

- **技术栈**: 原生 JS (ES Modules) + PWA (Service Worker + Web Manifest)，无前端框架
- **架构模式**: 事件驱动 + 领域模块化（每个功能域一个 JS 文件），伪 SPA（DOM 整体替换实现页面切换）
- **状态管理**: 全局单例 `state` 对象 (`js/state.js`)，数据直接就地修改，通过 `saveData()` 持久化到 localStorage
- **样式方案**: 单文件 `styles.css` + `index.html` 内联 `<style>`（打印样式、动画），CSS 自定义属性实现主题
- **构建工具**: 无构建步骤，原生 ES Module 直接运行；`scripts/inject-version.js` 注入版本号到 HTML/SW
- **包管理**: 无（纯前端项目，Tesseract.js 动态 CDN 加载）
- **离线方案**: Service Worker (`sw.js`) 缓存优先策略 + Web App Manifest (`manifest.json`)

## 📊 功能模块统计

- **页面级视图**: 2 个（首页项目列表、项目详情页）
- **可复用 UI 组件**: 4 个（Sheet 弹窗、Dialog 对话框、Toast 提示、Loading 遮罩）
- **业务逻辑模块**: 12 个 JS 文件（按领域拆分）
- **样式文件**: 1 个（`styles.css`）+ 内联 `<style>`（在 `index.html` 中）
- **配置文件**: 2 个（`manifest.json`、`sw.js`）

## 🗂️ 目录结构概览

```
knit/
├── index.html              # 入口 HTML + 内联样式 + SW 注册
├── styles.css              # 全局样式（与 index.html 内联重复）
├── sw.js                   # Service Worker（离线缓存）
├── manifest.json           # PWA 配置
├── stitches.js             # 针法库（STITCH_LIB 定义 + 别名映射 + 图解解析器）
├── scripts/
│   └── inject-version.js   # 构建时版本号注入
└── js/
    ├── main.js             # 入口模块 + 全局函数注册
    ├── state.js            # 全局状态 + 辅助函数
    ├── storage.js          # 数据持久化（localStorage 适配层）
    ├── ui.js               # 通用 UI 组件（Toast/Sheet/Dialog）
    ├── render.js           # 页面渲染（首页 / 项目详情）
    ├── project.js          # 项目管理（新建/删除/归档/导入）
    ├── stitch.js           # 针法操作（添加/切换/删除/自定义 + 底部调色板）
    ├── round.js            # 圈/行操作（增删切换）
    ├── part.js             # 部件操作（增删改切换）
    ├── pattern.js          # 图解导入（粘贴/O CR/解析确认）
    ├── voice.js            # 语音识别（Web Speech API）
    ├── settings.js         # 设置页（主题/语音/数据管理）
    └── image.js            # 图片处理（封面压缩/存取）
```


---

## 🎯 功能映射表

### 页面导航 - 底部标签栏

**🔤 用户描述方式**:
- 主要: "底部导航栏"、"底部标签"、"底部切换栏"
- 别名: "Tab 栏"、"底部菜单"、"导航切换"

**📍 代码位置**:
- HTML 结构: `index.html:1244-1253` — 两个按钮 `tab-projects` / `tab-settings`
- 样式: `index.html:612-657` (`.tab-nav`, `.tab-btn`, `.tab-label`)
- 切换逻辑: `js/main.js:56-71` — `switchTab()` / `updateTabNav()`，同时注册在 `_globals`

**🎨 视觉标识**:
- 外观: 固定在屏幕底部，毛玻璃背景，两个图标按钮（🧶项目 / ⚙️设置），选中时变为棕色（`--accent`）

**⚡ 修改指引**:
- 修改标签文字/图标: 编辑 `index.html:1244-1253`
- 修改选中高亮颜色: 编辑 CSS 变量 `--accent` 或 `.tab-btn.active` 样式
- 修改切换行为: 编辑 `js/main.js:56-71`


### 页面导航 - 返回首页按钮

**🔤 用户描述方式**:
- 主要: "返回按钮"、"左上角返回箭头"、"回到首页"
- 别名: "后退按钮"、"‹ 按钮"、"back button"

**📍 代码位置**:
- HTML 结构: `index.html:1223` — `<button class="hdr-back" onclick="goHome()">`
- 显示/隐藏控制: `js/render.js` — `renderHome()` 隐藏，`renderProject()` 显示
- 点击行为: `js/main.js:40-54` — `goHome()`

**🎨 视觉标识**:
- 外观: 左上角 `‹` 符号，灰色半透明，只在项目详情页显示
- 点击有浅色背景反馈

**⚡ 修改指引**:
- 修改箭头符号: 编辑 `index.html:1223` 按钮内文本
- 修改返回逻辑: 编辑 `js/main.js:40-54`


### 页面导航 - 页面切换动画

**🔤 用户描述方式**:
- 主要: "页面切换动画"、"滑入效果"、"过渡动画"
- 别名: "切换动效"、"slide 动画"、"进退场动画"

**📍 代码位置**:
- CSS 动画: `index.html:65-78` — `slide-in-right` / `slide-out-left` / `slide-in-left`
- 触发逻辑: `js/main.js:50-52` (进入项目 → `enter-forward`)，`js/project.js:24-25` (打开项目 → `enter-forward`)
- 入场后退: `js/main.js:51-52` (返回首页 → `enter-back`)

**🎨 视觉标识**:
- 进入项目: 从右滑入 (.25s)
- 返回首页: 从左滑入 (.25s)

**⚡ 修改指引**:
- 修改动画速度/效果: 编辑 `index.html:65-78` 的 `@keyframes`
- 修改触发时机: 编辑 `js/main.js` 和 `js/project.js` 中 `screen.classList.add("enter-forward/enter-back")`


### 界面元素 - 顶部 Header 栏

**🔤 用户描述方式**:
- 主要: "顶部标题栏"、"header 区域"、"头部导航"
- 别名: "标题栏"、"顶部栏"、"top bar"

**📍 代码位置**:
- HTML 结构: `index.html:1222-1235` — 包含返回按钮、标题区、操作按钮
- 样式: `index.html:81-157` (`.hdr`, `.hdr-back`, `.hdr-title`, `.hdr-btn` 等)
- 标题渲染: `js/render.js:10-15` (首页), `js/render.js:119-126` (项目页可编辑标题)
- 操作按钮: 设置⚙️ → `openSettings()`, 针法🧶 → `openStitchSetup('edit')`, PDF📄 → `exportPDF()`

**🎨 视觉标识**:
- 毛玻璃半透明背景 (`rgba(255,255,255,0.75)` + `backdrop-filter: blur(12px)`)
- 粘性定位在顶部
- 项目页标题可点击直接编辑（`contenteditable`）

**⚡ 修改指引**:
- 修改 header 高度: 编辑 CSS 变量 `--hdr-h`
- 修改标题文字: 首页 → `js/render.js:11`，项目页 → 从项目数据 `proj.name` 读取
- 修改毛玻璃效果: 编辑 `.hdr` 的 `background` 和 `backdrop-filter`
- 修改/移除头部按钮: 编辑 `index.html:1231-1233` 和对应的显示/隐藏逻辑


### 界面元素 - 底部操作栏（项目页）

**🔤 用户描述方式**:
- 主要: "底部操作栏"、"底部按钮区"、"针法面板"
- 别名: "bottom bar"、"底部调色板"、"针法按钮区"

**📍 代码位置**:
- HTML 容器: `index.html:1241` — `<div id="bottom-bar">`
- 样式: `index.html:547-605` (`.bottom-bar`, `.palette`, `.pal-btn`, `.bar-row`, `.bar-btn`)
- 渲染逻辑: `js/stitch.js:593-680` — `renderDynamicPalette()` 渲染针法按钮，`renderFilterToggle()` 渲染筛选开关，`renderBarRow()` 渲染撤销/图解/语音/新增按钮
- 组装调用: `js/render.js:198-201`

**🎨 视觉标识**:
- 固定在屏幕底部、白色背景、顶部有分割线
- 3 列针法按钮 + 1 个"增减"按钮（虚线边框）
- 下方一行：撤销 / 图解 / 语音 / 新一圈

**⚡ 修改指引**:
- 修改按钮布局列数: 编辑 `js/stitch.js:630` 中的 `grid-template-columns: repeat(3,1fr)`（需同时修改 CSS `.palette`）
- 修改"增减"按钮文字: 编辑 `js/stitch.js:638-640`
- 修改底部功能按钮: 编辑 `js/stitch.js:669-680` 的 `renderBarRow()`
- 修改针法按钮外观: 编辑 CSS `.pal-btn` 或 `js/stitch.js:634-637` 内联样式


### 界面元素 - Sheet 底部弹窗

**🔤 用户描述方式**:
- 主要: "底部弹窗"、"操作面板"、"弹出菜单"、"底部滑出面板"
- 别名: "Sheet"、"底部面板"、"滑出菜单"、"action sheet"

**📍 代码位置**:
- HTML 容器: `index.html:1256-1257` — `<div class="overlay">` + `<div class="sheet">`
- 样式: `index.html:721-753` (`.overlay`, `.sheet`, `.sheet-handle`, `.sheet-title`)
- 打开/关闭: `js/ui.js:68-89` — `showSheet(html)` / `closeSheet()`
- 全局注册: `js/main.js:90` — `showSheet` / `closeSheet` 注册到 `window`

**🎨 视觉标识**:
- 从底部滑出，圆角顶部（18px）、顶部有灰色拖拽手柄横条
- 半透明深色遮罩层
- 固定最大高度 80vh

**⚡ 修改指引**:
- 修改弹出动画: 编辑 `.sheet` 的 `transition` 和 `.sheet.show` 的 `transform`
- 修改圆角: 编辑 `.sheet` 的 `border-radius`
- 修改关闭行为（如流程分支）: 编辑 `js/ui.js:74-89` 的 `closeSheet()`


### 界面元素 - Dialog 确认对话框

**🔤 用户描述方式**:
- 主要: "确认弹窗"、"对话框"、"确认删除提示"
- 别名: "Dialog"、"模态框"、"alert 弹窗"

**📍 代码位置**:
- HTML 结构: `index.html:1266-1276` — 含标题、消息、输入框、取消/确定按钮
- 样式: `index.html:1017-1095` (`.dialog`, `.dialog-box`, `.dialog-btn` 等)
- 打开/关闭: `js/ui.js:116-140` — `showConfirmDialog()` / `confirmDialog()` / `closeDialog()`
- 全局注册: `js/main.js:85` — 注册到 `window`

**🎨 视觉标识**:
- 居中弹出、白色圆角卡片、半透明深色遮罩
- 确定按钮为棕色 (`--accent`)，取消按钮为灰色

**⚡ 修改指引**:
- 修改按钮文字: 编辑 `index.html:1272-1273`
- 修改对话框宽度/样式: 编辑 `.dialog-box` 的 `max-width` 等
- 修改确定/取消逻辑: 编辑 `js/ui.js:128-139`


### 界面元素 - Toast 提示

**🔤 用户描述方式**:
- 主要: "底部提示"、"操作成功提示"、"toast 消息"
- 别名: "轻提示"、"snackbar"、"通知条"

**📍 代码位置**:
- 实现: `js/ui.js:7-66` — `showToast(message, action, duration)`
- 使用场景遍布多个文件：`js/stitch.js`（封面更新等）、`js/round.js`（删除撤销）、`js/pattern.js`（导入完成）

**🎨 视觉标识**:
- 固定在屏幕底部、深棕色背景（`#2D1E10`）、白色文字
- 从下方淡入，4 秒后自动消失
- 可选右侧操作按钮（如"撤销"）

**⚡ 修改指引**:
- 修改显示时长: 调用时第三个参数 `duration`（默认 4000ms）
- 修改外观: 编辑 `js/ui.js:13-31` 的 `toast.style.cssText`
- 修改动画: 编辑 `js/ui.js:34` 的 `@keyframes toast-in`


### 界面元素 - Loading 加载遮罩

**🔤 用户描述方式**:
- 主要: "加载中遮罩"、"加载动画"、"loading 画面"
- 别名: "加载提示"、"读取中"、"spinner"

**📍 代码位置**:
- HTML 结构: `index.html:1260-1263`
- 样式: `index.html:1170-1196` (`.loading-mask`, `.loading-spinner`, `@keyframes spin`)
- 打开/关闭: `js/pattern.js:102-112` — `showLoading()` / `hideLoading()`

**🎨 视觉标识**:
- 全屏半透明白色遮罩 + 毛玻璃效果
- 中间旋转圆环 + 文字提示
- 仅在 OCR 识别时使用

**⚡ 修改指引**:
- 修改加载文字: 调用 `showLoading('自定义文字')`
- 修改旋转动画速度: 编辑 `@keyframes spin` 的 `animation-duration`


### 数据管理 - 项目列表页

**🔤 用户描述方式**:
- 主要: "首页"、"项目列表"、"我的项目页面"
- 别名: "主页"、"home 页"、"所有项目"、"项目总览"

**📍 代码位置**:
- 渲染函数: `js/render.js:8-103` — `renderHome()`
- 统计计算: `js/render.js:18-22`（总项目数/总针数）
- 激活项目渲染: `js/render.js:35-59`（未归档项目卡片）
- 归档项目渲染: `js/render.js:63-94`（已归档区域）
- 空状态文案: `js/render.js:33` — "还没有项目，点击下方创建第一个"

**🎨 视觉标识**:
- 标题"我的项目" + 右上角统计（N 个项目 · 累计 N 针）
- 项目卡片列表：图标/封面 → 项目名 → 部件/圈数/针数 → ⋯ 菜单按钮
- 底部橙色大按钮"＋ 新建项目"

**⚡ 修改指引**:
- 修改首页标题: 编辑 `js/render.js:24`
- 修改空状态提示: 编辑 `js/render.js:33`
- 修改项目卡片布局: 编辑 `js/render.js:45-58`（卡片 HTML）和 CSS `.proj-card`
- 修改统计信息格式: 编辑 `js/render.js:24-25`


### 数据管理 - 新建项目

**🔤 用户描述方式**:
- 主要: "新建项目"、"创建项目"、"添加新项目"
- 别名: "＋ 按钮"、"开始新项目"、"创建钩织项目"

**📍 代码位置**:
- 首页按钮: `js/render.js:98-99` — FAB 按钮 `＋ 新建项目`
- 弹窗逻辑: `js/project.js:65-95` — `showNewProjectDialog()`
- 创建确认: `js/project.js:66-87` — `state.dlgCallback` 创建项目对象并保存
- 创建后流程: 显示"创建方式选择"弹窗 → `showEntryChoiceSheet()` (`js/ui.js:91-113`)

**🎨 视觉标识**:
- 首页底部橙色大按钮（全宽、圆角、白色文字）
- 点击后弹出 Dialog 输入框，placeholder "项目名称，例如：粉色帽子"
- 输入名称后弹出创建方式选择：粘贴图解 / 手动创建 / 跳过

**⚡ 修改指引**:
- 修改按钮文字: 编辑 `js/render.js:99`
- 修改输入框 placeholder: 编辑 `index.html:1270`
- 修改新项目默认结构: 编辑 `js/project.js:68-76`（project 对象）
- 修改创建方式选项: 编辑 `js/ui.js:91-113`


### 数据管理 - 项目卡片菜单（⋯）

**🔤 用户描述方式**:
- 主要: "项目菜单"、"三个点菜单"、"项目操作菜单"
- 别名: "弹出菜单"、"卡片菜单"、"⋯ 按钮"

**📍 代码位置**:
- 菜单 HTML: `js/render.js:52-57`（激活项目），`js/render.js:85-90`（归档项目）
- 菜单展开/收起: `js/project.js:97-105` — `toggleProjMenu()`
- 全局点击关闭: `js/main.js:116-123` — 点击菜单外区域自动关闭
- 样式: `index.html:259-288` (`.proj-menu`, `.proj-menu-item`)

**🎨 视觉标识**:
- 绝对定位在 ⋯ 按钮下方，白色圆角卡片带阴影
- 菜单项：🖼设置封面 / 🗑移除封面（有封面时）/ 📦归档 / 🗑删除（红色）
- 归档项目中为：📤取消归档 替代 📦归档

**⚡ 修改指引**:
- 修改菜单项文字/图标: 编辑 `js/render.js:53-57`
- 修改菜单项顺序: 调整 `js/render.js:52-57` 中按钮顺序
- 修改菜单外观: 编辑 CSS `.proj-menu` 和 `.proj-menu-item`
- 新增菜单项: 在 `js/render.js:52-57` 中添加按钮，并在 `js/project.js` 中编写对应处理函数


### 数据管理 - 归档/取消归档项目

**🔤 用户描述方式**:
- 主要: "归档项目"、"取消归档"、"隐藏已完成项目"
- 别名: "存档"、"放入归档"、"恢复项目"、"archive"

**📍 代码位置**:
- 归档功能: `js/project.js:107-119` — `archiveProject()`
- 取消归档: `js/project.js:216-219` — `unarchiveProject()`
- 归档成功弹窗: `js/project.js:121-165` — `showArchiveSuccessSheet()`
- 判断归档状态: 每个项目的 `p.archived` 布尔字段

**🎨 视觉标识**:
- 归档项目显示在首页下方独立区域"📦 已归档"
- 归档卡片半透明、灰色滤镜
- 归档成功后弹出 Sheet 显示项目摘要 + PWA 安装提示 + 备份下载按钮

**⚡ 修改指引**:
- 修改归档确认文案: 编辑 `js/project.js:111`
- 修改归档成功弹窗内容: 编辑 `js/project.js:121-165`
- 修改已归档区域标题: 编辑 `js/render.js:65`


### 数据管理 - 删除项目

**🔤 用户描述方式**:
- 主要: "删除项目"、"移除项目"、"删除整个项目"
- 别名: "delete project"、"彻底删除"、"清除项目"

**📍 代码位置**:
- 删除功能: `js/project.js:221-229` — `deleteProject()`
- 确认弹窗: 调用 `showConfirmDialog`，文案 "确定要删除这个项目吗？此操作不可恢复。"
- 执行: `state.data.projects` 过滤后保存并重新渲染

**🎨 视觉标识**:
- 菜单项为红色文字"🗑 删除"
- 确认弹窗：`confirmDialog` 居中 Dialog

**⚡ 修改指引**:
- 修改确认提示文案: 编辑 `js/project.js:224`
- 修改删除逻辑（如软删除）: 编辑 `js/project.js:226-227`


### 数据管理 - 导出/导入备份

**🔤 用户描述方式**:
- 主要: "导出数据"、"备份数据"、"导入备份"、"恢复数据"
- 别名: "下载备份"、"数据迁移"、"备份还原"、"导出 JSON"

**📍 代码位置**:
- 导出全部: `js/storage.js:139-149` — `exportData()`，生成完整 JSON 下载
- 导出单个项目: `js/storage.js:151-177` — `exportSingleProject(id)`，生成 `.knt` 文件
- 导入备份: `js/project.js:29-63` — `importData(input)`，读取文件 → 校验 → 确认覆盖
- 设置页入口: `js/settings.js:48-52` — 导出/导入按钮

**🎨 视觉标识**:
- 设置页中三个按钮：📤 导出备份 / 📥 导入备份（文件选择）/ 🗑 清空所有数据
- 导出下载文件名为 `钩织计数本备份_YYYY-MM-DD.json`
- 单个导出为 `项目名_日期.knt`
- 导入后弹出确认弹窗（"确定导入备份？共有 N 个项目..."）

**⚡ 修改指引**:
- 修改导出文件名: 编辑 `js/storage.js:144`（全部）, `js/storage.js:166`（单个）
- 修改导入校验规则: 编辑 `js/project.js:36-41`
- 修改导入确认文案: 编辑 `js/project.js:43`


### 数据管理 - 清空所有数据

**🔤 用户描述方式**:
- 主要: "清空所有数据"、"重置应用"、"删除全部项目"
- 别名: "清除数据"、"全部删除"、"恢复出厂"

**📍 代码位置**:
- 功能: `js/settings.js:198-210` — `clearAllData()`
- 确认弹窗: "确定要清空所有数据吗？此操作不可恢复。"
- 执行: 清空 `state.data.projects`，保存，返回首页

**🎨 视觉标识**:
- 设置页红色按钮"🗑 清空所有数据"（`settings-btn-danger`）

**⚡ 修改指引**:
- 修改确认文案: 编辑 `js/settings.js:199`
- 修改按钮颜色: 编辑 CSS `.settings-btn-danger`


### 业务功能 - 进入项目详情页

**🔤 用户描述方式**:
- 主要: "打开项目"、"进入项目"、"查看项目详情"
- 别名: "点击项目卡片"、"进入钩织页面"、"打开项目详情"

**📍 代码位置**:
- 打开项目: `js/project.js:6-27` — `openProject(id)`
- 渲染项目页: `js/render.js:106-226` — `renderProject()`
- 触发: 首页项目卡片 `onclick="openProject('${p.id}')"` (`js/render.js:45`)

**🎨 视觉标识**:
- 点击卡片后页面从右滑入
- 显示部件选项卡、当前任务提示、圈/行列表、底部操作栏

**⚡ 修改指引**:
- 修改打开项目时的初始状态: 编辑 `js/project.js:9-16`
- 修改页面渲染结构: 编辑 `js/render.js:106-226`


### 业务功能 - 项目名称编辑

**🔤 用户描述方式**:
- 主要: "修改项目名"、"重命名项目"、"编辑项目标题"
- 别名: "更改名称"、"项目改名"、"双击编辑项目名"

**📍 代码位置**:
- 标题渲染（可编辑）: `js/render.js:122-124` — `contenteditable` span + `onblur="renameProject(...)"`
- 重命名逻辑: `js/project.js:231-235` — `renameProject(name)`
- 样式: `.hdr-title input` (`index.html:136-143`)

**🎨 视觉标识**:
- 项目页顶部标题区域，点击可直接输入编辑
- 失焦（blur）自动保存

**⚡ 修改指引**:
- 修改编辑触发方式: 编辑 `js/render.js:122-124` 的属性
- 修改标题样式: 编辑 CSS `.hdr-title` 相关样式


### 业务功能 - 部件选项卡

**🔤 用户描述方式**:
- 主要: "部件切换"、"分类标签"、"部件 Tab"、"分部件管理"
- 别名: "part tabs"、"部件导航"、"分组切换"

**📍 代码位置**:
- 渲染: `js/render.js:138-159` — 部件选项卡 HTML
- 新增部件: `js/part.js:5-23` — `addPart()`
- 切换部件: `js/part.js:25-34` — `switchPart(partId)`
- 重命名部件: `js/part.js:52-75` — `startEditPartName()` / `renamePart()` / `partNameBlur()`
- 删除部件: `js/part.js:77-89` — `deletePart(partId)`
- 编辑按钮事件: `js/part.js:36-50` — `handleEditBtnClick()` / `handleDeleteBtnClick()`
- 样式: `index.html:316-410` (`.part-tabs-wrap`, `.part-tab`, `.part-name-input` 等)

**🎨 视觉标识**:
- 椭圆形胶囊按钮横向排列（可滚动）
- 当前激活 Tab 为棕色填充，其余为白底灰字
- 每个 Tab 有 ✎ 编辑按钮和 × 删除按钮（仅多个部件时显示删除）
- 最右侧有 ＋ 新增按钮

**⚡ 修改指引**:
- 修改新增部件默认标题: 编辑 `js/part.js:11` — `'部件 ' + ...`
- 修改 Tab 外观: 编辑 CSS `.part-tab` 系列
- 修改删除确认文案: 编辑 `js/part.js:82`


### 业务功能 - 圈/行管理

**🔤 用户描述方式**:
- 主要: "圈号列表"、"行号列表"、"钩织进度"、"每一圈的记录"
- 别名: "rounds"、"回合"、"行数"、"圈数"、"步骤列表"

**📍 代码位置**:
- 渲染: `js/render.js:163-195` — 圈/行卡片 HTML
- 新增圈: `js/round.js:8-23` — `addRound()`
- 展开/收起: `js/round.js:25-39` — `toggleRound(rid)`
- 设置活跃圈: `js/round.js:114-191` — `setActiveRound(proj, rid)`
- 删除圈: `js/round.js:41-90` — `deleteRound()`（含撤销机制）
- 撤销删除: `js/round.js:92-112` — `undoDeleteRound()`
- 样式: `index.html:417-496` (`.round-card`, `.round-hdr`, `.round-badge` 等)

**🎨 视觉标识**:
- 每圈一个白色圆角卡片
- 左侧圆形 badge：数字（圈号）或"起"（起针）或"文"（备注卡）
- 活跃圈 badge 为棕色填充 + 标签显示"编辑中"
- 展开后显示针法序列（彩色胶囊标签）
- 右侧有"编辑图解"按钮和 × 删除按钮

**⚡ 修改指引**:
- 修改新建圈后的滚动行为: 编辑 `js/round.js:19-22`
- 修改删除撤销时长: 编辑 `js/round.js:84` 的 `5000`（5 秒）
- 修改圈号显示格式: 编辑 `js/render.js:174` 的标签逻辑
- 修改展开/收起图标: 编辑 `js/render.js:179` 的 `›` 符号


### 交互功能 - 添加针法（点按钮）

**🔤 用户描述方式**:
- 主要: "添加一针"、"记录针法"、"点针法按钮"
- 别名: "加针"、"添加 stitch"、"记录钩了什么针"、"push stitch"

**📍 代码位置**:
- 针法按钮渲染: `js/stitch.js:593-643` — `renderDynamicPalette(proj)`
- 添加针法: `js/stitch.js:213-242` — `pushStitch(sid)`
- 按钮点击: `onclick="pushStitch('${sid}')"` (`js/stitch.js:634`)
- 数据存储: 向当前活跃圈 `r.seq` 数组末尾追加 sid，然后 `saveData()`

**🎨 视觉标识**:
- 底部 3 列彩色按钮，各代表一种针法
- 按钮显示针法中文名 + 缩写 ID（如"短针 X"）
- 语音模式下按钮显示数字（1-9）
- 添加后对应圈自动展开，针法以彩色胶囊标签形式显示

**⚡ 修改指引**:
- 修改默认针法列表: 编辑 `js/stitch.js:607-609` 的 fallback 数组
- 修改按钮颜色逻辑: 编辑 `js/stitch.js:54-62` — `getProjColor()`
- 修改添加后的滚动行为: 编辑 `js/stitch.js:236-241`


### 交互功能 - 撤销上一针

**🔤 用户描述方式**:
- 主要: "撤销"、"删除最后一针"、"撤回上一步"
- 别名: "undo"、"取消"、"回退一针"、"撤销 st"

**📍 代码位置**:
- 撤销功能: `js/stitch.js:244-269` — `undoStitch()`
- 按钮: `js/stitch.js:675` — 底部操作栏"↩ 撤销"按钮
- 语音触发: `js/voice.js:62-66` — 识别到"撤销/撤回/取消"时调用

**🎨 视觉标识**:
- 底部操作栏左侧灰色按钮"↩ 撤销"
- 删除当前活跃圈最后一针并更新界面

**⚡ 修改指引**:
- 修改按钮文字: 编辑 `js/stitch.js:675`
- 修改撤销行为（如支持多步撤销）: 编辑 `js/stitch.js:244-269`


### 交互功能 - 点击针法胶囊（修改/删除单针）

**🔤 用户描述方式**:
- 主要: "修改某一针"、"替换针法"、"删除某一针"、"插入针法"
- 别名: "点击胶囊"、"stitch tap"、"编辑已添加的针"

**📍 代码位置**:
- 点击触发: `js/stitch.js:271-274` — `stitchTap(roundId, idx)`
- 弹出面板: `js/stitch.js:276-312` — `openStitchSheet()`（显示更改为 / 插入 / 删除选项）
- 替换针法: `js/stitch.js:314-342` — `changeStitch()`
- 删除单针: `js/stitch.js:344-375` — `deleteStitch()`
- 插入针法: `js/stitch.js:377-428` — `startInsert()` / `doInsert()`
- 针法胶囊渲染: `js/stitch.js:157-168` — `renderSpillHTML()`

**🎨 视觉标识**:
- 每针显示为彩色圆角胶囊：序号 + 缩写（如 `1 X`）
- 点击后弹出 Sheet：显示当前针法名称、可替换为其他针法、在此针前/后插入、删除此针

**⚡ 修改指引**:
- 修改胶囊样式: 编辑 CSS `.spill` 系列 + `js/stitch.js:162-167`
- 修改替换面板布局: 编辑 `js/stitch.js:284-312`
- 修改插入面板: 编辑 `js/stitch.js:377-388`


### 业务功能 - 针法配置（自定义调色板）

**🔤 用户描述方式**:
- 主要: "增减针法"、"配置常用针法"、"自定义针法面板"
- 别名: "针法设置"、"调色板配置"、"选择针法"、"stitch setup"

**📍 代码位置**:
- 打开配置: `js/stitch.js:682-780` — `openStitchSetup(mode)`，分 'create' 和 'edit' 两种模式
- 切换选中: `js/stitch.js:782-798` — `toggleSetupStitch(sid)`
- 保存配置: `js/stitch.js:992-1025` — `saveProjectStitches(mode)`，写回 `part.customPalette`
- 触发入口: 底部"增减"按钮 (`js/stitch.js:638`)，头部针法图标按钮 (`index.html:1232`)
- 样式: `.picker-grid`, `.picker-btn` 等

**🎨 视觉标识**:
- Sheet 弹窗，标题"选择常用针法"
- 针法按分类分组：基础针法 / 加针类 / 减针类 / 特殊针法
- 每个针法显示为 3 列彩色按钮，已选中为实心，未选中为白底
- 底部有全选/清空、导入图解、新建针法按钮
- 创建模式显示"开始钩织"，编辑模式显示"更新配置"

**⚡ 修改指引**:
- 修改分类名称: 编辑 `js/stitch.js:716-721` 的 `categories` 对象
- 修改按钮列数: 编辑 `js/stitch.js:743` 中的 `repeat(3,1fr)`
- 修改全选按钮文字: 编辑 `js/stitch.js:767`


### 业务功能 - 自定义针法名称和颜色

**🔤 用户描述方式**:
- 主要: "自定义针法名称"、"修改针法颜色"、"个性化针法"
- 别名: "改针法颜色"、"重命名针法"、"针法别名"、"stitch customize"

**📍 代码位置**:
- 打开自定义面板: `js/stitch.js:800-850` — `openStitchCustomize(sid)`
- 保存自定义: `js/stitch.js:852-872` — `saveStitchCustomize(sid)`
- 恢复默认: `js/stitch.js:874-883` — `resetStitchCustomize(sid)`
- 存储位置: `proj.customSettings.names[sid]` 和 `proj.customSettings.colors[sid]`
- 入口: 针法按钮上的 `✎ 自定义` 小字

**🎨 视觉标识**:
- Sheet 弹窗，显示针法名称、名称输入框、颜色选择器、恢复默认按钮
- 自定义过的针法在配置面板中有黄色小圆点标记
- 自定义名称覆盖预设中文名

**⚡ 修改指引**:
- 修改名称输入框 maxlength: 编辑 `js/stitch.js:821`
- 修改颜色选择器默认值: 编辑 `js/stitch.js:813`
- 修改保存逻辑: 编辑 `js/stitch.js:852-872`


### 业务功能 - 创建自定义针法

**🔤 用户描述方式**:
- 主要: "新建针法"、"创建自定义针法"、"添加新 stitch"
- 别名: "自定义 stitch"、"新增针法类型"、"create custom stitch"

**📍 代码位置**:
- 打开表单: `js/stitch.js:891-944` — `openNewStitchForm()`
- 保存: `js/stitch.js:946-969` — `saveNewStitch()`
- 删除自定义针法: `js/stitch.js:971-990` — `deleteCustomStitch(sid)`
- 存储位置: `proj.customSettings.customStitches[sid]`
- 入口: 针法配置面板底部虚线按钮"＋ 新建针法"

**🎨 视觉标识**:
- Sheet 弹窗表单：缩写 ID（英文输入，自动大写）、中文名称、颜色选择器、分类单选
- 自定义针法在配置面板中显示为虚线边框
- 删除按钮为红色

**⚡ 修改指引**:
- 修改 ID 输入限制: 编辑 `js/stitch.js:906` 的 `oninput` 正则
- 修改分类选项: 编辑 `js/stitch.js:924`
- 修改创建后的行为: 编辑 `js/stitch.js:967-968`


### 业务功能 - 圈/行 显示术语切换

**🔤 用户描述方式**:
- 主要: "切换圈/行显示"、"圈和行的叫法切换"
- 别名: "显示圈还是行"、"术语切换"、"toggle row terms"

**📍 代码位置**:
- 切换逻辑: `js/stitch.js:12-18` — `toggleRowTerms()`，切换 `proj.useRowTerms` 布尔值
- 获取术语: `js/stitch.js:7-10` — `getUnitLabel(proj)`，返回 '圈' 或 '行'
- UI 入口: `js/render.js:134-135` — 项目页右上角小标签"显示：圈 ▾"

**🎨 视觉标识**:
- 项目页右上角小标签，点击切换"圈"↔"行"
- 所有 UI 文本跟随变化：如"第 3 圈"变为"第 3 行"、"新一圈"变为"新一行"

**⚡ 修改指引**:
- 修改默认术语: 编辑 `js/stitch.js:9` 的 fallback
- 修改 UI 入口位置/样式: 编辑 `js/render.js:134-135`


### 业务功能 - 任务进度条（当前圈进度）

**🔤 用户描述方式**:
- 主要: "当前圈进度条"、"任务进度"、"完成度显示"、"图解进度"
- 别名: "task slide"、"进度追踪"、"还差多少针"、"完成多少针"

**📍 代码位置**:
- 渲染: `js/stitch.js:519-562` — `renderTaskSlide(proj)`
- 自动计算预期针数: `js/stitch.js:430-517` — `calcExpectedCount(instruction)` 从图解文字解析
- 手动修改预期: `js/stitch.js:564-591` — `editExpectedCount(el)`，点击预期针数进行编辑
- 存储: `round.expectedCount`（手动）或自动从 `round.instruction` 解析
- 样式: `index.html:1097-1152` (`.task-slide`, `.task-slide-text`, `.exp-count`)

**🎨 视觉标识**:
- 粘性定位在部件 Tab 下方
- 显示当前圈的图解文字
- 进度条：已完成/预期针数，超出时变红
- 预期针数可点击编辑

**⚡ 修改指引**:
- 修改无图解时的提示文字: 编辑 `js/stitch.js:525-527`
- 修改进度条颜色: 编辑 `js/stitch.js:538-540` 的 `progressColor`
- 修改预期针数解析算法: 编辑 `js/stitch.js:430-517` — `calcExpectedCount()`


### 业务功能 - 针法筛选开关

**🔤 用户描述方式**:
- 主要: "只显示当前圈的针法"、"针法筛选"、"过滤针法按钮"
- 别名: "filter by round"、"筛选开关"、"按圈过滤"

**📍 代码位置**:
- 切换逻辑: `js/stitch.js:645-655` — `toggleFilterByRound()`
- 渲染开关: `js/stitch.js:657-667` — `renderFilterToggle()`
- 状态: `state.filterByRound` 布尔值
- 过滤逻辑在 `renderDynamicPalette()` 内部: `js/stitch.js:613-621`

**🎨 视觉标识**:
- 底部操作栏，针法按钮和操作按钮之间的一个小开关
- 左侧文字"仅显示本圈针法"，右侧滑动开关
- 开启后底部针法按钮只显示当前圈图解中出现的针法

**⚡ 修改指引**:
- 修改开关文字: 编辑 `js/stitch.js:662`
- 修改开关外观: 编辑 `js/stitch.js:658-659` 和 CSS
- 修改过滤行为: 编辑 `js/stitch.js:613-621`


### 业务功能 - 当前圈切换

**🔤 用户描述方式**:
- 主要: "切换当前编辑的圈"、"设置当前圈"、"激活某一圈"
- 别名: "选择当前圈"、"set active round"

**📍 代码位置**:
- 切换逻辑: `js/round.js:114-191` — `setActiveRound(proj, rid)`
- 点击触发: 圈卡片的 badge 按钮 `onclick="setActiveRound(null,'${r.id}')"` (`js/render.js:172`)
- 效果: 更新 activeRoundId、刷新 badge 样式、刷新底部调色板、刷新任务进度

**🎨 视觉标识**:
- 点击圈号 badge 切换当前活跃圈
- 活跃圈 badge 变为棕色 + 标签后显示"编辑中"
- 底部针法面板和任务进度同步更新

**⚡ 修改指引**:
- 修改活跃圈 badge 样式: 编辑 CSS `.round-badge.active`
- 修改"编辑中"标签样式: 编辑 `js/round.js:134`


### 业务功能 - 图解编辑

**🔤 用户描述方式**:
- 主要: "编辑图解文字"、"修改图解说明"、"填写钩织图解"
- 别名: "编辑 instruction"、"图解文本"、"编辑图解"

**📍 代码位置**:
- 打开编辑面板: `js/stitch.js:107-127` — `openInstructionEdit(roundId)`
- 保存: `js/stitch.js:129-150` — `saveRoundInstruction(roundId)`
- 点击入口: 圈卡片右侧"编辑图解"按钮 (`js/render.js:177`)
- 存储: `round.instruction` 字段

**🎨 视觉标识**:
- Sheet 弹窗，标题"编辑图解"
- 文本框 placeholder 显示示例格式："R4: 10(X,V,X)"
- 保存后刷新进度条（重新解析预期针数）

**⚡ 修改指引**:
- 修改 placeholder 示例: 编辑 `js/stitch.js:120`
- 修改文本框样式: 编辑 `js/stitch.js:115-120`
- 修改保存按钮文字: 编辑 `js/stitch.js:123`


### 业务功能 - 图解导入（粘贴/OCR）

**🔤 用户描述方式**:
- 主要: "导入图解"、"粘贴图解文字"、"拍照识别图解"、"OCR 识别"
- 别名: "图案导入"、"图解解析"、"导入钩织图解"、"pattern import"

**📍 代码位置**:
- 粘贴面板: `js/pattern.js:55-74` — `openPatternPasteSheet()`
- 解析预览: `js/pattern.js:83-96` — `handleParsePattern()` 调用 `parsePattern()`（定义在 `stitches.js`）
- OCR 识别: `js/pattern.js:135-174` — `handleOCR(input)`，动态加载 Tesseract.js
- 确认导入: `js/pattern.js:176-227` — `openParseConfirmSheet(parsed)`，支持逐条校验编辑
- 导入执行: `js/pattern.js:240-314` — `confirmImport(mode)`，支持"覆盖当前部件"或"作为新部件导入"
- 创建方式入口: `js/ui.js:91-113` — `showEntryChoiceSheet()`（粘贴图解 / 手动创建 / 跳过）
- 底部按钮入口: `js/stitch.js:676` — 底部操作栏"📥 图解"按钮

**🎨 视觉标识**:
- 粘贴面板：文本域 + 📷识别图片 按钮 + 🔍解析预览 按钮
- 解析确认面板：每圈显示为可编辑行，标题显示圈数和备注数
- 导入选项：当前部件为空时→"确认导入并开始"，有数据时→"覆盖当前部件"或"作为新部件导入"

**⚡ 修改指引**:
- 修改文本域 placeholder: 编辑 `js/pattern.js:59-60`
- 修改 OCR 识别语言: 编辑 `js/pattern.js:153` — `'chi_sim+eng'`
- 修改 Tesseract CDN 地址: 编辑 `js/pattern.js:128`
- 修改图解解析规则: 编辑 `stitches.js` 中的 `parsePattern()` 函数
- 修改导入确认面板: 编辑 `js/pattern.js:176-227`


### 业务功能 - 语音模式

**🔤 用户描述方式**:
- 主要: "语音输入"、"语音控制"、"声控钩织"、"说数字加针"
- 别名: "voice mode"、"语音识别"、"语音计数"、"喊针法"

**📍 代码位置**:
- 语音开关: `js/voice.js:105-188` — `toggleVoiceMode()`
- 语音识别初始化: `js/voice.js:50-103` — `initRecognition()`
- 识别处理: `js/voice.js:58-84` — 匹配数字 1-9 或撤销关键词
- 视觉效果: `js/stitch.js:1037-1053` — `triggerEdgeGlow()`（屏幕边缘闪烁）
- 呼吸指示器: `js/voice.js:190-200` — `setVoicePulse()`（红点脉冲动画）
- 按钮状态: `js/voice.js:202-224` — `updateVoiceButton()`
- 音效: `js/voice.js:12-48` — `playSound()`
- 底部按钮: `js/stitch.js:677` — 底部操作栏"🎙 语音"按钮
- 语音提示横幅: `js/render.js:204-219`（首次使用时显示）
- 语音教程: `js/voice.js:232-260` — `openVoiceTutorial()`

**🎨 视觉标识**:
- 底部操作栏"🎙 语音"按钮
  - 关闭: 灰色普通按钮
  - 启动中: 橙色 + 脉冲动画，文字"🎙 启动中"
  - 已开启: 红色 + 脉冲动画，文字"🎙 语音中"
- 屏幕右下角红色脉冲圆点（语音呼吸指示器）
- 添加针法时屏幕边缘闪烁对应颜色
- 针法按钮显示数字 1-9（语音模式下）

**⚡ 修改指引**:
- 修改识别语言: 编辑 `js/voice.js:54` — `r.lang = 'zh-CN'`
- 修改撤销触发关键词: 编辑 `js/voice.js:62`
- 修改数字映射: 编辑 `js/state.js:45-55` — `NUMBER_MAP`
- 修改按钮文字/颜色: 编辑 `js/voice.js:202-224`
- 修改边缘闪烁时长: 编辑 `js/stitch.js:1045-1052`


### 业务功能 - 语音提示横幅

**🔤 用户描述方式**:
- 主要: "语音提示条"、"语音模式引导横幅"、"语音提示 banner"
- 别名: "voice hint"、"语音功能提示"、"首次语音提示"

**📍 代码位置**:
- 渲染: `js/render.js:204-219` — 在 `renderProject()` 底部附加
- 关闭: `js/voice.js:226-229` — `dismissVoiceHint()`，写 localStorage `voice_hint_shown`
- 打开教程: `js/voice.js:232-260` — `openVoiceTutorial()`
- 判断逻辑: `js/render.js:204` — `localStorage.getItem('voice_hint_shown') === null`

**🎨 视觉标识**:
- 黄色背景横幅，固定在底部操作栏上方
- 文字"🎙 试试语音模式，解放双手钩织"
- 右侧"了解 ›"链接 和 × 关闭按钮

**⚡ 修改指引**:
- 修改横幅文字: 编辑 `js/render.js:210`
- 修改显示条件: 编辑 `js/render.js:204`
- 修改横幅样式: 编辑 `js/render.js:205-219` 内联样式


### 业务功能 - 语音模式教程

**🔤 用户描述方式**:
- 主要: "语音使用说明"、"语音教程"、"怎么看语音怎么用"
- 别名: "voice tutorial"、"语音帮助"、"语音指南"

**📍 代码位置**:
- 功能: `js/voice.js:232-260` — `openVoiceTutorial()`
- 入口: 语音提示横幅的"了解 ›"链接 + 设置页"语音模式使用说明"

**🎨 视觉标识**:
- Sheet 弹窗，黄色提示卡片（说明推荐手动模式）
- 4 步教程：开启 → 说数字 → 说撤销 → 音效反馈

**⚡ 修改指引**:
- 修改教程内容: 编辑 `js/voice.js:233-259`
- 修改提示卡片文字: 编辑 `js/voice.js:237`


### 界面元素 - 项目封面图片

**🔤 用户描述方式**:
- 主要: "项目封面"、"设置封面图"、"封面照片"、"项目缩略图"
- 别名: "cover image"、"封面"、"项目图片"、"更换封面"、"移除封面"

**📍 代码位置**:
- 选择封面: `js/image.js:73-79` — `pickCover(projectId)`，创建文件选择 input
- 压缩处理: `js/image.js:10-33` — `compressImage(file)`，Canvas 压缩到 200px、JPEG 0.72 质量
- 保存封面: `js/image.js:47-56` — `setProjectCover(projectId, input)`
- 移除封面: `js/image.js:63-70` — `removeProjectCover(projectId)`
- 读取封面: `js/image.js:42-44` — `getProjImage(projId)`
- 新增存储函数: `js/image.js:37-40` — `saveProjImage(projId, base64)`（写入独立 key `img_{projId}`）
- 渲染显示: `js/render.js:38-43`（首页封面/占位图标）
- 存储位置: localStorage key `img_{projId}`（base64 字符串，独立于主 JSON）
- 入口: 项目卡片菜单"🖼 设置封面" + 已有封面时"🗑 移除封面"

**🎨 视觉标识**:
- 项目卡片左侧：有封面显示 42×42 圆角图片，无封面显示 🧶 图标
- 点击封面图片可更换封面
- 菜单"设置封面"打开系统文件选择器（只接受图片）

**⚡ 修改指引**:
- 修改压缩尺寸: 编辑 `js/image.js:10` 的 `maxSize` 默认值 200
- 修改图片质量: 编辑 `js/image.js:27` — `canvas.toDataURL('image/jpeg', 0.72)`
- 修改封面图片样式: 编辑 CSS `.proj-cover-img`
- 修改占位图标: 编辑 `js/render.js:40` — `<div class="proj-icon">🧶</div>`


### 应用设置 - 主题切换

**🔤 用户描述方式**:
- 主要: "主题颜色"、"换肤"、"切换配色方案"
- 别名: "theme"、"配色"、"马卡龙/深海/森林/简约"

**📍 代码位置**:
- 主题列表: `js/settings.js:13-18`（Sheet 版），`js/settings.js:85-90`（设置页版）
- 切换逻辑: `js/settings.js:160-182` — `changeTheme(themeKey)`
- 主题色定义: `js/stitch.js:26-52` — `ALL_THEMES`（各主题针法颜色映射）
- 存储: `state.data.settings.theme`
- CSS 变量: `index.html:15-28` — `:root` 中的默认色板

**🎨 视觉标识**:
- 设置页中 4 个主题方块，每个显示 4 个颜色圆点
- 选中主题有橙色边框高亮
- 切换后针法按钮、针法胶囊颜色随主题变化
- 4 个主题：马卡龙（粉色系）、深海（蓝色系）、森林（绿色系）、简约（灰色系）

**⚡ 修改指引**:
- 新增主题: 在 `js/settings.js:13-18` 和 `js/stitch.js:26-52` 中添加新 theme
- 修改默认主题: 编辑 `js/state.js:8` 的默认值 `"macaron"`
- 修改主题显示名称: 编辑 `js/settings.js:14` 的 `name` 字段


### 应用设置 - 语音默认开关

**🔤 用户描述方式**:
- 主要: "默认开启语音"、"进入项目自动开语音"、"语音自动启动"
- 别名: "voice default"、"语音自动开启"、"默认语音模式"

**📍 代码位置**:
- UI: `js/settings.js:109-113` — 开关组件
- 切换逻辑: `js/settings.js:184-189` — `toggleVoiceDefault()`
- 存储: `state.data.settings.voiceEnabled`

**🎨 视觉标识**:
- 设置页中滑动开关（toggle switch）
- 开关为棕色时表示开启

**⚡ 修改指引**:
- 修改标签文字: 编辑 `js/settings.js:111` — "进入项目默认开启语音"
- 修改开关样式: 编辑 CSS `.settings-toggle` 系列


### 应用设置 - 语音音效开关

**🔤 用户描述方式**:
- 主要: "语音音效"、"语音模式声音反馈"、"提示音开关"
- 别名: "voice sound"、"音效开关"、"滴答声"

**📍 代码位置**:
- UI: `js/settings.js:116-121` — 开关组件
- 切换逻辑: `js/settings.js:191-196` — `toggleVoiceSound()`
- 存储: `state.data.settings.voiceSoundEnabled`
- 音效播放: `js/voice.js:81-83` — 识别到数字后播放 'stitch' 音

**🎨 视觉标识**:
- 设置页"语音"区域第二个滑动开关
- 开启后每次语音添加针法时播放短促提示音

**⚡ 修改指引**:
- 修改标签文字: 编辑 `js/settings.js:118` — "语音模式音效"
- 修改音效参数: 编辑 `js/voice.js:30-34` 的 'stitch' case


### 应用设置 - 设置页面

**🔤 用户描述方式**:
- 主要: "设置页面"、"设置"、"应用设置"
- 别名: "settings page"、"设置中心"、"偏好设置"

**📍 代码位置**:
- 页面渲染: `js/settings.js:69-158` — `renderSettings()`
- Sheet 弹窗: `js/settings.js:5-67` — `openSettings()`
- 入口: 底部标签栏 ⚙️ + 项目页头部 ⚙️ 按钮

**🎨 视觉标识**:
- 全页面视图（替换 screen 内容）或 Sheet 弹窗
- 分区：外观（主题选择 4 列）、语音（2 个开关 + 使用说明）、数据管理（统计 + 导出/导入/清空按钮）、安装（安装教程）、关于（版本号）
- 统计信息："N 个项目 · 累计 N 针"

**⚡ 修改指引**:
- 修改版本号显示: 编辑 `js/settings.js:152` — "钩织计数本 v0.1"
- 修改设置项顺序: 编辑 `js/settings.js:69-158` 中 html 拼接顺序
- 新增设置项: 在 `js/settings.js` 中参照现有模式添加


### 其他功能 - 导出 PDF / 打印

**🔤 用户描述方式**:
- 主要: "打印项目"、"导出 PDF"、"打印图解"
- 别名: "print"、"PDF 导出"、"打印版"

**📍 代码位置**:
- 功能: `js/storage.js:134-136` — `exportPDF()`，调用 `window.print()`
- 触发按钮: `index.html:1233` — 头部 📄 按钮
- 打印样式: `index.html:659-719` (CSS `@media print`) — 隐藏底部栏、操作按钮，调整布局

**🎨 视觉标识**:
- 头部 PDF 图标按钮（仅在项目页显示）
- 打印时自动隐藏所有交互 UI，只保留圈/行卡片和针法序列

**⚡ 修改指引**:
- 修改打印隐藏的元素: 编辑 `index.html:674-686` 的 `@media print` display:none 列表
- 修改打印时标题大小: 编辑 `index.html:694-696`
- 添加打印自定义逻辑: 编辑 `js/storage.js:134-136`


### 其他功能 - PWA 安装引导

**🔤 用户描述方式**:
- 主要: "添加到主屏幕"、"安装为 App"、"PWA 安装教程"
- 别名: "install"、"桌面快捷方式"、"安装教程"、"添加到桌面"

**📍 代码位置**:
- 教程弹窗: `js/project.js:179-214` — `showPwaTutorial()`
- 提示横幅: `js/project.js:128-142`（归档成功后显示）
- 入口: 设置页"📲 安装到主屏幕"按钮 + 归档成功弹窗中的 PWA 提示
- PWA 配置: `manifest.json`
- Service Worker: `sw.js`

**🎨 视觉标识**:
- Sheet 弹窗教程：iOS Safari（分享→添加到主屏幕）和 Android Chrome（菜单→安装应用）步骤
- 推荐安装理由：离线可用、纯净体验、快速启动

**⚡ 修改指引**:
- 修改安装教程内容: 编辑 `js/project.js:180-213`
- 修改 PWA 应用名/图标: 编辑 `manifest.json`
- 修改 PWA 提示横幅中的"不再提示"逻辑: 编辑 `js/project.js:167-177` — `handlePwaHintOptOut()`


### 其他功能 - 版本更新提示

**🔤 用户描述方式**:
- 主要: "新版本提示"、"更新提醒"、"发现新版本"
- 别名: "update toast"、"版本更新"、"刷新提示"

**📍 代码位置**:
- 更新 Toast: `index.html:1334-1368` — `showUpdateToast()`
- SW 更新检测: `index.html:1307-1331` — SW `updatefound` 事件 + postMessage
- 版本号: `index.html:10` — `<meta name="version">`，由 `scripts/inject-version.js` 自动注入

**🎨 视觉标识**:
- 页面顶部棕色横幅"✨ 发现新版本"，右侧"立即刷新"按钮
- 或底部 Toast"新版本已就绪，刷新后生效" + 刷新操作按钮

**⚡ 修改指引**:
- 修改更新提示文字: 编辑 `index.html:1354`
- 修改更新检测逻辑: 编辑 `index.html:1309-1322`
- 修改版本号生成: 编辑 `scripts/inject-version.js`


### 数据层 - 数据存储结构

**🔤 用户描述方式**:
- 主要: "数据结构"、"存储格式"、"数据在哪里"
- 别名: "data model"、"存储结构"、"JSON 格式"、"localStorage key"

**📍 代码位置**:
- 全局状态定义: `js/state.js:4-37` — `state` 对象
- 持久化 key: `js/storage.js:32` — `"crochet_v4"`
- 数据加载/迁移: `js/storage.js:47-119` — `loadData()` / `migrateData()`
- 存储适配器: `js/storage.js:5-30` — `storageAdapter`
- 封面图片存储: 独立的 `localStorage` key `img_{projId}`（不在主数据 JSON 中）

**数据结构概览**:
```
state.data = {
  schemaVersion: LATEST_SCHEMA,     // 当前 schema 版本号（用于版本门控迁移）
  projects: [{
    id, name, archived,
    // 注意：coverImage 已从项目对象中移除，改为独立 localStorage key
    useRowTerms,                    // 用"行"还是"圈"
    activePartId,                   // 当前活跃部件 ID
    parts: [{
      id, title, rawPattern,
      customPalette: ["X","V",...], // 定制针法按钮列表
      activeRoundId,                // 当前活跃圈 ID
      rounds: [{
        id, roundNum,               // 圈号（null=备注卡, 0=起针）
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
    theme: "macaron",               // "macaron"|"ocean"|"forest"|"minimal"
    customColors: {},               // 全局自定义颜色
    voiceEnabled: false,            // 进入项目默认开启语音
    voiceSoundEnabled: false        // 语音模式音效
  }
}
```

**⚡ 修改指引**:
- 新增字段: 先在 `js/state.js` 定义默认值，在 `js/storage.js` 的 `migrateData()` 添加兼容逻辑，bump `LATEST_SCHEMA`
- 修改 localStorage key: 编辑 `js/storage.js` 中的 `STORAGE_KEY`
- 修改存储适配器行为: 编辑 `js/storage.js` 的 `storageAdapter`
- 添加封面图片相关字段: 使用 `js/image.js` 的 `saveProjImage()` / `getProjImage()`，数据不在主 JSON 中


### 数据层 - 数据迁移逻辑

**🔤 用户描述方式**:
- 主要: "旧数据兼容"、"数据升级"、"老版本数据迁移"
- 别名: "data migration"、"格式转换"、"数据升级脚本"

**📍 代码位置**:
- 迁移函数: `js/storage.js:124-198` — `migrateData(d)`
- 调用时机: `js/storage.js:113` — `loadData()` 读取数据后立即调用
- schema 版本常量: `js/storage.js:33` — `LATEST_SCHEMA`（当前值为 2）
- 版本历史注释: `js/storage.js` 顶部文件头注释块
- 旧 ID 映射: `stitches.js` 中的 `OLD_ID_MAP` 导出

**版本门控迁移规则** (每次改数据形状必须遵循):
1. Bump `LATEST_SCHEMA` 常量 +1
2. 在 `migrateData()` 中添加 `if (d.schemaVersion < N) { ... }` 块
3. 更新文件顶部版本历史注释
4. 更新本文档的本节内容

**迁移项目**:
- **v0 → v1** (schemaVersion < 1):
  - 补全 `customSettings` 结构（names, colors, customStitches）
  - 旧版 `p.rounds` → 新版 `p.parts[].rounds` 封装（单部件 "主图解"）
  - 补全每个 part 的字段（rawPattern, title, customPalette）
  - 针法 ID 通过 `OLD_ID_MAP` 映射新旧 ID
  - 补全 `archived` 默认值
- **v1 → v2** (schemaVersion < 2):
  - 将 `proj.coverImage`（base64）迁移到独立 localStorage key `img_{projId}`
  - 从项目对象中删除 `coverImage` 字段
  - 注意：当前代码中 `p.coverImage` 字段已不复存在，封面通过 `getProjImage(p.id)` 读取

**⚡ 修改指引**:
- 添加新的数据迁移规则: 编辑 `js/storage.js` 的 `migrateData()`，添加版本门控块
- 添加旧 ID 映射: 编辑 `stitches.js` 中的 `OLD_ID_MAP`
- 修改当前 schema 版本: 编辑 `js/storage.js` 的 `LATEST_SCHEMA` 常量


### 基础设施 - 针法库定义

**🔤 用户描述方式**:
- 主要: "针法列表"、"全部针法"、"针法缩写定义"
- 别名: "stitch library"、"针法库"、"STITCH_LIB"、"内置针法"

**📍 代码位置**:
- 针法库: `stitches.js:4-60+` — `STITCH_LIB` 对象（30+ 种预设针法）
- 针法分类: 每个针法的 `category` 字段（basic / increase / decrease / special）
- 别名映射: `stitches.js` — `ALIAS_TO_ID`（中文名 → 英文 ID）
- 针法数组: `stitches.js` — `STITCHES`、`SM`（快捷引用）
- 图解解析器: `stitches.js` — `parsePattern()`、`extractStitches()`、`normalizeStitch()`、`resolveColor()`

**内置针法分类**:
- 基础: X(短针), T(中长针), F(长针), E(长长针)
- 加针: V, W, TV, TW, FV, FW, EV
- 减针: A, M, TA, TM, FA, FM, EA
- 特殊: CH(锁针), SL(引拔), SK(空针), G(狗牙针), Q(枣形针)

**⚡ 修改指引**:
- 新增预设针法: 在 `stitches.js` 的 `STITCH_LIB` 中添加条目
- 修改针法中文名: 编辑对应条目的 `label` 字段
- 修改别名映射: 编辑 `stitches.js` 中的 `ALIAS_TO_ID`
- 修改图解解析规则: 编辑 `stitches.js` 中的 `parsePattern()` 函数


### 基础设施 - 全局状态管理

**🔤 用户描述方式**:
- 主要: "应用状态"、"全局数据"、"应用记忆"
- 别名: "state"、"全局变量"、"应用上下文"、"数据存储"

**📍 代码位置**:
- 状态定义: `js/state.js:4-37` — 完整的 `state` 对象
- 辅助函数: `js/state.js:57-73` — `uid()`, `getProj()`, `getActivePart()`, `isPartEmpty()`
- 数字映射: `js/state.js:45-55` — `NUMBER_MAP`（中文数字 → 阿拉伯数字）
- 全局暴露: `js/main.js:38` — `window.state = state`

**状态字段说明**:
- `curProjId`: 当前打开的项目 ID
- `expandedRounds`: Set，记录展开的圈 ID
- `selectedStitch`: 被选中的针法位置 {roundId, idx}
- `pendingInsert`: 待插入状态 {roundId, idx, dir}
- `filterByRound`: 是否按圈筛选针法
- `editingPartId`: 正在编辑名称的部件 ID
- `flowState.*`: 各种临时流程状态

**⚡ 修改指引**:
- 新增全局状态: 在 `js/state.js:4-37` 添加字段
- 修改 uid 生成算法: 编辑 `js/state.js:58`
- 修改 getProj 查找逻辑: 编辑 `js/state.js:59`


### 基础设施 - 全局函数注册机制

**🔤 用户描述方式**:
- 主要: "全局函数"、"HTML onclick 调用"、"window 函数注册"
- 别名: "_globals"、"函数暴露"、"inline handler"

**📍 代码位置**:
- 注册机制: `js/main.js:83-113` — `_globals` 对象 + `Object.entries` 遍历挂到 `window`
- 所有模块的导出函数通过 `_globals` 暴露给 HTML 的 `onclick` 属性

**运作方式**:
- 各 JS 模块通过 ES Module `export` 导出函数
- `main.js` import 所有需要的函数
- 在 `_globals` 对象中列出需要暴露到 `window` 的函数
- 通过 `Object.entries(_globals).forEach(...) => window[k] = v` 注册

**⚡ 修改指引**:
- 新增全局函数: 在对应模块中 export，在 `main.js` 顶部 import，在 `_globals` 对象中添加条目
- 移除全局函数: 从 `_globals` 中删除对应条目
- 修改全局注册方式: 编辑 `js/main.js:113`


---

## 🚀 使用说明

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
- "归档后弹出的提示太多了，想精简"

### 对于 AI
收到用户需求后：

1. 在映射表中搜索相关的"用户描述方式"关键词
2. 定位到对应的"代码位置"
3. 根据"修改指引"提供具体的修改方案
4. 优先使用 `Edit` 工具做精确修改，避免大段重写
