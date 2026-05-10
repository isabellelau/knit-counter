# 钩织计数本 — 开发上下文

## 当前工作
UI 重写进行中，所有 UI 相关改动必须在 ui-redesign 分支上进行。
切勿在 main 分支上修改任何 UI 文件。

## 分支规则
- main：稳定版本，bug fix 和非 UI 改动在这里做，做完要同步到 ui-redesign
- ui-redesign：UI 重写工作分支，最终会合并回 main 替换现有版本

## 每次在 main 做完改动后
切回 ui-redesign 并同步：
git checkout ui-redesign
git merge main

## 每次开始 UI 工作前必做
确认当前分支：git branch --show-current
如果不在 ui-redesign，执行：git checkout ui-redesign

## 技术栈
- 纯 HTML/JS，无框架，ES Modules
- 样式唯一来源：styles.css
- 状态管理：js/state.js 全局单例
- 功能映射文档：AI-FEATURE-MAP.md

## 禁止事项
- 不允许在 styles.css 以外的地方写 CSS
- 不允许修改 js/ 目录下的逻辑文件（ui-redesign 阶段只动样式和 HTML 结构）
- 不允许修改数据结构