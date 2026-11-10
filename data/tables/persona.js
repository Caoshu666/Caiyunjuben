/**
 * 配置表 1/6 —— persona.js 人格表
 *
 * 10 种财运人格。condition 为受限表达式（由 ExprEvaluator 求值），
 * 变量：RISK / CHANCE / SOCIAL / EGO（各 0-4）、SUM、MAX。
 * 按 priority 从高到低匹配，第一个命中即为人格；最后一个 condition 为
 * true 作为兜底，保证任何输入都有结果。
 *
 * attrBias 是在初始属性公式之上做的微调，数值经过 tools/simulate.js 标定：
 *   - 现金加成的绝对值控制在 ±6 以内（否则「保守型开局现金就超过 S 级阈值」）；
 *   - 高胆识人格用现金起点换上限，形成「高方差」的手感差异。
 *
 * 改这张表不需要改代码，也不需要重新发版（可由远程 patch 覆盖）。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.persona = [
    {
      id: 'lucky',
      name: '天选锦鲤型',
      priority: 100,
      condition: 'EGO >= 4 && RISK >= 3',
      badge: '锦',
      color: '#E0A800',
      desc: '运气好到不像话',
      attrBias: { luck: 8, cash: 3 },
      endingId: 'END_LUCKY'
    },
    {
      id: 'gambler',
      name: '孤注投机型',
      priority: 95,
      condition: 'RISK >= 4 && EGO <= 1',
      badge: '险',
      color: '#C0392B',
      desc: '高点买入，低点加仓',
      attrBias: { guts: 12, cash: -6, luck: -5 },
      endingId: 'END_GAMBLER'
    },
    {
      id: 'hunter',
      name: '风口猎手型',
      priority: 90,
      condition: 'CHANCE >= 4 && RISK >= 2',
      badge: '风',
      color: '#2E86C1',
      desc: '看见趋势比看见钱重要',
      attrBias: { cognition: 10, guts: 5, cash: -3 },
      endingId: 'END_HUNTER'
    },
    {
      id: 'networker',
      name: '社交跃迁型',
      priority: 85,
      condition: 'SOCIAL >= 4 && RISK >= 2',
      badge: '圈',
      color: '#8E44AD',
      desc: '混圈子混出人生',
      attrBias: { social: 12, cash: -2 },
      endingId: 'END_NETWORKER'
    },
    {
      id: 'aggressive',
      name: '激进破局型',
      priority: 80,
      condition: 'RISK >= 3',
      badge: '破',
      color: '#D35400',
      desc: '机会来了就 all in',
      attrBias: { guts: 10, cash: -5 },
      endingId: 'END_AGGRESSIVE'
    },
    {
      id: 'mentor',
      name: '贵人提携型',
      priority: 75,
      condition: 'SOCIAL >= 3 && RISK <= 2',
      badge: '贵',
      color: '#16A085',
      desc: '人脉就是你最大的资产',
      attrBias: { social: 9, cash: 2 },
      endingId: 'END_MENTOR'
    },
    {
      id: 'accumulator',
      name: '勤恳积累型',
      priority: 70,
      condition: 'CHANCE >= 3 && RISK <= 1',
      badge: '勤',
      color: '#27AE60',
      desc: '相信复利，相信时间',
      attrBias: { cognition: 7, cash: 4, guts: -6 },
      endingId: 'END_ACCUMULATOR'
    },
    {
      id: 'timid',
      name: '保守龟缩型',
      priority: 65,
      condition: 'RISK <= 0 && CHANCE <= 1',
      badge: '龟',
      color: '#7F8C8D',
      desc: '宁可错过，也不做错',
      attrBias: { cash: 6, guts: -14, cognition: -6 },
      endingId: 'END_TIMID'
    },
    {
      id: 'steady',
      name: '稳健守财型',
      priority: 60,
      condition: 'RISK <= 1',
      badge: '守',
      color: '#B8860B',
      desc: '每一分钱都要花在刀刃上',
      attrBias: { cash: 5, guts: -8 },
      endingId: 'END_STEADY'
    },
    {
      id: 'average',
      name: '均衡平庸型',
      priority: 0,
      condition: 'true',
      badge: '均',
      color: '#5D6D7E',
      desc: '什么都懂一点，什么都不极致',
      attrBias: {},
      endingId: 'END_AVERAGE'
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
