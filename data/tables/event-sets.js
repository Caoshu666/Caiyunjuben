/**
 * 配置表 —— event-sets.js 事件库组定义
 *
 * 与 question-sets.js 同构：把多套「事件库」聚合起来，供引擎每次开局随机选一套。
 * A 套复用现有 NS.Tables.event（已标定，不动），B~E 为新增平行事件库。
 *
 * 字段说明：
 *   key   库标识（用于界面展示与日志，如 A/B/C/D/E）
 *   table NS.Tables 上的表名
 *
 * 注意：每套事件库内部的连锁事件（chain.next）必须指向本库内的 weight=0 隐藏事件，
 *       否则 EventDraw._findById 找不到会丢事件。各事件库已各自保证闭环。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.eventSets = [
    { key: 'A', table: 'event' },
    { key: 'B', table: 'eventBank_B' },
    { key: 'C', table: 'eventBank_C' },
    { key: 'D', table: 'eventBank_D' },
    { key: 'E', table: 'eventBank_E' }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
