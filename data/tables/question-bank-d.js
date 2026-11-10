/**
 * question-bank-d.js —— 题库 D（主题：城市年轻人的月光 / 攒钱 / 买房挣扎）
 *
 * 与题库 A（data/tables/question.js）字段格式完全一致。
 * 每题带 set 标记 'D'，供「整库随机」抽取时按套隔离。
 * 24 题，4 维度 × 6 题，选项打 0/1/2 分。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionBank_D = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1_D', dim: 'RISK', set: 'D',
      stem: '这个月工资还没花到月底就见底了，你会？',
      options: [
        { text: '先记账、砍掉不必要的开销', dim: { RISK: 0 } },
        { text: '照常花，下个月再说', dim: { RISK: 1 } },
        { text: '办分期或者借点钱过渡一下', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2_D', dim: 'RISK', set: 'D',
      stem: '你更认同哪种消费观？',
      options: [
        { text: '有多少花多少，不欠债', dim: { RISK: 0 } },
        { text: '偶尔用花呗/白条，按时还上', dim: { RISK: 1 } },
        { text: '先消费后还款，及时行乐', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3_D', dim: 'RISK', set: 'D',
      stem: '朋友拉你一起整租一套更贵但地段更好的房子。',
      options: [
        { text: '不划算，还是住便宜点好', dim: { RISK: 0 } },
        { text: '可以，如果确实提升生活质量', dim: { RISK: 1 } },
        { text: '贵就贵点，住得舒服最重要', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4_D', dim: 'RISK', set: 'D',
      stem: '关于「借钱消费」（比如买手机、旅游），你的态度是？',
      options: [
        { text: '从不借，买不起就先不买', dim: { RISK: 0 } },
        { text: '小额、能还上才借', dim: { RISK: 1 } },
        { text: '该花就花，早享受早值', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5_D', dim: 'RISK', set: 'D',
      stem: '手里攒了三个月的生活费，你会？',
      options: [
        { text: '继续攒，攒够六个月才安心', dim: { RISK: 0 } },
        { text: '拿一部分做点小投资', dim: { RISK: 1 } },
        { text: '钱放着会贬值，投出去博一把', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6_D', dim: 'RISK', set: 'D',
      stem: '关于买房，你最接近的想法是？',
      options: [
        { text: '先攒钱，等有底气再上车', dim: { RISK: 0 } },
        { text: '可以先看，有合适的就贷一点', dim: { RISK: 1 } },
        { text: '能上车就赶紧上，哪怕压力大', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1_D', dim: 'CHANCE', set: 'D',
      stem: '看到一个「副业月入过万」的帖子，你会？',
      options: [
        { text: '划走，多半是割韭菜', dim: { CHANCE: 0 } },
        { text: '点开看看是怎么回事', dim: { CHANCE: 1 } },
        { text: '研究一下自己能不能复制', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2_D', dim: 'CHANCE', set: 'D',
      stem: '你的信息获取习惯是？',
      options: [
        { text: '刷到啥看啥，不主动找', dim: { CHANCE: 0 } },
        { text: '会关注几个感兴趣的号', dim: { CHANCE: 1 } },
        { text: '主动搜、主动学，想学的都去查', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3_D', dim: 'CHANCE', set: 'D',
      stem: '身边的人开始做直播/短视频带货赚了钱，你会？',
      options: [
        { text: '跟我没关系，我不擅长', dim: { CHANCE: 0 } },
        { text: '了解一下，但迟迟没动', dim: { CHANCE: 1 } },
        { text: '立刻研究自己适合做什么', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4_D', dim: 'CHANCE', set: 'D',
      stem: '有个课程打折，能学一项新技能，你会？',
      options: [
        { text: '算了，买了也不会看', dim: { CHANCE: 0 } },
        { text: '先看口碑，有用的再买', dim: { CHANCE: 1 } },
        { text: '果断买，投资自己最值', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5_D', dim: 'CHANCE', set: 'D',
      stem: '你觉得自己离「搞到钱的机会」远吗？',
      options: [
        { text: '挺远的，我接触不到', dim: { CHANCE: 0 } },
        { text: '偶尔能碰到，但没抓住', dim: { CHANCE: 1 } },
        { text: '机会到处都是，就看我做不做', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6_D', dim: 'CHANCE', set: 'D',
      stem: '面对一个新机会，你担心的更多是？',
      options: [
        { text: '怕被骗、怕踩坑', dim: { CHANCE: 0 } },
        { text: '怕自己做不好', dim: { CHANCE: 1 } },
        { text: '基本不担心，先试试再说', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1_D', dim: 'SOCIAL', set: 'D',
      stem: '缺钱应急的时候，你首先会？',
      options: [
        { text: '自己硬扛，不跟人开口', dim: { SOCIAL: 0 } },
        { text: '找最亲近的人周转一下', dim: { SOCIAL: 1 } },
        { text: '能借的渠道都问一遍', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2_D', dim: 'SOCIAL', set: 'D',
      stem: '朋友约你出去玩，但你预算紧张，你会？',
      options: [
        { text: '直接说不去了', dim: { SOCIAL: 0 } },
        { text: '说明情况，选个不花钱的方式聚', dim: { SOCIAL: 1 } },
        { text: '借钱也要去，不能扫兴', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3_D', dim: 'SOCIAL', set: 'D',
      stem: '关于「合租/搭伙省钱」，你的态度是？',
      options: [
        { text: '还是自己住自在', dim: { SOCIAL: 0 } },
        { text: '熟人的话可以考虑', dim: { SOCIAL: 1 } },
        { text: '能省就省，搭伙挺好的', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4_D', dim: 'SOCIAL', set: 'D',
      stem: '遇到困难，你会主动求助吗？',
      options: [
        { text: '基本不会，开不了口', dim: { SOCIAL: 0 } },
        { text: '实在撑不住才说', dim: { SOCIAL: 1 } },
        { text: '会，及时求助不丢人', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5_D', dim: 'SOCIAL', set: 'D',
      stem: '你身边的人脉，对你搞钱帮助大吗？',
      options: [
        { text: '基本帮不上', dim: { SOCIAL: 0 } },
        { text: '偶尔能帮上一点', dim: { SOCIAL: 1 } },
        { text: '挺大的，很多机会靠他们', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6_D', dim: 'SOCIAL', set: 'D',
      stem: '你会花时间维护那些「可能有用」的关系吗？',
      options: [
        { text: '不会，太累了', dim: { SOCIAL: 0 } },
        { text: '看值不值得', dim: { SOCIAL: 1 } },
        { text: '会，多个朋友多条路', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1_D', dim: 'EGO', set: 'D',
      stem: '钱不够花，你更常觉得是？',
      options: [
        { text: '工资太低、物价太高', dim: { EGO: 0 } },
        { text: '收入一般，但我也不够省', dim: { EGO: 1 } },
        { text: '主要是我没找到更好的搞钱路子', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2_D', dim: 'EGO', set: 'D',
      stem: '你觉得自己将来能买得起房吗？',
      options: [
        { text: '难，现在这样看不到希望', dim: { EGO: 0 } },
        { text: '可能吧，看以后', dim: { EGO: 1 } },
        { text: '能，我有信心', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3_D', dim: 'EGO', set: 'D',
      stem: '你对自己「搞钱能力」的评价是？',
      options: [
        { text: '不太行', dim: { EGO: 0 } },
        { text: '一般，还在学', dim: { EGO: 1 } },
        { text: '我挺会搞钱的', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4_D', dim: 'EGO', set: 'D',
      stem: '看到同龄人过得比你好，你会？',
      options: [
        { text: '有点焦虑，但也就那样', dim: { EGO: 0 } },
        { text: '羡慕，但知道各有各的节奏', dim: { EGO: 1 } },
        { text: '变成动力，我也能做到', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5_D', dim: 'EGO', set: 'D',
      stem: '你相信「努力就能过上好日子」吗？',
      options: [
        { text: '不太信，运气和出身更重要', dim: { EGO: 0 } },
        { text: '一半一半', dim: { EGO: 1 } },
        { text: '信，方向对、够努力就行', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6_D', dim: 'EGO', set: 'D',
      stem: '你对自己未来的掌控感是？',
      options: [
        { text: '随波逐流，走一步看一步', dim: { EGO: 0 } },
        { text: '能影响一部分', dim: { EGO: 1 } },
        { text: '主要是自己决定的', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
