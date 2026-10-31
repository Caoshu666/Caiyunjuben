/**
 * 配置表 3/6 —— stage.js 阶段表
 * 人生 4 阶段，每阶段抽取 eventCount 个事件，单局共 14 次抉择。
 *
 * upkeep：每个事件的生活开销（现金支出）。
 *   这是整个数值系统的「重力」—— 没有它，玩家一路选正向选项，
 *   14 次之后现金必然顶到 100，所有局都变成 S 级。
 *   有了它，赚钱才有意义，攒钱才需要取舍。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.stage = [
    {
      id: 1,
      name: '初入社会',
      theme: '起步',
      ageRange: '22 - 26 岁',
      eventCount: 3,
      upkeep: 3,
      mainAttrs: ['cognition', 'cash'],
      intro: '你带着一身学生气和一张没几块钱的银行卡，走进了社会。'
    },
    {
      id: 2,
      name: '积累期',
      theme: '攒钱与关系',
      ageRange: '26 - 32 岁',
      eventCount: 4,
      upkeep: 4,
      mainAttrs: ['cash', 'social'],
      intro: '工资涨了，开销也涨了。你开始意识到，钱不只是赚出来的。'
    },
    {
      id: 3,
      name: '转折期',
      theme: '人生大事',
      ageRange: '32 - 40 岁',
      eventCount: 4,
      upkeep: 5,
      mainAttrs: ['guts', 'luck'],
      intro: '有些机会，一辈子只来一次。有些坑，也只有这个年纪才踩得起。'
    },
    {
      id: 4,
      name: '收尾期',
      theme: '收成与复盘',
      ageRange: '40 岁以后',
      eventCount: 3,
      upkeep: 4,
      mainAttrs: ['cash', 'cognition'],
      intro: '该有的都有了，没得到的也差不多认了。现在的问题是：接下来呢？'
    }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
