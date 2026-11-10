/**
 * question-sets.js —— 题库组定义（整库随机）
 *
 * 把 A～F 六套平行题库聚合到一起，供 TestEngine 做「每次开局随机选一套」。
 * 每套题库内部都是「4 维度 × 6 题」的完整结构，彼此数值独立、互不干扰，
 * 因此抽取逻辑不变，只是开局多一步「先选哪套库」。
 *
 * sets 数组里每一项：
 *   - key:   题库标识（A/B/C/D/E/F）
 *   - label: 主题说明（仅文档/调试用，不影响逻辑）
 *   - table: 对应 NS.Tables 下的表名
 *
 * 注意：A 套就是原有的 data/tables/question.js（表名 `question`），
 *       B~F 套是各自独立的 questionBank_* 表。这里统一引用，不改动任何已有表。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionSets = [
    { key: 'A', label: '通用人生抉择',        table: 'question' },
    { key: 'B', label: '日常职场与消费决策',  table: 'questionBank_B' },
    { key: 'C', label: '创业、投资与理财心态', table: 'questionBank_C' },
    { key: 'D', label: '月光 / 攒钱 / 买房',  table: 'questionBank_D' },
    { key: 'E', label: '家庭责任与财务',      table: 'questionBank_E' },
    { key: 'F', label: '副业与搞钱心法',      table: 'questionBank_F' }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
