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
  add_round_btn: '+R',
  empty_round_hint: '暂无记录，点击下方针法按钮添加',
  empty_instruction_hint: '暂无图解，点击导入或开始记录',
  round_need_calibration: '本圈图解需要校准 · 点击🪡编辑',
  flow_mode_need_calibration: '本圈图解需要校准才能启用心流模式',
  last_round_immersive_hint: '已经是最后一圈了，请退出沉浸模式添加新圈',
  round_count_label: '{total} 针',
  instruction_placeholder: '例：R4: 10(X,V,X)',
  instruction_calibrated: '图解校准成功 ✓',
  expected_count_hint: '图解定义 {parsed} 针，心流序列由图解决定，如有需要请优先直接修改图解',

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
  import: '导入',
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
  add_confirm_round: '＋ 手动加圈',
  confirm_round_placeholder: '输入图解，如 20X 或 5SC',
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
  voice_tutorial_warning: '📢 语音模式通过麦克风识别你的指令来操作钩织记录，适合手工不停、口头计数的场景。',
  voice_tutorial_step1_title: '① 开启与关闭',
  voice_tutorial_step1_body: '点击项目页底部的 🎙 语音 按钮。首次使用需允许麦克风权限。按钮变红并闪烁表示正在监听。再次点击即可关闭。切换项目或退出 App 不会自动关闭，需手动操作。',
  voice_tutorial_step2_title: '② 针法指令',
  voice_tutorial_step2_body: '直接说出针法名称即可添加一针。支持批量添加（如"三短针""五加针"）。也可以直接说一～九，对应底部针法按钮从左到右的顺序，开启语音后按钮上会显示编号。<br><br><table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="color:var(--muted);font-weight:600"><td style="padding:3px 8px;border-bottom:1px solid var(--border)">说出</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">添加</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">短针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">短针 X</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">中长针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">中长针 T</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">长针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">长针 F</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">长长针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">长长针 E</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">锁针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">锁针 CH</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">引拔</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">引拔 SL</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">加针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">加针 V</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">减针</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">减针 A</td></tr><tr><td style="padding:3px 8px">空针</td><td style="padding:3px 8px">空针 SK</td></tr></table>',
  voice_tutorial_step3_title: '③ 撤销',
  voice_tutorial_step3_body: '说"撤销"、"撤回"、"返回"均可删除上一针。每次只撤销一针。',
  voice_tutorial_step4_title: '④ 再来 / 重复',
  voice_tutorial_step4_body: '说"再来"或"重复"会重复上一针的动作。如果当前圈有文字图解，行为由设置中的「"再来"默认行为」决定：<br><br><b>每次询问</b> — 语音反问"一针还是重复花样？"，回答"一针"只加一针，回答"花样"重复整圈图解<br><b>始终单针</b> — 总是只加一针<br><b>始终花样</b> — 直接重复当前圈的完整图解序列',
  voice_tutorial_step5_title: '⑤ 再来一圈',
  voice_tutorial_step5_body: '说"再来一圈"触发。如果当前圈有图解，语音反问"重复这圈还是新建一圈？"——回答"重复"或"一样"复制当前圈结构，回答"新建"或"空白"新建空白圈。如果当前圈没有图解，直接新建空白圈。',
  voice_tutorial_step6_title: '⑥ 跳转圈数',
  voice_tutorial_step6_body: '说"去第 X 圈"或"跳到第 X 圈"，直接跳转到指定圈数。如"去第三圈""跳到第五圈"。',
  voice_tutorial_step7_title: '⑦ 打记号扣',
  voice_tutorial_step7_body: '说"加记号"或"标记"。语音反问"什么颜色？"，回答颜色名称即可在当前针目打上记号扣。支持的颜色：红、橙、黄、绿、蓝、紫。',
  voice_tutorial_step8_title: '⑧ 语音设置说明',
  voice_tutorial_step8_body: '进入 设置 → 语音模式 可调整：<br><br><table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="color:var(--muted);font-weight:600"><td style="padding:3px 8px;border-bottom:1px solid var(--border)">设置项</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">说明</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">进入项目默认开启语音</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">打开后每次进入项目自动开启语音模式</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">语音音效</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">每针识别成功后播放短促提示音</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">语音播报回读</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">执行指令后语音确认结果（如"已撤销""已标记"）</td></tr><tr><td style="padding:3px 8px;border-bottom:1px solid var(--border)">来回交互等待时长</td><td style="padding:3px 8px;border-bottom:1px solid var(--border)">说"加记号"等需要追问的指令后，等待回复的时间（3/5/8 秒）</td></tr><tr><td style="padding:3px 8px">"再来"默认行为</td><td style="padding:3px 8px">有图解时说"再来"的处理方式</td></tr></table>',
  voice_hint_bar: '🎙 说数字 1-9 添加针法 · 说"撤销"删除上一针',
  voice_feedback_undo: '已撤销',
  voice_feedback_repeat_clarify: '一针还是重复花样？',
  voice_feedback_new_round: '已新建',
  voice_feedback_repeat_round_clarify: '重复这圈还是新建一圈？',
  voice_feedback_mark_color: '什么颜色？',
  voice_feedback_marked: '已标记',
  voice_feedback_copied: '已复制',
  voice_feedback_goto: '第{n}圈',
  voice_feedback_not_found: '没有找到',
  voice_feedback_cancelled: '已取消',
  voice_tutorial_btn: '语音指令教程',
  voice_tutorial_btn_sub: '查看所有可用指令和使用技巧',
  voice_basic_settings: '基本设置',
  voice_auto_enable: '进入项目默认开启语音',
  voice_sound_effects: '语音音效',
  voice_sound_effects_sub: '识别成功时播放提示音',
  voice_speak_feedback: '语音播报回读',
  voice_speak_feedback_sub: '执行指令后语音确认结果',
  voice_interaction: '交互行为',
  voice_wait_timeout: '来回交互等待时长',
  voice_wait_timeout_sub: '说"加记号"后等待颜色回答的时间',
  voice_repeat_default: '"再来"默认行为',
  voice_repeat_default_sub: '有图解时说"再来"的处理方式',
  voice_repeat_ask: '每次询问',
  voice_repeat_single: '始终单针',
  voice_repeat_pattern: '始终花样',
  voice_time_label: '{value} 秒',

  // ═════════════════════════════════════
  //  心流模式（Pro）
  // ═════════════════════════════════════
  flow_mode_btn: '~ 心流',
  flow_mode_toggle_label: '心流模式',
  flow_mode_toggle_desc: '锁定针法面板，仅高亮下一针并降低其余亮度',
  flow_mode_toggle_footer: '开启后底部针法面板自动聚焦当前需钩织的下一针，其余按钮变暗不可点击',
  flow_mode_enabled_toast: '心流模式已开启 · 长按可关闭',
  flow_mode_disabled_toast: '心流模式已关闭',
  flow_mode_status_current: '第 {n} 针 / 共 {total} 针',
  flow_mode_status_done: '本圈已完成 ✓',
  flow_mode_status_calibrate: '图解需要校准，点击编辑 ›',

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
  entry_import_share: '导入他人分享',
  entry_import_share_sub: '粘贴织影分享文本，快速导入完整项目',
  entry_free_mode_link: '全自由模式，不使用图解 →',

  // ═════════════════════════════════════
  //  设置页
  // ═════════════════════════════════════
  settings: '设置',
  settings_pro_title: '早期用户特权',
  settings_pro_subtitle: 'PRO 功能现阶段免费开放',
  settings_tutorial_title: '使用教程',
  settings_tutorial_subtitle: '功能介绍与使用方法',
  settings_color: '配色设置',
  settings_permissions: '系统权限',
  settings_data: '数据管理',
  settings_voice: '语音模式',
  settings_voice_sub: '指令设置与使用教程',
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
  export_pdf_app: '请使用分享功能导出图解，或在设置中导出备份',
  export_pdf_ios: 'PDF 导出请使用浏览器菜单中的「打印」功能',

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
  onboard_step1_title: '为每件作品建立项目并统计',
  onboard_step1_desc: '每个作品独立记录，支持封面图片和多个部件分区管理。归档完成的作品数据完整保留，随时查看历史记录。',
  onboard_step2_label: '已记录 24 针',
  onboard_step2_title: '精准记录每一针',
  onboard_step2_desc: '导入文字图解后自动解析具体步骤和总针数，按圈记录针法序列，点击具体针目还可记录现实中对应颜色的记号扣。',
  onboard_step3_title: '解锁你的钩织节奏',
  onboard_step3_desc: '',
  onboard_flow_title: '心流模式',
  onboard_flow_desc: '用一键点击 / 语音确认推进当前针，自动跟随图解有效帮助即时纠错。',
  onboard_voice_title: '语音进阶',
  onboard_voice_desc: '连续说出「短针三个，长针两个」自动依次记录；说「去第8圈」直接跳转；说「标记红色」添加记号扣。',
  onboard_tagline: 'PRO 功能现阶段免费开放，感谢早期用户 ✦',
  onboard_next: '下一步',
  onboard_start: '现在开始',

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

  // ═════════════════════════════════════
  //  分享图解
  // ═════════════════════════════════════
  share_pattern_title: '分享图解',
  share_copy_text: '复制文字图解',
  share_copy_full: '复制完整项目',
  share_copied: '图解已复制到剪贴板',
  share_full_copied: '项目已复制到剪贴板',
  share_copy_failed: '复制失败，请重试',
  share_pro_required: '此功能需要 Pro，敬请期待',
  share_text_footer: '用织影 App 打开可直接计数',
  import_share_title: '导入分享的项目',
  import_share_placeholder: '粘贴从织影分享的项目内容\n格式：【织影项目】...KNIT1:...',
  import_share_hint: '支持从织影 App 导出的项目分享文本',
  import_share_error: '内容格式不正确，请检查后重试',
  import_mode_title: '选择导入方式',
  import_mode_follow: '跟织模式',
  import_mode_follow_sub: '保留对方的完整针法序列，计数即上色',
  import_mode_own: '作为自己项目',
  import_mode_own_sub: '只保留图解文字，从头开始钩织',
  imported_project: '导入的项目',

  project_settings: '项目设置',
  setting_count_unit: '计数单位',
  setting_current_unit: '当前：{unit}',
  setting_switch_to: '切换为{unit}',
  setting_collapse_all: '收起所有圈',
  setting_collapse_all_sub: '收起所有针法',
  setting_notation_symbol: '国际符号',
  setting_notation_zh: '中文简写',
  setting_notation_en_us: '美式英文',
  setting_notation_en_uk: '英式英文',
  round_unit: '圈',
  row_unit: '行',
  import_pattern_desc: '粘贴文字图解或拍照识别',

  setting_filter_round: '仅显示本圈针法',
  setting_filter_round_sub: '隐藏其他圈的针法按钮',
  on: '开',
  off: '关',

  stats_page_title: '钩织统计',
  stats_detail_btn: '查看详细统计 ›',
  stats_time_title: '钩织时间',
  stats_total_days: '累计天数',
  stats_streak_label: '连续钩织',
  stats_heatmap_title: '最近 12 周',
  stats_time_dist_title: '最活跃时间段',
  stats_time_morning: '早晨',
  stats_time_afternoon: '下午',
  stats_time_evening: '晚上',
  stats_time_night: '深夜',
  stats_analysis_title: '针法分析',
  stats_top_stitches: '最常用针法 TOP 3',
  stats_current_palette: '当前项目针法占比',
  stats_cross_proj: '跨项目针法偏好',
  stats_records_title: '项目记录',
  stats_best_day: '最高效单日',
  stats_longest_round: '最长单圈',
  stats_avg_focus: '平均专注时长/次',
  stats_no_data: '暂无数据',
  pro_hint_unlock: '解锁查看完整数据',
  pro_hint_toast: 'PRO 功能，敬请期待',
  pro_feature_hint: 'PRO 功能，敬请期待',

  // ═════════════════════════════════════
  //  早期用户特权页
  // ═════════════════════════════════════
  pro_page_title: '早期用户特权',
  pro_page_desc: '感谢你在织影早期加入。以下 PRO 功能现阶段对所有用户完全免费开放。',
  pro_flow_name: '心流模式',
  pro_flow_sub: '自动跟随图解高亮下一针，一键推进并即时纠错',
  pro_voice_name: '语音进阶',
  pro_voice_sub: '连续说出针法序列自动执行，声控跳圈、添加记号扣',
  pro_stats_name: '详细统计',
  pro_stats_sub: '热力图、时段分布、针法排名、最佳记录完整呈现',
  pro_page_footnote: '正式内购上线前，尽情体验 ✦',

  // ═════════════════════════════════════
  //  使用教程页
  // ═════════════════════════════════════
  tutorial_project_title: '项目管理',
  tutorial_project_desc: '为每件钩织作品创建独立项目，支持设置封面图片和多个部件分区。\n完成后归档保留完整数据，归档项目不影响活跃项目列表。\n彻底删除的项目数据无法恢复，建议完成后归档而非删除。',

  tutorial_stitch_title: '针法记录',
  tutorial_stitch_desc: '按圈记录针法序列，底部调色板显示当前圈可用针法。\n点击针法胶囊可替换、删除或在前后插入单针。\n点击具体针目可添加彩色记号扣并附加备注，对应现实中的实体记号扣。\n底部撤销按钮可撤回最后一针。',

  tutorial_pattern_title: '图解导入',
  tutorial_pattern_desc: '支持粘贴文字图解自动解析每圈针法和总针数。\n也可拍照上传图解，通过 OCR 自动识别文字后解析。\n解析后可逐圈确认和编辑，支持循环标记（如第2-5圈重复）。\n导入方式：新建项目时选择「粘贴图解」，\n或在项目内点击底部「图解」按钮。',

  tutorial_refimage_title: '参考图与标注',
  tutorial_refimage_desc: '每个项目可上传多张参考图，钩织时随时对照。\n点击参考图可进入标注模式，用画笔在图上标记重点。\n标注数据独立保存，不影响原图。\niPad 横屏时参考图固定显示在左侧，右侧同步操作。',

  tutorial_immersive_title: '专注模式',
  tutorial_immersive_desc: '隐藏多余界面，放大针法按钮，适合不需要低头看屏幕的场景。\n入口：项目页右侧悬浮胶囊按钮。\n专注模式下点击「下一圈」自动推进，无需手动切换。\n进入和退出项目时自动记录专注时长，首页显示累计数据。',

  tutorial_highlight_title: '心流模式',
  tutorial_highlight_desc: '导入图解后开启，自动高亮当前应钩的下一针。\n底部调色板仅亮起正确针法按钮，钩错时即时发现。\n顶部显示当前圈完整针法序列，当前位置有脉冲动画指示。\n开启语音心流联动后，说「好」或「钩了」即可声控推进，\n全程不需要低头看屏幕。\n入口：项目页右侧悬浮胶囊按钮。',

  tutorial_voice_title: '语音模式',
  tutorial_voice_desc: '开启后说出针法名称自动记录，解放双手专注钩织。\n\n基础指令（免费）：\n· 「短针」「长针三个」—— 记录对应针法\n· 「撤销」—— 删除最后一针\n· 「再来一针」—— 重复上一针\n\n进阶指令（PRO）：\n· 「短针三个，长针两个，撤销」—— 连续说出自动依次执行\n· 「去第8圈」—— 直接跳转到指定圈\n· 「标记红色」—— 在当前针目添加记号扣\n· 「好」/「钩了」—— 心流联动开启时推进高亮\n\n入口：项目页底部「语音」按钮。\n设置 → 语音模式 可调整识别语言、反馈音效和交互超时。',

  tutorial_stats_title: '详细统计',
  tutorial_stats_desc: '汇总所有项目的钩织数据，完整呈现你的钩织习惯。\n\n免费可见：\n· 累计钩织天数\n· 当前连续打卡天数\n\nPRO 数据：\n· 活跃热力图（最近84天每日针数分布）\n· 时段分布（早/午/晚/深夜钩织习惯）\n· 针法排名 Top 3（跨所有项目统计）\n· 最佳单日记录\n· 最长单圈针数\n· 平均专注时长\n\n入口：设置页顶部统计入口。',

  tutorial_stitchlib_title: '全局针法库',
  tutorial_stitchlib_desc: '在设置中自定义针法的名称和颜色，修改后全局生效，\n影响所有项目的针法显示和调色板。\n也可新建自定义针法类型，设置缩写 ID、中文名称和分类。\n自定义针法会自动参与图解解析，可在文字图解中直接使用。\n入口：设置 → 针法库。',

  tutorial_data_title: '数据管理',
  tutorial_data_desc: '所有数据存储在本地设备，不上传任何服务器。\n建议定期导出备份，防止设备更换或数据丢失。\n\n· 导出备份：将全部项目导出为 JSON 文件\n· 导入备份：从 JSON 文件恢复全部数据\n· 单项目导出：在项目菜单中导出单个项目为 .knt 文件\n· 分享图解：将项目针法序列导出为文字图解，\n  或导出为 KNIT1 格式供他人导入（需对方使用织影）\n\n入口：设置 → 数据管理。',
};
