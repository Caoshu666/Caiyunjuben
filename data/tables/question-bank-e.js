/**
 * question-bank-e.js —— 题库 E（主题：家庭、婚姻、赡养等责任与财务）
 *
 * 与题库 A（data/tables/question.js）字段格式完全一致。
 * 每题带 set 标记 'E'，供「整库随机」抽取时按套隔离。
 * 24 题，4 维度 × 6 题，选项打 0/1/2 分。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionBank_E = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1_E', dim: 'RISK', set: 'E',
      stem: '婚后（或打算成家后），你的钱会怎么管？',
      options: [
        { text: '各自管各自的，账分开', dim: { RISK: 0 } },
        { text: '共同账户，大额一起商量', dim: { RISK: 1 } },
        { text: '交给一个人全权打理', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2_E', dim: 'RISK', set: 'E',
      stem: '父母提出帮你凑首付，你会？',
      options: [
        { text: '不要，自己慢慢攒', dim: { RISK: 0 } },
        { text: '接受一部分，记着还', dim: { RISK: 1 } },
        { text: '欣然接受，早买房早安心', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3_E', dim: 'RISK', set: 'E',
      stem: '家人希望你把积蓄投进一个「亲戚的项目」。',
      options: [
        { text: '婉拒，钱的事不掺和亲戚', dim: { RISK: 0 } },
        { text: '投一点意思一下', dim: { RISK: 1 } },
        { text: '支持，亲情值得信任', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4_E', dim: 'RISK', set: 'E',
      stem: '关于家庭抗风险能力，你最看重？',
      options: [
        { text: '一定要有一笔应急备用金', dim: { RISK: 0 } },
        { text: '备用金 + 一些理财', dim: { RISK: 1 } },
        { text: '靠投资回报撑起家庭开销', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5_E', dim: 'RISK', set: 'E',
      stem: '为家庭，你愿意承担多大的财务风险？',
      options: [
        { text: '尽量零风险，稳妥为主', dim: { RISK: 0 } },
        { text: '可控范围内可以冒点险', dim: { RISK: 1 } },
        { text: '愿意博一把，为了家人更好', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6_E', dim: 'RISK', set: 'E',
      stem: '给父母买保险这件事，你的态度是？',
      options: [
        { text: '没必要，用不上', dim: { RISK: 0 } },
        { text: '会了解一下，合适的再买', dim: { RISK: 1 } },
        { text: '必须买，越早越好', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1_E', dim: 'CHANCE', set: 'E',
      stem: '看到别人靠「学区房/早教」之类的信息差赚钱，你会？',
      options: [
        { text: '不关心，离我太远', dim: { CHANCE: 0 } },
        { text: '了解一下', dim: { CHANCE: 1 } },
        { text: '研究自己能不能用上', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2_E', dim: 'CHANCE', set: 'E',
      stem: '你关注政策（如房贷、育儿、养老）吗？',
      options: [
        { text: '基本不看', dim: { CHANCE: 0 } },
        { text: '偶尔刷到会看看', dim: { CHANCE: 1 } },
        { text: '会主动研究，关系到钱袋子', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3_E', dim: 'CHANCE', set: 'E',
      stem: '有个机会能提升家庭收入，但要你投入大量时间。',
      options: [
        { text: '算了，家庭要紧', dim: { CHANCE: 0 } },
        { text: '看看能不能兼顾', dim: { CHANCE: 1 } },
        { text: '抓住，机会难得', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4_E', dim: 'CHANCE', set: 'E',
      stem: '你为家庭做财务规划吗？',
      options: [
        { text: '没规划，过一天算一天', dim: { CHANCE: 0 } },
        { text: '大概有个数', dim: { CHANCE: 1 } },
        { text: '有明确目标和计划', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5_E', dim: 'CHANCE', set: 'E',
      stem: '关于「养老/教育基金」，你会？',
      options: [
        { text: '还没想过那么远', dim: { CHANCE: 0 } },
        { text: '偶尔想想，没行动', dim: { CHANCE: 1 } },
        { text: '已经开始规划存了', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6_E', dim: 'CHANCE', set: 'E',
      stem: '面对家庭相关的机会，你更倾向？',
      options: [
        { text: '保守，怕影响家庭稳定', dim: { CHANCE: 0 } },
        { text: '权衡后谨慎尝试', dim: { CHANCE: 1 } },
        { text: '该出手时就出手', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1_E', dim: 'SOCIAL', set: 'E',
      stem: '家庭有经济困难时，你会？',
      options: [
        { text: '自己扛，尽量不麻烦别人', dim: { SOCIAL: 0 } },
        { text: '找近亲一起想办法', dim: { SOCIAL: 1 } },
        { text: '发动所有人脉帮忙', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2_E', dim: 'SOCIAL', set: 'E',
      stem: '亲戚朋友之间的金钱往来，你的原则是？',
      options: [
        { text: '尽量不借不欠', dim: { SOCIAL: 0 } },
        { text: '救急不救穷，分情况', dim: { SOCIAL: 1 } },
        { text: '亲人之间就该互相帮衬', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3_E', dim: 'SOCIAL', set: 'E',
      stem: '你重视「家族/大家庭」的资源吗？',
      options: [
        { text: '不太看重，各过各的', dim: { SOCIAL: 0 } },
        { text: '关键时刻会想到', dim: { SOCIAL: 1 } },
        { text: '很重要，是重要依靠', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4_E', dim: 'SOCIAL', set: 'E',
      stem: '夫妻/伴侣之间谈钱，你会？',
      options: [
        { text: '能避就避，容易吵架', dim: { SOCIAL: 0 } },
        { text: '有必要才谈', dim: { SOCIAL: 1 } },
        { text: '主动谈，财务透明才安心', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5_E', dim: 'SOCIAL', set: 'E',
      stem: '家里有大事（买房、大病），你会？',
      options: [
        { text: '一个人决定，自己扛', dim: { SOCIAL: 0 } },
        { text: '跟最亲的人商量', dim: { SOCIAL: 1 } },
        { text: '全家一起商量，集思广益', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6_E', dim: 'SOCIAL', set: 'E',
      stem: '你觉得家庭幸福和经济条件关系大吗？',
      options: [
        { text: '不大，感情更重要', dim: { SOCIAL: 0 } },
        { text: '有影响，但感情是基础', dim: { SOCIAL: 1 } },
        { text: '很大，贫贱夫妻百事哀', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1_E', dim: 'EGO', set: 'E',
      stem: '家庭经济压力大，你会觉得？',
      options: [
        { text: '都怪环境不好', dim: { EGO: 0 } },
        { text: '有环境原因，也有我的问题', dim: { EGO: 1 } },
        { text: '主要是我不够努力/不会规划', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2_E', dim: 'EGO', set: 'E',
      stem: '你相信自己能扛起家庭的经济责任吗？',
      options: [
        { text: '挺吃力的', dim: { EGO: 0 } },
        { text: '勉强可以', dim: { EGO: 1 } },
        { text: '完全能，我有信心', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3_E', dim: 'EGO', set: 'E',
      stem: '家人依赖你，你的感受是？',
      options: [
        { text: '压力很大，喘不过气', dim: { EGO: 0 } },
        { text: '有压力，也有动力', dim: { EGO: 1 } },
        { text: '让我更有干劲', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4_E', dim: 'EGO', set: 'E',
      stem: '你为家庭做的付出，觉得值得吗？',
      options: [
        { text: '说不上值不值', dim: { EGO: 0 } },
        { text: '值，但有牺牲', dim: { EGO: 1 } },
        { text: '很值，心甘情愿', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5_E', dim: 'EGO', set: 'E',
      stem: '遇到困难，你会先？',
      options: [
        { text: '怪运气、怪大环境', dim: { EGO: 0 } },
        { text: '找找外部也找找自己', dim: { EGO: 1 } },
        { text: '先想办法解决，从自己做起', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6_E', dim: 'EGO', set: 'E',
      stem: '你相信通过自己努力能改变家庭处境吗？',
      options: [
        { text: '很难，命里注定', dim: { EGO: 0 } },
        { text: '也许可以', dim: { EGO: 1 } },
        { text: '能，我有这个能力', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
