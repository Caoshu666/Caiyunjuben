/**
 * 配置表 6/6 —— text.js 文案表
 * 所有 UI 文案集中在此，便于统一修改与后续多语言扩展。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.text = {
    title: '我的财运剧本',
    slogan: '先测人格，再过一局人生',

    btnStart: '开始写我的剧本',
    btnContinue: '继续上次的人生',
    btnNext: '继续',
    btnConfirm: '开始人生',
    btnReplay: '再玩一次',
    btnHome: '回首页',
    btnSaveImage: '保存结果卡',
    btnShare: '分享给朋友',
    btnAgree: '同意并继续',
    btnReject: '拒绝',
    btnWatchAd: '看完广告，重来一次',
    btnSkipAd: '算了，就这样吧',
    btnBack: '返回',
    btnQuizBack: '上一题',
    btnStageBack: '上一件事',
    btnChangeChoice: '换一个选择',
    btnUseIndex: '看看我的财运指数',

    quizTitle: '财运人格测试',
    quizHint: '凭直觉选，别想太久',
    quizProgress: '第 {n} / {total} 题',

    buildTitle: '你的财运人格',
    buildHint: '这是你的初始剧本',
    buildEdit: '答错了？回去改一下答案',

    /* ---- 图鉴 ---- */
    codexTitle: '我的图鉴',
    codexTabPersona: '人格图鉴',
    codexTabEnding: '结局图鉴',
    codexLocked: '未解锁',
    codexLockedName: '？？？',
    codexLockedDesc: '继续玩就能解锁',
    codexEndingLockedTitle: '尚未抵达',
    codexEndingLockedBody: '这个结局还没被你写出来。',
    codexPersonaHint: '初始剧本属性',
    codexEndingHint: '按人格分组，每人格有 S / A / B / C 四种结局',
    codexHiddenSection: '隐藏结局',
    codexHiddenHint: '满足特定条件才会出现，品质固定 S 级',
    codexProgress: '{n} / {total}',
    codexTip: '解锁进度是永久保存的，换一局人生也不会丢',
    codexFocusClose: '关闭',

    /* ---- 每日财运签 ---- */
    dailyTitle: '今日财运签',
    dailyCaption: '每天零点换一支',
    dailyIndex: '今日财运指数',
    dailyGood: '宜',
    dailyBad: '忌',
    dailyLucky: '幸运',
    dailyColor: '色',
    dailyNumber: '数',
    dailyDirection: '方位',
    dailyDisclaimer: '娱乐向内容，不构成任何投资建议',

    /* ---- 首页 ---- */
    homeStartSub: '8 道题，测出你的财运人格',
    homePlayCount: '你已经写过 {n} 个剧本',
    homeCodexEntry: '图鉴',

    /* ---- 财运指数 ---- */
    indexLabel: '财运指数',
    indexShort: '财运',

    /* ---- 新解锁 ---- */
    unlockPersona: '解锁新人格 · {name}',
    unlockEnding: '解锁新结局 · {title}',
    unlockEndingHidden: '解锁隐藏结局 · {title}',

    stageTitle: '{name}',
    stageAge: '{age}',
    stageProgress: '第 {n} / {total} 件事',
    /** 从下一件事退回来时，把上次的选择标出来，免得玩家以为答案丢了 */
    stagePickedHint: '这是你上一次的选择，换一个直接点就行',
    stageBackFirst: '已经是第一件事了',

    summaryTitle: '这一阶段结束了',
    summaryRating: '阶段评级：{label}',
    summaryBack: '上一件事选错了？回去改一下',

    endingTitle: '你的财富剧本结局',
    resultTitle: '我的财运剧本',

    privacyTitle: '隐私与用户协议',
    privacyBody:
      '本游戏为娱乐向的文字模拟内容，所有财运结果均为随机生成的游戏剧情，' +
      '不构成任何投资建议。\n\n' +
      '为了让游戏正常运行，我们会在你的设备本地保存游戏进度（人格、属性、图鉴收集情况）。' +
      '这些数据不会上传到任何服务器，也不会用于任何商业用途。\n\n' +
      '点击「同意并继续」即表示你已阅读并同意上述说明。',

    reviveTitle: '人生没有重来',
    reviveBody: '但剧本可以。\n看完一段广告，回到第 4 阶段重新选择一次。',

    saveOk: '结果卡已保存',

    /*
     * 结局等级的「一句话说明」。
     * 光给一个字母太冷，玩家不知道自己这一局到底算什么水准；
     * 等级 + 一句话，读起来才像一份报告。
     * 键名规则固定为 grade + 等级字母，界面用 t('grade' + quality) 拼出来，
     * 以后要加等级（比如 SS）只要在这里补一行，界面不用改。
     */
    gradeS: '天时地利人和',
    gradeA: '稳健扎实',
    gradeB: '平稳度日',
    gradeC: '遗憾剧本',
    hiddenTag: '隐藏结局'
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
