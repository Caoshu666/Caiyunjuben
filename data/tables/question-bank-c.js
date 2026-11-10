/**
 * question-bank-c.js —— 题库 C（主题：创业、投资与理财心态）
 *
 * 与题库 A（data/tables/question.js）字段格式完全一致。
 * 每题带 set 标记 'C'，供「整库随机」抽取时按套隔离。
 * 24 题，4 维度 × 6 题，选项打 0/1/2 分。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionBank_C = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1_C', dim: 'RISK', set: 'C',
      stem: '如果现在有一笔可以自由支配的资金，你会？',
      options: [
        { text: '全部存起来吃利息', dim: { RISK: 0 } },
        { text: '大部分稳健，小部分激进', dim: { RISK: 1 } },
        { text: '大部分投进去搏收益', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2_C', dim: 'RISK', set: 'C',
      stem: '一个回报很高但风险也高的投资机会摆在面前。',
      options: [
        { text: '不碰，我睡不好觉', dim: { RISK: 0 } },
        { text: '拿一小部分试', dim: { RISK: 1 } },
        { text: '值得一搏', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3_C', dim: 'RISK', set: 'C',
      stem: '你会考虑辞掉稳定工作去创业吗？',
      options: [
        { text: '不会，稳定最重要', dim: { RISK: 0 } },
        { text: '会先做副业试试', dim: { RISK: 1 } },
        { text: '会，只要看准了机会', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4_C', dim: 'RISK', set: 'C',
      stem: '下面哪句话最接近你的投资观？',
      options: [
        { text: '保住本金最重要', dim: { RISK: 0 } },
        { text: '攻守兼备', dim: { RISK: 1 } },
        { text: '富贵险中求', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5_C', dim: 'RISK', set: 'C',
      stem: '市场大跌，你手里的资产缩水了，你会？',
      options: [
        { text: '赶紧卖出止损', dim: { RISK: 0 } },
        { text: '先观望，不急着动', dim: { RISK: 1 } },
        { text: '逢低加仓', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6_C', dim: 'RISK', set: 'C',
      stem: '关于「借钱投资」，你的态度是？',
      options: [
        { text: '绝对不碰', dim: { RISK: 0 } },
        { text: '极少量、可控范围内', dim: { RISK: 1 } },
        { text: '看准了就敢借', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1_C', dim: 'CHANCE', set: 'C',
      stem: '你听到某个赛道正在被资本热捧，你会？',
      options: [
        { text: '不关注，离我太远', dim: { CHANCE: 0 } },
        { text: '了解一下是什么', dim: { CHANCE: 1 } },
        { text: '研究有没有切入的机会', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2_C', dim: 'CHANCE', set: 'C',
      stem: '你一般通过什么渠道获取投资/商业信息？',
      options: [
        { text: '基本不主动看', dim: { CHANCE: 0 } },
        { text: '偶尔刷财经资讯', dim: { CHANCE: 1 } },
        { text: '多渠道持续跟踪', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3_C', dim: 'CHANCE', set: 'C',
      stem: '一个新兴行业刚起步，你会？',
      options: [
        { text: '等成熟了再说', dim: { CHANCE: 0 } },
        { text: '观察别人怎么玩', dim: { CHANCE: 1 } },
        { text: '研究如何参与', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4_C', dim: 'CHANCE', set: 'C',
      stem: '你身边有人靠新机会赚了钱，你会？',
      options: [
        { text: '羡慕一下，但不动', dim: { CHANCE: 0 } },
        { text: '打听一下怎么做的', dim: { CHANCE: 1 } },
        { text: '立刻研究自己能不能复制', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5_C', dim: 'CHANCE', set: 'C',
      stem: '你觉得自己抓机会的能力如何？',
      options: [
        { text: '经常错过', dim: { CHANCE: 0 } },
        { text: '偶尔能抓住', dim: { CHANCE: 1 } },
        { text: '总能提前布局', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6_C', dim: 'CHANCE', set: 'C',
      stem: '面对一个不确定的新机会，你的默认动作是？',
      options: [
        { text: '先等等看', dim: { CHANCE: 0 } },
        { text: '先小范围验证', dim: { CHANCE: 1 } },
        { text: '先行动起来再说', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1_C', dim: 'SOCIAL', set: 'C',
      stem: '创业或做项目需要资源，你首先会？',
      options: [
        { text: '自己慢慢攒', dim: { SOCIAL: 0 } },
        { text: '找几个熟识的人问', dim: { SOCIAL: 1 } },
        { text: '调动所有能联系的人脉', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2_C', dim: 'SOCIAL', set: 'C',
      stem: '关于「合伙做生意」，你的态度是？',
      options: [
        { text: '不太信，容易闹掰', dim: { SOCIAL: 0 } },
        { text: '可以，但要挑对人', dim: { SOCIAL: 1 } },
        { text: '愿意，好伙伴比好项目重要', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3_C', dim: 'SOCIAL', set: 'C',
      stem: '你会主动去结识比自己厉害的人吗？',
      options: [
        { text: '不会，觉得高攀', dim: { SOCIAL: 0 } },
        { text: '有机会会聊聊', dim: { SOCIAL: 1 } },
        { text: '会主动创造机会接近', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4_C', dim: 'SOCIAL', set: 'C',
      stem: '谈合作时，你更看重？',
      options: [
        { text: '条款和利益分清楚', dim: { SOCIAL: 0 } },
        { text: '既要条款也要关系', dim: { SOCIAL: 1 } },
        { text: '先看人，人对了什么都好谈', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5_C', dim: 'SOCIAL', set: 'C',
      stem: '一个关键人脉约你吃饭，但你那天很累，你会？',
      options: [
        { text: '推掉，改天再约', dim: { SOCIAL: 0 } },
        { text: '看情况，能去就去', dim: { SOCIAL: 1 } },
        { text: '一定去，机会难得', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6_C', dim: 'SOCIAL', set: 'C',
      stem: '你觉得成功多大程度上靠人脉？',
      options: [
        { text: '主要靠实力', dim: { SOCIAL: 0 } },
        { text: '实力为主，人脉为辅', dim: { SOCIAL: 1 } },
        { text: '人脉和实力同样重要', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1_C', dim: 'EGO', set: 'C',
      stem: '投资失败了，你会？',
      options: [
        { text: '觉得是市场/运气问题', dim: { EGO: 0 } },
        { text: '有外部原因，也怪自己判断', dim: { EGO: 1 } },
        { text: '主要是我判断错了', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2_C', dim: 'EGO', set: 'C',
      stem: '你对自己做投资/创业的判断力有信心吗？',
      options: [
        { text: '没什么信心', dim: { EGO: 0 } },
        { text: '一般，还要多学', dim: { EGO: 1 } },
        { text: '挺有信心的', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3_C', dim: 'EGO', set: 'C',
      stem: '有人说你「有商业头脑」，你会？',
      options: [
        { text: '哪里哪里，客气了', dim: { EGO: 0 } },
        { text: '有点开心', dim: { EGO: 1 } },
        { text: '我也这么觉得', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4_C', dim: 'EGO', set: 'C',
      stem: '你对未来财务自由的预期是？',
      options: [
        { text: '不太敢想', dim: { EGO: 0 } },
        { text: '希望有一天能实现', dim: { EGO: 1 } },
        { text: '我确信能做到', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5_C', dim: 'EGO', set: 'C',
      stem: '复盘亏损，你更常做什么？',
      options: [
        { text: '怪行情不好', dim: { EGO: 0 } },
        { text: '行情和操作各一半', dim: { EGO: 1 } },
        { text: '找自己的操作问题', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6_C', dim: 'EGO', set: 'C',
      stem: '你相信财富主要是靠自己挣来的吗？',
      options: [
        { text: '很大程度看运气', dim: { EGO: 0 } },
        { text: '一半靠努力一半靠运气', dim: { EGO: 1 } },
        { text: '主要是靠选择和努力', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
