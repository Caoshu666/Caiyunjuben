/**
 * question-bank-f.js —— 题库 F（主题：副业、知识付费与「搞钱心法」）
 *
 * 与题库 A（data/tables/question.js）字段格式完全一致。
 * 每题带 set 标记 'F'，供「整库随机」抽取时按套隔离。
 * 24 题，4 维度 × 6 题，选项打 0/1/2 分。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionBank_F = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1_F', dim: 'RISK', set: 'F',
      stem: '做副业，你更倾向哪种方式？',
      options: [
        { text: '找份稳定兼职，不冒风险', dim: { RISK: 0 } },
        { text: '试水一个方向，小成本', dim: { RISK: 1 } },
        { text: '直接全力投入一个看好的方向', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2_F', dim: 'RISK', set: 'F',
      stem: '看到一门「能赚钱」的课，价格不低，你会？',
      options: [
        { text: '不买，怕被割韭菜', dim: { RISK: 0 } },
        { text: '先了解老师、看评价', dim: { RISK: 1 } },
        { text: '买了，学点东西不亏', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3_F', dim: 'RISK', set: 'F',
      stem: '关于「all in 搞副业」，你的态度是？',
      options: [
        { text: '太冒险，还是老实上班', dim: { RISK: 0 } },
        { text: '主业先稳住，副业慢慢做', dim: { RISK: 1 } },
        { text: '有机会就该全力冲', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4_F', dim: 'RISK', set: 'F',
      stem: '你愿意为「可能的机会」投入多少？',
      options: [
        { text: '一分不投，落袋为安', dim: { RISK: 0 } },
        { text: '投一点，亏了也不伤筋动骨', dim: { RISK: 1 } },
        { text: '敢投入，舍不得孩子套不着狼', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5_F', dim: 'RISK', set: 'F',
      stem: '副业第一次尝试失败了，你会？',
      options: [
        { text: '算了，不是这块料', dim: { RISK: 0 } },
        { text: '复盘一下，再试一个', dim: { RISK: 1 } },
        { text: '越挫越勇，继续投', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6_F', dim: 'RISK', set: 'F',
      stem: '你更认同哪句「搞钱」的话？',
      options: [
        { text: '稳扎稳打，细水长流', dim: { RISK: 0 } },
        { text: '小步快跑，边做边调', dim: { RISK: 1 } },
        { text: '风口来了，all in 才不后悔', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1_F', dim: 'CHANCE', set: 'F',
      stem: '看到别人靠信息差赚钱，你的反应是？',
      options: [
        { text: '羡慕，但不知道怎么做', dim: { CHANCE: 0 } },
        { text: '会去研究别人怎么做到的', dim: { CHANCE: 1 } },
        { text: '立刻分析自己能不能也做', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2_F', dim: 'CHANCE', set: 'F',
      stem: '你获取「搞钱信息」的渠道是？',
      options: [
        { text: '基本靠刷短视频', dim: { CHANCE: 0 } },
        { text: '有几个固定的社群/博主', dim: { CHANCE: 1 } },
        { text: '多平台、多渠道，还主动挖', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3_F', dim: 'CHANCE', set: 'F',
      stem: '一个新平台刚出现，你的态度是？',
      options: [
        { text: '等它火了再说', dim: { CHANCE: 0 } },
        { text: '先注册看看', dim: { CHANCE: 1 } },
        { text: '第一时间研究怎么在上面搞钱', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4_F', dim: 'CHANCE', set: 'F',
      stem: '你会主动去学新技能来变现吗？',
      options: [
        { text: '不太主动，太累了', dim: { CHANCE: 0 } },
        { text: '感兴趣的会学', dim: { CHANCE: 1 } },
        { text: '会，持续学新东西', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5_F', dim: 'CHANCE', set: 'F',
      stem: '你觉得自己抓机会的能力如何？',
      options: [
        { text: '经常后知后觉', dim: { CHANCE: 0 } },
        { text: '偶尔能赶上', dim: { CHANCE: 1 } },
        { text: '总能提前布局', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6_F', dim: 'CHANCE', set: 'F',
      stem: '看到一个好项目，你第一时间会？',
      options: [
        { text: '先观望，等别人做出成绩', dim: { CHANCE: 0 } },
        { text: '先小规模试一下', dim: { CHANCE: 1 } },
        { text: '马上动手，抢占先机', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1_F', dim: 'SOCIAL', set: 'F',
      stem: '做副业需要资源，你首先会？',
      options: [
        { text: '自己慢慢摸索', dim: { SOCIAL: 0 } },
        { text: '找同路人交流', dim: { SOCIAL: 1 } },
        { text: '链接行业里的大佬', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2_F', dim: 'SOCIAL', set: 'F',
      stem: '你会加入付费社群吗？',
      options: [
        { text: '不会，都是割韭菜', dim: { SOCIAL: 0 } },
        { text: '看圈子和质量', dim: { SOCIAL: 1 } },
        { text: '会，圈子就是钱', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3_F', dim: 'SOCIAL', set: 'F',
      stem: '你会主动认识比自己厉害的人吗？',
      options: [
        { text: '不太敢，怕被看不起', dim: { SOCIAL: 0 } },
        { text: '有机会会请教', dim: { SOCIAL: 1 } },
        { text: '会主动链接、付费请教', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4_F', dim: 'SOCIAL', set: 'F',
      stem: '关于「抱团搞钱」，你的态度是？',
      options: [
        { text: '自己单干踏实', dim: { SOCIAL: 0 } },
        { text: '靠谱的人可以一起', dim: { SOCIAL: 1 } },
        { text: '很认同，一群人走得更远', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5_F', dim: 'SOCIAL', set: 'F',
      stem: '你在社群/圈子里活跃吗？',
      options: [
        { text: '潜水，基本不说话', dim: { SOCIAL: 0 } },
        { text: '偶尔冒泡、交流', dim: { SOCIAL: 1 } },
        { text: '很活跃，还主动组织', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6_F', dim: 'SOCIAL', set: 'F',
      stem: '你觉得「人脉」对搞钱有多重要？',
      options: [
        { text: '一般，靠本事', dim: { SOCIAL: 0 } },
        { text: '有帮助', dim: { SOCIAL: 1 } },
        { text: '极其重要，圈子决定上限', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1_F', dim: 'EGO', set: 'F',
      stem: '副业没做起来，你会觉得？',
      options: [
        { text: '大环境不好，没办法', dim: { EGO: 0 } },
        { text: '有外部原因，也有自己问题', dim: { EGO: 1 } },
        { text: '主要是我不够坚持/方法不对', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2_F', dim: 'EGO', set: 'F',
      stem: '你相信自己能靠副业赚到钱吗？',
      options: [
        { text: '不太信，我做不到', dim: { EGO: 0 } },
        { text: '也许能，但没底', dim: { EGO: 1 } },
        { text: '能，我有这个能力', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3_F', dim: 'EGO', set: 'F',
      stem: '别人说你有「商业嗅觉」，你会？',
      options: [
        { text: '客气，哪里哪里', dim: { EGO: 0 } },
        { text: '有点开心', dim: { EGO: 1 } },
        { text: '我也这么觉得', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4_F', dim: 'EGO', set: 'F',
      stem: '看到同龄人副业月入几万，你会？',
      options: [
        { text: '焦虑，但也就看看', dim: { EGO: 0 } },
        { text: '羡慕，会去了解', dim: { EGO: 1 } },
        { text: '激励到我，我也行', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5_F', dim: 'EGO', set: 'F',
      stem: '你更相信哪句？',
      options: [
        { text: '命里有时终须有', dim: { EGO: 0 } },
        { text: '努力 + 运气缺一不可', dim: { EGO: 1 } },
        { text: '我命由我不由天', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6_F', dim: 'EGO', set: 'F',
      stem: '你对自己「搞钱」这件事的掌控感？',
      options: [
        { text: '基本看天吃饭', dim: { EGO: 0 } },
        { text: '能影响一部分', dim: { EGO: 1 } },
        { text: '完全掌握在自己手里', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
