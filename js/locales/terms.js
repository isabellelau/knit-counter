// 编织术语层：针法名、圈/行术语、起针术语
// 独立于 UI 文案，供针法库、图解解析、导出等复用

export const STITCH_TERMS = {
  zh: {
    // 针法名称
    X: '短针',
    V: '短针加针',
    A: '短针减针',
    W: '短针加加针',
    M: '短针减减针',

    T: '中长针',
    TV: '中长针加针',
    TA: '中长针减针',
    TW: '中长针加加针',
    TM: '中长针减减针',

    F: '长针',
    FV: '长针加针',
    FA: '长针减针',
    FW: '长针加加针',
    FM: '长针减减针',

    E: '长长针',
    EV: '长长针加针',
    EA: '长长针减针',

    CH: '锁针/辫子针',
    SL: '引拔针',
    SK: '空针',

    G: '爆米花针',
    Q: '枣形针',

    // 结构术语
    round: '圈', row: '行',
    part: '部件',
    cast_on: '起针',
    magic_ring: '魔法圈',
    stitch: '针', stitches: '针',
    increase: '加针', decrease: '减针',

    // 状态文字
    active: '编辑中',
    archived: '已归档',
    completed: '已完成',
  },
  en: {
    // 针法名称
    X: 'Single Crochet', V: 'Increase', A: 'Decrease',
    T: 'Half Double Crochet', TV: 'HDC Increase', TA: 'HDC Decrease',
    F: 'Double Crochet', FV: 'DC Increase', FA: 'DC Decrease',
    E: 'Treble Crochet', EV: 'TR Increase',
    CH: 'Chain', SL: 'Slip Stitch', SK: 'Skip',
    G: 'Popcorn Stitch', Q: 'Bean Stitch',
    W: 'SC Triple Increase', TW: 'HDC Triple Increase',
    FW: 'DC Triple Increase', M: 'SC Alternate Decrease',
    TM: 'HDC Alternate Decrease', FM: 'DC Alternate Decrease',
    EA: 'TR Decrease',

    // 结构术语
    round: 'Round', row: 'Row',
    part: 'Part',
    cast_on: 'Foundation',
    magic_ring: 'Magic Ring',
    stitch: 'st', stitches: 'sts',
    increase: 'inc', decrease: 'dec',

    // 状态文字
    active: 'Editing',
    archived: 'Archived',
    completed: 'Done',
  }
};
