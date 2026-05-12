// UI strings layer — all interface text
// Stitch/weaving terms live in terms.js; do not redefine them here
// Dynamic parameters use {param} placeholders

export default {
  // ═════════════════════════════════════
  //  Common actions
  // ═════════════════════════════════════
  confirm: 'Confirm',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  back: 'Back',
  done: 'Done',
  got_it: 'Got it',
  ok: 'OK',
  select_all: 'Select all',
  clear_all: 'Clear',
  undo: 'Undo',
  restored: 'Restored',
  more_actions: 'More',
  loading: 'Loading…',
  app_name: 'Knit',
  unnamed: 'Untitled',

  // ═════════════════════════════════════
  //  Navigation
  // ═════════════════════════════════════
  tab_projects: 'Projects',
  tab_settings: 'Settings',
  nav_back: 'Back',
  nav_settings: 'Settings',

  // ═════════════════════════════════════
  //  Home
  // ═════════════════════════════════════
  home_empty_moti: 'Every stitch counts.',
  home_today_label: 'Today',
  home_total_stitches: '{count} sts',
  home_total_projects: '{count} projects',
  home_streak_days: '{count} days',
  home_empty: 'No projects yet. Tap below to create your first one 🌸',
  home_archived_section: '📦 Archived',
  home_new_project_btn: '+ New project',

  // ═════════════════════════════════════
  //  Project actions
  // ═════════════════════════════════════
  new_project: 'New project',
  rename_project: 'Rename',
  project_name_placeholder: 'Project name, e.g. Pink Beanie',
  delete_project: 'Delete project',
  delete_project_confirm: 'Delete this project? This cannot be undone.',
  archive: 'Archive',
  unarchive: 'Unarchive',
  archive_confirm: 'Archive "{name}"? It will still appear below and can be unarchived anytime.',
  archived_title: '"{name}" archived',
  set_cover: 'Set cover',
  remove_cover: 'Remove cover',
  default_part_title: 'Main',
  toggle_row_terms: 'Switch row/round',

  // ═════════════════════════════════════
  //  Part actions
  // ═════════════════════════════════════
  part_default_name: 'Part {n}',
  add_part: 'New part',
  delete_part: 'Delete part',
  edit_part_name: 'Rename',
  finish_edit_name: 'Done editing',
  delete_part_confirm: 'Delete this part and all its rounds? This cannot be undone.',

  // ═════════════════════════════════════
  //  Round / row actions
  // ═════════════════════════════════════
  note: 'Note',
  cast_on: 'Foundation',
  round_label: '{unit} {n}',
  editing_badge: 'Editing',
  edit_instruction: 'Edit pattern',
  set_as_current: 'Set as current {unit}',
  delete_round: 'Delete this {unit}',
  delete_round_confirm: 'Delete this {unit}?',
  deleted_round: '{unit} deleted',
  add_round_btn: '+ New {unit}',
  empty_round_hint: 'No stitches yet — tap a stitch button below to start recording',
  empty_instruction_hint: 'No pattern yet. Tap import or start recording.',
  round_need_calibration: 'Pattern needs calibration · tap 🪡 to edit',
  highlight_need_calibration: 'Calibrate the pattern first to enable highlight mode',
  last_round_immersive_hint: 'This is the last round. Exit immersive mode to add a new one.',
  round_count_label: '{total} sts',
  instruction_placeholder: 'e.g. R4: 10(X,V,X)',
  instruction_calibrated: 'Pattern calibrated ✓',
  expected_count_hint: 'Pattern defines {parsed} sts. Highlight sequence follows the pattern — edit the pattern text directly if needed.',

  // ═════════════════════════════════════
  //  Stitch actions
  // ═════════════════════════════════════
  stitch_n_of_total: 'Stitch {n} of {total}',
  stitch_detail_title: 'Stitch {idx}',
  change_to: 'Change to',
  insert_stitch: 'Insert stitch',
  insert_before: 'Insert before',
  insert_before_sub: 'Before stitch {idx}',
  insert_after: 'Insert after',
  insert_after_sub: 'After stitch {idx}',
  delete_stitch: 'Delete this stitch',
  select_stitch_to_insert: 'Choose a stitch to insert',
  category_basic: 'Basic stitches',
  category_increase: 'Increases',
  category_decrease: 'Decreases',
  category_special: 'Special stitches',
  cat_basic_short: 'Basic',
  cat_increase_short: 'Inc',
  cat_decrease_short: 'Dec',
  cat_special_short: 'Special',
  choose_stitches: 'Choose your stitches',
  customize_hint: 'Tap ✎ to rename or recolor',
  customize_btn: '✎ Customize',
  add_remove_stitches: '+/-',
  add_remove_stitches_title: 'Add or remove stitches',
  new_stitch: '+ New stitch',
  stitch_id_label: 'Abbreviation (e.g. DC3L)',
  stitch_id_placeholder: 'e.g. DC3L',
  stitch_name_label: 'Name',
  stitch_name_placeholder: 'e.g. Triple Crochet',
  name_field: 'Name',
  color_field: 'Color',
  category_field: 'Category',
  reset_default: 'Reset',
  delete_custom_stitch: '🗑 Delete this stitch',
  back_btn: '← Back',
  save_btn: '✓ Save',
  create_btn: '✓ Create',
  start_knitting: 'Start knitting',
  update_config: 'Update',
  stitch_id_required: 'Please enter an abbreviation',
  stitch_id_conflict: 'This ID conflicts with a built-in stitch',
  stitch_id_exists: 'This ID is already in use',
  delete_custom_stitch_confirm: 'Delete custom stitch "{name}"?',

  // ═════════════════════════════════════
  //  Pattern import
  // ═════════════════════════════════════
  import_pattern: '📥 Import pattern',
  pattern_placeholder: 'Paste your pattern here, or upload an image to scan…\ne.g.\nR1: 6X\nR2: 6V\nR3: [1X, 1V]*6',
  ocr_button: '📷 Scan image',
  parse_preview: '🔍 Preview',
  pattern_empty_error: 'Please enter a pattern',
  pattern_parse_failed: 'Could not parse anything — check the format and try again',
  parse_confirm_title: '✅ Parsed ({rounds} {unit} · {texts} notes)',
  text_card_badge: 'Note',
  detected_stitches: 'Stitches found: ',
  import_to_empty_hint: 'Will be added to the current empty part',
  confirm_import_start: 'Confirm & start',
  overwrite_part: 'Replace current part',
  overwrite_warning: 'Existing progress will be overwritten',
  import_as_new_part: 'Import as new part',
  import_new_part_hint: 'Keep current progress, create a new section',
  back_to_edit: '← Back',
  new_part_label: 'Part ',
  pattern_synced: 'Pattern synced to ',

  // ═════════════════════════════════════
  //  OCR
  // ═════════════════════════════════════
  ocr_initializing: '⏳ Starting recognition engine…',
  ocr_loading_engine: 'Loading recognition engine…',
  ocr_in_progress: '⏳ Scanning…',
  ocr_in_progress_zero: '⏳ Scanning… 0%',
  ocr_complete: '✅ Scan complete — review the text, then tap Preview',
  ocr_failed: '❌ Scan failed — please type the pattern manually',
  tesseract_load_failed: 'Failed to load Tesseract',
  tesseract_script_failed: 'Failed to load Tesseract script',

  // ═════════════════════════════════════
  //  Voice mode
  // ═════════════════════════════════════
  voice_btn: '🎙 Voice',
  voice_btn_on: '🎙 Listening',
  voice_btn_starting: '🎙 Starting…',
  voice_mic_denied: 'Microphone access was denied',
  voice_not_supported: 'Voice recognition is not supported in this browser',
  voice_mic_denied_settings: 'Microphone access denied — please allow it in your browser settings',
  voice_start_failed: 'Voice failed to start — please try again',
  voice_tutorial_title: '🎙 Voice mode guide',
  voice_tutorial_warning: '💡 For quick stitch counting we recommend manual mode. Browser-based voice recognition has inherent latency and works best at a relaxed pace.',
  voice_tutorial_step1_title: '① Turn on voice mode',
  voice_tutorial_step1_body: 'Tap the 🎙 voice button at the bottom. It turns red when listening. The first time, you\'ll be prompted to allow the microphone.',
  voice_tutorial_step2_title: '② Say a number to add a stitch',
  voice_tutorial_step2_body: 'Say "one" through "nine" — each maps to a stitch button (left to right). When voice mode is on, the buttons show their number.',
  voice_tutorial_step3_title: '③ Say "undo" to remove the last stitch',
  voice_tutorial_step3_body: 'Saying "undo", "delete", or "remove" will all trigger an undo.',
  voice_tutorial_step4_title: '④ Sound feedback (recommended)',
  voice_tutorial_step4_body: 'Enable voice sound effects in Settings to hear a short chime each time a stitch is added.',
  voice_hint_bar: '🎙 Say a number (1–9) to add a stitch · say "undo" to remove the last one',

  // ═════════════════════════════════════
  //  Smart highlight
  // ═════════════════════════════════════
  highlight_btn: '✦ Highlight',
  highlight_toggle_label: 'Smart stitch highlight',
  highlight_toggle_desc: 'Highlight only the next stitch, dimming the rest',
  highlight_toggle_footer: 'When on, the stitch palette automatically focuses the next stitch in the pattern.',
  highlight_enabled_toast: 'Smart highlight on · tap and hold to turn off',
  highlight_disabled_toast: 'Smart highlight off',
  highlight_status_current: 'Stitch {n} of {total}',
  highlight_status_done: 'Round complete ✓',
  highlight_status_calibrate: 'Pattern needs calibration — tap to edit ›',

  // ═════════════════════════════════════
  //  Immersive mode
  // ═════════════════════════════════════
  immersive_enter: '⛶ Focus',
  immersive_exit: '⛶ Exit focus',
  immersive_exit_short: '⊡ Exit',
  immersive_undo: '↩ Undo',
  immersive_next_round: 'Next round ›',
  immersive_edit_blocked: 'Exit focus mode to edit the pattern',

  // ═════════════════════════════════════
  //  Entry choice sheet
  // ═════════════════════════════════════
  entry_choice_title: 'How would you like to start?',
  entry_paste_auto: 'Paste a pattern (auto)',
  entry_paste_auto_sub: 'Automatically detect stitches and get started quickly',
  entry_manual: 'Manually (pick stitches)',
  entry_manual_sub: 'Choose which stitches you need',
  entry_skip: 'Skip (use all stitches)',

  // ═════════════════════════════════════
  //  Settings
  // ═════════════════════════════════════
  settings: 'Settings',
  settings_color: 'Appearance',
  settings_permissions: 'Permissions',
  settings_data: 'Data',
  settings_advanced: 'Advanced',
  settings_about: 'About',
  settings_language: 'Language / 语言',
  settings_notation: 'Stitch notation',
  settings_notation_desc: 'Independent of UI language; affects stitch name display only',
  settings_ui_theme: 'UI theme',
  settings_ui_theme_desc: 'Change the overall look of the app',
  settings_stitch_theme: 'Stitch colors',
  settings_stitch_theme_desc: 'Changes stitch button colors without affecting the rest of the UI',
  settings_stitch_theme_footer: 'Tap ✎ on any stitch button inside a project to customize it',
  theme_morandi: 'Morandi',
  theme_morandi_sub: 'Warm light',
  theme_night: 'Night',
  theme_night_sub: 'Dark & moody',
  theme_system: 'System',
  theme_system_sub: 'Follows your device',
  stitch_theme_warm: 'Warm',
  stitch_theme_warm_sub: 'Morandi warm tones',
  stitch_theme_dark: 'Shadow',
  stitch_theme_dark_sub: 'Cool night tones',
  stitch_theme_float: 'Float',
  stitch_theme_float_sub: 'Soft pastels',
  settings_stitch_assist: 'Stitch assistant',
  settings_pro_badge: 'PRO',
  settings_permissions_placeholder: 'Microphone, notifications, and other permissions will be configurable here.',
  settings_stats: 'Stats',
  settings_n_projects: '{n} projects',
  settings_stats_text: '{projects} projects · {stitches} stitches total',
  settings_actions: 'Actions',
  settings_export: '📤 Export backup',
  settings_import: '📥 Import backup',
  settings_clear_all: '🗑 Clear all data',
  settings_clear_confirm: 'Delete all data? This cannot be undone.',
  settings_cleared: 'All data cleared',
  settings_install_section: 'Install',
  settings_install_btn: '📲 Add to Home Screen',

  // ═════════════════════════════════════
  //  Data import / export
  // ═════════════════════════════════════
  import_file_error: 'Invalid file format',
  import_missing_projects: 'Missing projects array',
  import_item_missing_fields: 'Project {n} is missing required fields',
  import_confirm: 'Import backup?\n{count} projects found\nYour current {current} projects will be replaced',
  import_success: '✅ Data restored',
  import_failed: '❌ Import failed: ',
  import_read_failed: '❌ Could not read the file',
  storage_quota: 'Storage is full — try removing some cover images',
  storage_usage: '{used} MB / {quota} MB used · consider exporting a backup and cleaning up',
  export_filename: 'Knit_backup_{date}.json',

  // ═════════════════════════════════════
  //  Cover image
  // ═════════════════════════════════════
  cover_save_failed_quota: 'Storage full — cover not saved. Try exporting a backup and cleaning up.',
  cover_save_failed: 'Could not save cover — please try again',
  cover_updated: 'Cover updated',
  cover_process_failed: 'Could not process the image — please try again',
  cover_removed: 'Cover removed',

  // ═════════════════════════════════════
  //  Archive
  // ═════════════════════════════════════
  archive_tip_title: 'Quick tip',
  archive_tip_tutorial: 'Learn more ›',
  archive_pwa_hint: 'Add this page to your Home Screen to open it like an app — faster and distraction-free.',
  archive_no_more_hint: 'Don\'t show this again',
  archive_backup_title: 'Save a backup',
  archive_backup_desc: 'If you ever switch phones or want extra peace of mind, save a backup file. If you only use one device, feel free to skip.',
  archive_download_btn: 'Download backup for "{name}"',
  archive_where_backup: 'Where to find your backup',
  archive_ios_path: 'iPhone: Files app → On My iPhone → Downloads',
  archive_android_path: 'Android: Files app → Downloads',
  archive_backup_tip: 'Tip: send the file to a messaging app you use — easy to retrieve later if you switch devices.',

  // ═════════════════════════════════════
  //  PWA install tutorial
  // ═════════════════════════════════════
  pwa_tutorial_title: 'How to install as an app',
  pwa_ios_title: 'iPhone & iPad (Safari)',
  pwa_ios_step1: '1. Tap the Share button in the Safari toolbar (the square with an arrow pointing up).',
  pwa_ios_step2: '2. Scroll down and tap "Add to Home Screen."',
  pwa_ios_step3: '3. Tap "Add" in the top right corner.',
  pwa_android_title: 'Android (Chrome)',
  pwa_android_step1: '1. Tap the three-dot menu in the top right corner.',
  pwa_android_step2: '2. Tap "Add to Home screen" or "Install app."',
  pwa_android_step3: '3. Follow the on-screen prompt to confirm.',
  pwa_why_title: 'Why install?',
  pwa_why_offline: 'Works offline — open and use the app even without a connection.',
  pwa_why_clean: 'Distraction-free — no browser bars, just your projects.',
  pwa_why_fast: 'Quick launch — tap the icon on your Home Screen, no need to dig through tabs.',

  // ═════════════════════════════════════
  //  Onboarding
  // ═════════════════════════════════════
  onboard_step1_title: 'A home for every project',
  onboard_step1_desc: 'Scarves, sweaters, socks… give each piece its own space, with cover photos and separate sections for different parts.',
  onboard_step2_label: '24 stitches recorded',
  onboard_step2_title: 'Track every stitch',
  onboard_step2_desc: 'Record stitch sequences round by round. Counts are automatic. Import written patterns or scan them with OCR.',
  onboard_step3_title: 'Start your first project',
  onboard_step3_desc: 'Everything is ready. Let\'s get knitting.',
  onboard_next: 'Next',
  onboard_start: 'Let\'s go',

  // ═════════════════════════════════════
  //  Progress / stats
  // ═════════════════════════════════════
  progress_over: '{done} / {expected} sts ({diff} over)',
  progress_normal: '{done} / {expected} sts',
  progress_no_expected: '{done} sts done',
  header_stats: '{parts} parts · {rounds} {unit} · {stitches} sts',
  filter_by_round: 'Only this {unit}',

  // ═════════════════════════════════════
  //  Service Worker
  // ═════════════════════════════════════
  sw_update_ready: 'A new version is ready — refresh to update',
  sw_update_found: '✨ New version available',
  sw_update_refresh: 'Refresh now',

  // ═════════════════════════════════════
  //  Dialog
  // ═════════════════════════════════════
  dialog_confirm_title: 'Confirm',
};
