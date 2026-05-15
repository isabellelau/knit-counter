// UI 文案层：所有界面字符串
// 编织术语请使用 terms.js，不要在此重复定义
// 动态参数用 {param} 占位，调用时替换

export default {
  // ═════════════════════════════════════
  //  通用操作
  // ═════════════════════════════════════
  confirm: '确定',
  cancel: '取消',
  save: '保存',
  delete: '删除',
  edit: '编辑',
  close: '关闭',
  back: '返回',
  done: '完成',
  got_it: '我知道了',
  ok: '知道了',
  select_all: '全选',
  clear_all: '清空',
  undo: '撤销',
  restored: '已恢复',
  more_actions: '更多操作',
  loading: '正在加载...',
  app_name: '织影',
  unnamed: '未命名',

  // ═════════════════════════════════════
  //  本地身份卡
  // ═════════════════════════════════════
  profile_default_name: '钩织人',
  profile_change_avatar: '更换头像',
  profile_remove_avatar: '移除头像',
  profile_edit_title: '修改昵称',
  profile_edit_placeholder: '输入你的昵称',
  profile_edit_save: '保存',

  // ═════════════════════════════════════
  //  导航
  // ═════════════════════════════════════
  tab_projects: '项目',
  tab_settings: '设置',
  nav_back: '返回',
  nav_settings: '设置',

  // ═════════════════════════════════════
  //  首页
  // ═════════════════════════════════════
  home_empty_moti: '每一点积累都会被看见',
  home_today_label: '今日已钩',
  home_stats_projects: '项目',
  home_stats_stitches: '累计针数',
  home_stats_focus: '专注时长',
  home_total_stitches: '{count} 针',
  home_total_projects: '{count} 项',
  home_total_days: '累计 {count} 天',
  home_empty: '还没有项目，点击下方创建第一个 🌸',
  home_archived_section: '📦 已归档',
  home_new_project_btn: '＋ 新建项目',

  // ═════════════════════════════════════
  //  项目操作
  // ═════════════════════════════════════
  new_project: '新建项目',
  rename_project: '重命名项目',
  project_name_placeholder: '项目名称，例如：粉色帽子',
  delete_project: '删除项目',
  delete_project_confirm: '确定要删除这个项目吗？此操作不可恢复。',
  archive: '归档',
  unarchive: '取消归档',
  archive_confirm: '确定归档「{name}」？归档后可在下方列表找到，仍可继续编辑。',
  archived_title: '「{name}」已归档',
  set_cover: '设置封面',
  remove_cover: '移除封面',
  add_ref_image: '添加参考图',
  manage_ref_images: '管理参考图',
  ref_images_title: '参考图（{n} 张）',
  default_part_title: '主图解',
  toggle_row_terms: '切换圈行',

  // ═════════════════════════════════════
  //  部件操作
  // ═════════════════════════════════════
  part_default_name: '部件 {n}',
  add_part: '新增部件',
  delete_part: '删除部件',
  edit_part_name: '编辑名称',
  finish_edit_name: '完成编辑',
  delete_part_confirm: '确定删除这个部件及其中所有记录？此操作不可撤销。',

  // ═════════════════════════════════════
  //  圈/行操作
  // ═════════════════════════════════════
  note: '备注',
  cast_on: '起针',
  round_label: '第 {n} {unit}',
  editing_badge: '编辑中',
  edit_instruction: '编辑图解',
  set_as_current: '点击设为当前{unit}',
  delete_round: '删除这一{unit}',
  delete_round_confirm: '确定要删除这一{unit}吗？',
  deleted_round: '已删除一{unit}',
  add_round_btn: '＋ 新一{unit}',
  empty_round_hint: '暂无记录，点击下方针法按钮添加',
  empty_instruction_hint: '暂无图解，点击导入或开始记录',
  round_need_calibration: '本圈图解需要校准 · 点击🪡编辑',
  highlight_need_calibration: '本圈图解需要校准才能启用高亮',
  last_round_immersive_hint: '已经是最后一圈了，请退出沉浸模式添加新圈',
  round_count_label: '{total} 针',
  instruction_placeholder: '例：R4: 10(X,V,X)',
  instruction_calibrated: '图解校准成功 ✓',
  expected_count_hint: '图解定义 {parsed} 针，高亮序列由图解决定，如有需要请优先直接修改图解',

  // ═════════════════════════════════════
  //  针法操作
  // ═════════════════════════════════════
  stitch_n_of_total: '第 {n} 针 / 共 {total} 针',
  stitch_detail_title: '第 {idx} 针',
  change_to: '更改为',
  insert_stitch: '插入针法',
  insert_before: '在此针前插入',
  insert_before_sub: '第 {idx} 针之前',
  insert_after: '在此针后插入',
  insert_after_sub: '第 {idx} 针之后',
  delete_stitch: '删除此针',
  select_stitch_to_insert: '选择要插入的针法',
  category_basic: '基础针法',
  category_increase: '加针类',
  category_decrease: '减针类',
  category_special: '特殊针法',
  cat_basic_short: '基础',
  cat_increase_short: '加针',
  cat_decrease_short: '减针',
  cat_special_short: '特殊',
  choose_stitches: '选择常用针法',
  customize_hint: '点击 ✎ 可自定义名称与颜色',
  customize_btn: '✎ 自定义',
  add_remove_stitches: '增减',
  add_remove_stitches_title: '增减针法',
  new_stitch: '＋ 新建针法',
  stitch_id_label: '缩写 ID（英文，如 DC3L）',
  stitch_id_placeholder: '例如：DC3L',
  stitch_name_label: '名称（中文标签）',
  stitch_name_placeholder: '例如：三卷长针',
  name_field: '名称',
  color_field: '颜色',
  category_field: '分类',
  reset_default: '恢复默认',
  delete_custom_stitch: '🗑 删除此针法',
  back_btn: '← 返回',
  save_btn: '✓ 保存',
  create_btn: '✓ 创建',
  start_knitting: '开始钩织',
  update_config: '更新配置',
  stitch_id_required: '请输入缩写 ID',
  stitch_id_conflict: '该 ID 与预设针法冲突，请换一个',
  stitch_id_exists: '该 ID 已存在',
  add_to_global_library: '加入我的针法库（所有项目可用）',
  delete_custom_stitch_confirm: '确定要删除自定义针法「{name}」吗？',

  // ═════════════════════════════════════
  //  图解导入
  // ═════════════════════════════════════
  import_pattern: '导入图解',
  pattern_placeholder: '在此粘贴图解文字，或上传图片自动识别...\n例如：\nR1: 6X\nR2: 6V\nR3: [1X, 1V]*6',
  ocr_button: '📷 识别图片',
  parse_preview: '🔍 解析预览',
  pattern_empty_error: '请输入图解内容',
  pattern_parse_failed: '未能解析出任何内容，请检查格式',
  parse_confirm_title: '✅ 校验图解（{rounds} {unit} · {texts} 条备注）',
  text_card_badge: '备注',
  detected_stitches: '检测到针法：',
  import_to_empty_hint: '内容将直接填入当前空白部件',
  confirm_import_start: '确认导入并开始',
  overwrite_part: '覆盖当前部件',
  overwrite_warning: '原有进度将被清除',
  import_as_new_part: '作为新部件导入',
  import_new_part_hint: '保留当前进度，创建新分类',
  back_to_edit: '← 返回修改',
  new_part_label: '部件 ',
  pattern_synced: '图解已同步至 ',

  // ═════════════════════════════════════
  //  OCR
  // ═════════════════════════════════════
  ocr_initializing: '⏳ 正在初始化识别引擎...',
  ocr_loading_engine: '正在加载识别引擎...',
  ocr_in_progress: '⏳ 识别中...',
  ocr_in_progress_zero: '⏳ 识别中... 0%',
  ocr_complete: '✅ 识别完成，请检查修正后点击解析',
  ocr_failed: '❌ 识别失败，请手动输入',
  tesseract_load_failed: 'Tesseract 加载失败',
  tesseract_script_failed: 'Tesseract 脚本加载失败',

  // ═════════════════════════════════════
  //  语音模式
  // ═════════════════════════════════════
  voice_btn: '🎙 语音',
  voice_btn_on: '🎙 语音中',
  voice_btn_starting: '🎙 启动中',
  voice_mic_denied: '麦克风权限被拒绝',
  voice_not_supported: '当前浏览器不支持语音识别',
  voice_mic_denied_settings: '麦克风权限被拒绝，请在浏览器设置里允许',
  voice_start_failed: '语音启动失败，请重试',
  voice_tutorial_title: '🎙 语音模式使用说明',
  voice_tutorial_warning: '💡 追求快速记录针数的用户优先推荐手动模式。Web 端语音识别存在不可避免的延迟，适合对节奏要求不高的场景。',
  voice_tutorial_step1_title: '① 开启语音模式',
  voice_tutorial_step1_body: '点击底部"🎙 语音"按钮，按钮变红即为开启。首次使用需要允许麦克风权限。',
  voice_tutorial_step2_title: '② 说数字添加针法',
  voice_tutorial_step2_body: '说"一"到"九"，对应底部针法按钮的顺序（从左到右）。开启语音模式后按钮上会显示对应数字。',
  voice_tutorial_step3_title: '③ 说"撤销"删除上一针',
  voice_tutorial_step3_body: '识别到"撤销""撤回""取消"均可触发撤销。',
  voice_tutorial_step4_title: '④ 音效反馈（推荐打开）',
  voice_tutorial_step4_body: '可在设置里开启"语音模式音效"，每针成功添加时播放短促提示音。',
  voice_hint_bar: '🎙 说数字 1-9 添加针法 · 说"撤销"删除上一针',

  // ═════════════════════════════════════
  //  智能高亮
  // ═════════════════════════════════════
  highlight_btn: '✦ 高亮',
  highlight_toggle_label: '智能高亮当前针',
  highlight_toggle_desc: '每次只高亮下一针，其他针法降低亮度',
  highlight_toggle_footer: '开启后在底部针法面板自动聚焦当前需钩织的下一针',
  highlight_enabled_toast: '智能高亮已开启 · 长按可关闭',
  highlight_disabled_toast: '智能高亮已关闭',
  highlight_status_current: '第 {n} 针 / 共 {total} 针',
  highlight_status_done: '本圈已完成 ✓',
  highlight_status_calibrate: '图解需要校准，点击编辑 ›',

  // ═════════════════════════════════════
  //  沉浸模式
  // ═════════════════════════════════════
  immersive_enter: '⛶ 沉浸',
  immersive_exit: '⛶ 退出沉浸',
  immersive_exit_short: '⊡ 退出',
  immersive_undo: '↩ 撤销',
  immersive_next_round: '下一圈 ›',
  annotator_save_confirm: '保存标注图片？',
  annotator_saved: '标注已保存',
  annotator_exit_confirm: '有未保存的标注，是否保存后离开？',
  annotator_exit_title: '未保存的修改',
  annotator_discard: '放弃',
  immersive_edit_blocked: '请退出沉浸模式后编辑图解',

  // ═════════════════════════════════════
  //  创建方式选择
  // ═════════════════════════════════════
  entry_choice_title: '选择创建方式',
  entry_paste_auto: '粘贴图解（自动配置）',
  entry_paste_auto_sub: '自动识别针法，快速开始钩织',
  entry_manual: '手动输入图解',
  entry_manual_sub: '用点按键盘逐圈输入，无需粘贴原文',
  entry_skip: '跳过（使用全部针法）',
  entry_stitch_only: '不使用文字图解，直接选择针法',
  entry_stitch_only_sub: '进入针法配置面板，手动挑选需要的针法',

  // ═════════════════════════════════════
  //  设置页
  // ═════════════════════════════════════
  settings: '设置',
  settings_color: '配色设置',
  settings_permissions: '系统权限',
  settings_data: '数据管理',
  settings_advanced: '进阶功能',
  settings_about: '关于',
  settings_language: '语言 / Language',
  settings_notation: '针法显示',
  settings_notation_desc: '独立于界面语言，仅影响针法名称显示',
  settings_show_symbol: '显示国际通用符号（X / V / A）',
  settings_show_symbol_desc: '关闭后仅显示针法名称',
  settings_ui_theme: '界面主题',
  settings_ui_theme_desc: '切换整体 UI 配色',
  settings_stitch_theme: '针法配色',
  settings_stitch_theme_desc: '仅影响针法胶囊颜色，不影响 UI 主题',
  settings_stitch_theme_footer: '在项目内点击针法按钮右上角的 ✎ 可自定义',
  theme_morandi: '莫兰迪',
  theme_morandi_sub: '浅色 · 暖调',
  theme_night: '夜色',
  theme_night_sub: '深色 · 暗调',
  theme_system: '跟随系统',
  theme_system_sub: '自动切换',
  stitch_theme_warm: '暖煦',
  stitch_theme_warm_sub: '莫兰迪暖调',
  stitch_theme_dark: '沉影',
  stitch_theme_dark_sub: '夜色冷调',
  stitch_theme_float: '浮光',
  stitch_theme_float_sub: '清透淡彩',
  settings_stitch_assist: '针法辅助',
  settings_stitch_library: '全局针法库',
  settings_pro_badge: 'PRO',
  settings_permissions_placeholder: '麦克风权限管理、通知设置等将在此处配置',
  settings_stats: '统计',
  settings_n_projects: '{n} 个项目',
  settings_stats_text: '当前 {projects} 个项目 · 累计 {stitches} 针',
  settings_actions: '操作',
  settings_export: '📤 导出备份',
  settings_import: '📥 导入备份',
  settings_clear_all: '🗑 清空所有数据',
  settings_clear_confirm: '确定要清空所有数据吗？此操作不可恢复。',
  settings_cleared: '所有数据已清空',
  settings_install_section: '安装',
  settings_install_btn: '📲 安装到主屏幕',

  // ═════════════════════════════════════
  //  数据导入/导出
  // ═════════════════════════════════════
  import_file_error: '文件格式错误',
  import_missing_projects: '缺少 projects 数组',
  import_item_missing_fields: '第 {n} 个项目缺少必要字段',
  import_confirm: '确定导入备份？\n共有 {count} 个项目\n当前 {current} 个项目将被覆盖',
  import_success: '✅ 数据恢复成功',
  import_failed: '❌ 导入失败：',
  import_read_failed: '❌ 文件读取失败',
  storage_quota: '存储空间不足，请删除部分封面图片',
  storage_usage: '存储空间已用 {used}MB / {quota}MB · 建议导出备份后清理旧项目',
  export_filename: '织影备份_{date}.json',

  // ═════════════════════════════════════
  //  封面
  // ═════════════════════════════════════
  cover_save_failed_quota: '存储空间不足，封面保存失败 · 建议导出备份后清理旧项目',
  cover_save_failed: '封面保存失败，请重试',
  cover_updated: '封面已更新',
  cover_process_failed: '图片处理失败，请重试',
  cover_removed: '封面已移除',

  // ═════════════════════════════════════
  //  归档
  // ═════════════════════════════════════
  archive_tip_title: '技巧提示',
  archive_tip_tutorial: '详细教程 >',
  archive_pwa_hint: '您可以将本页面"添加到主屏幕"，下次即可像 App 一样从桌面直接打开，体验更沉浸。',
  archive_no_more_hint: '后续不再提示',
  archive_backup_title: '下载备份文件',
  archive_backup_desc: '如果你需要换手机或多设备使用，建议保存一份备份。平时只用一台手机的话，无需操作。',
  archive_download_btn: '下载「{name}」的备份',
  archive_where_backup: '在哪里找到备份文件？',
  archive_ios_path: 'iPhone：文件 App → 我的iPhone → 下载',
  archive_android_path: '安卓：文件管理器 → 下载文件夹',
  archive_backup_tip: '防丢小技巧：把文件发送到微信收藏，换手机后也能找回',

  // ═════════════════════════════════════
  //  PWA 安装教程
  // ═════════════════════════════════════
  pwa_tutorial_title: '如何安装为 App',
  pwa_ios_title: 'iOS (Safari 浏览器)',
  pwa_ios_step1: '1. 点击浏览器底部的分享按钮（方框带向上箭头）。',
  pwa_ios_step2: '2. 向上滑动菜单，找到并点击"添加到主屏幕"。',
  pwa_ios_step3: '3. 点击右上角的"添加"即可完成。',
  pwa_android_title: 'Android (Chrome/自带浏览器)',
  pwa_android_step1: '1. 点击右上角或右下角的"三个点"或"菜单"图标。',
  pwa_android_step2: '2. 找到并点击"安装应用"或"添加到主屏幕"。',
  pwa_android_step3: '3. 根据系统提示完成添加。',
  pwa_why_title: '为什么推荐安装？',
  pwa_why_offline: '离线可用：在没有网络的情况下也能打开和使用。',
  pwa_why_clean: '纯净体验：隐藏浏览器地址栏，操作空间更大。',
  pwa_why_fast: '快速启动：直接从桌面点击图标，无需在浏览器标签页寻找。',

  // ═════════════════════════════════════
  //  Onboarding
  // ═════════════════════════════════════
  onboard_step1_title: '为每件作品建立项目',
  onboard_step1_desc: '围巾、毛衣、袜子……每个作品独立记录，支持封面图片和多个部件分区管理',
  onboard_step2_label: '已记录 24 针',
  onboard_step2_title: '精准记录每一针',
  onboard_step2_desc: '按圈记录针法序列，针数自动统计，支持图解导入和 OCR 文字识别',
  onboard_step3_title: '开始你的第一个项目',
  onboard_step3_desc: '一切准备就绪，马上开始记录你的钩织作品',
  onboard_next: '下一步',
  onboard_start: '开始使用',

  // ═════════════════════════════════════
  //  进度/统计
  // ═════════════════════════════════════
  progress_over: '{done} / {expected} 针（超出 {diff}）',
  progress_normal: '{done} / {expected} 针',
  progress_no_expected: '已钩 {done} 针',
  header_stats: '{parts} 部件 · {rounds} {unit} · {stitches} 针',
  filter_by_round: '仅显示本{unit}针法',

  // ═════════════════════════════════════
  //  Service Worker
  // ═════════════════════════════════════
  sw_update_ready: '新版本已就绪，刷新后生效',
  sw_update_found: '✨ 发现新版本',
  sw_update_refresh: '立即刷新',

  // ═════════════════════════════════════
  //  确认/对话框
  // ═════════════════════════════════════
  dialog_confirm_title: '确认操作',

  // ═════════════════════════════════════
  //  点按式图解编辑器
  // ═════════════════════════════════════
  instr_editor_kb_toggle: '键盘 ⌨',
  instr_editor_tap_toggle: '点按 ⊞',
  instr_editor_stitches_label: '针法',
  instr_editor_space: '空格',
  instr_editor_clear_btn: '清空',

  // ═════════════════════════════════════
  //  多圈图解编辑器
  // ═════════════════════════════════════
  multi_round_editor_title: '多圈图解编辑器',
  multi_round_prev_round: '上一圈',
  multi_round_next_round: '下一圈',
  multi_round_nav_indicator: '第 {n} 圈 / 共 {total} 圈',
  multi_round_nav_prev_empty: '—',

  // ═════════════════════════════════════
  //  分享图
  // ═════════════════════════════════════
  share_generate: '生成分享图',
  share_preview_title: '分享图预览',
  share_save: '保存图片',
  share_share: '分享',
  share_saved_hint: '已保存，请手动分享',
  share_include_name: '包含身份签名',
  share_total_stitches: '总针数',
  share_total_rounds: '总圈数',

  // ═════════════════════════════════════
  //  记号扣
  // ═════════════════════════════════════
  marker_title: '记号扣',
  marker_color: '颜色',
  marker_note: '备注',
  marker_note_placeholder: '备注，如：左肩缝合点',
  marker_add: '🔖 打记号扣',
  marker_edit: '🔖 编辑记号扣',
  marker_remove: '🗑 移除记号扣',
  marker_pos: '第 {n} 针',
  marker_none: '这一圈还没有记号扣',
  marker_review_title: '记号扣检查（{count} 个）',
  marker_drift_warning: '⚠️ 本圈有 {n} 个记号扣，位置可能已变化',
  marker_drift_check: '检查',

  // ═════════════════════════════════════
  //  复合针法 & 循环标记
  // ═════════════════════════════════════
  compound_stitch_warning: '⚠️ 此针目包含 {count} 个动作（{stitch}），请确认完成后再继续',
  loop_marker_label: '循环 R{from}-R{to}',
  copy_structure_btn: '复制此圈结构',
  copy_structure_from: '↻ 从已有圈复制结构',
  copy_structure_empty: '该圈没有针法数据',
  copy_loop_structure_done: '已复制 R{from}–R{to} 结构，共 {count} {unit}',
  add_round_sheet_title: '新增{unit}',
  add_round_blank: '＋ 空白{unit}',
  resume_progress_title: '继续上次进度？',
  resume_progress_msg: '上次钩到\n第 {roundNum} 圈 · 第 {stitchIndex} 针\n{time}',
  resume_continue: '继续',
  resume_skip: '从头浏览',
};
