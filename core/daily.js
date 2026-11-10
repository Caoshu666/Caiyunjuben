/**
 * daily.js —— 每日财运签
 *
 * 逻辑层模块：只用标准 JS（Date / Math），不碰任何平台 API，
 * 所以能在 Node 里直接跑确定性测试。
 *
 * ★ 核心设计：今天抽什么，完全由「本地日期字符串」决定
 *
 *   种子 = hash('ws-fortune-' + 'YYYY-MM-DD')
 *
 *   这样做同时满足三件事：
 *     1) 同一天无论刷新多少次、换哪台设备（只要时区日期相同），签文完全一致
 *        —— 否则「每日一签」立刻就变成「每次一签」，玩家会认为它在骗人；
 *     2) 跨天自动换签，且不需要任何服务端、不需要定时器；
 *     3) 可测试：给定日期字符串就能断言输出，不用 mock 时间。
 *
 *   代价是「同一天内换时区」会看到不同的签。这个取舍是刻意的：
 *   宁可让跨时区的人各看各的，也不要引入服务端时间带来的网络依赖。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var SEED_PREFIX = 'ws-fortune-';

  /** FNV-1a 32 位哈希，把日期字符串压成一个稳定的种子 */
  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * 本地日期键 'YYYY-MM-DD'
   * @param {Date|string} [d] 省略则用当前时间；传字符串则原样返回（便于测试与存档）
   */
  function dateKey(d) {
    if (typeof d === 'string') return d;
    var t = d instanceof Date ? d : new Date();
    var m = t.getMonth() + 1;
    var day = t.getDate();
    return t.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /**
   * 抽当天的签
   * @param {Object} [opts]
   *   opts.dateKey  指定的日期键（存档 / 测试用）
   *   opts.date     Date 对象（与 dateKey 二选一）
   *   opts.fortune  签文配置表，省略则取 NS.Tables.fortune
   * @returns {Object} 一支签
   */
  function draw(opts) {
    opts = opts || {};
    var table = opts.fortune || (NS.Tables && NS.Tables.fortune) || {};
    var key = opts.dateKey || dateKey(opts.date);

    // 每次抽取都新建一个 rng，保证结果只由「日期 + 配置表」决定，
    // 不会因为游戏主流程的 rng 消耗了多少次而漂移。
    var rng = new NS.Rng(hashSeed(SEED_PREFIX + key));

    var levels = table.levels || [];
    var level = rng.weighted(levels, function (l) {
      return l.weight || 1;
    });
    if (!level) {
      return {
        dateKey: key,
        levelId: 'ping',
        label: '平',
        color: '#5A6E86',
        tip: '',
        indexLabel: '',
        index: 50,
        good: [],
        bad: [],
        colorName: '',
        colorHex: '#D9A520',
        direction: '',
        luckyNumber: 1
      };
    }

    // 指数从等级自带区间里取 —— 保证签文和数字永远不打架
    var range = level.indexRange || [40, 60];
    var index = range[0] + rng.int(range[1] - range[0] + 1);

    // 宜 / 忌 各两条，用 sample 保证不重复
    var good = rng.sample(table.good || [], 2);
    var bad = rng.sample(table.bad || [], 2);

    var color = rng.pick(table.colors || []) || { name: '金色', hex: '#D9A520' };

    return {
      dateKey: key,
      levelId: level.id,
      label: level.label,
      color: level.color || '#B8860B',
      tip: rng.pick(level.tips || []) || '',
      indexLabel: level.indexLabel || '',
      index: index,
      good: good,
      bad: bad,
      colorName: color.name,
      colorHex: color.hex,
      direction: rng.pick(table.directions || []) || '',
      /** 1-9 的幸运数字 */
      luckyNumber: rng.int(9) + 1
    };
  }

  NS.Daily = {
    dateKey: dateKey,
    draw: draw,
    hashSeed: hashSeed,
    SEED_PREFIX: SEED_PREFIX
  };
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
