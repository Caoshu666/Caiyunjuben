/**
 * persona-resolver.js —— 人格解析
 *
 * 输入：4 维测试向量 (RISK, CHANCE, SOCIAL, EGO)，每维 0-4 分
 * 输出：10 种财运人格之一
 *
 * 实现方式：人格表里每个人格带一个 condition 表达式 + priority，
 * 按 priority 从高到低匹配，第一个命中的即为人格；最后一个人格
 * （均衡平庸型）condition 为 true，作为兜底，保证永远有结果。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  /**
   * @param {Object} vec   {RISK, CHANCE, SOCIAL, EGO} 各 0-4
   * @param {Array}  personas 人格表
   * @returns {Object} 命中的第一个人格
   */
  function resolve(vec, personas) {
    if (!personas || !personas.length) throw new Error('[PersonaResolver] 人格表为空');

    var vars = {
      RISK: clampDim(vec.RISK),
      CHANCE: clampDim(vec.CHANCE),
      SOCIAL: clampDim(vec.SOCIAL),
      EGO: clampDim(vec.EGO)
    };
    vars.SUM = vars.RISK + vars.CHANCE + vars.SOCIAL + vars.EGO;
    vars.MAX = Math.max(vars.RISK, vars.CHANCE, vars.SOCIAL, vars.EGO);

    // 按 priority 降序（priority 大者优先匹配）
    var sorted = personas.slice().sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });

    for (var i = 0; i < sorted.length; i++) {
      var p = sorted[i];
      if (NS.ExprEvaluator.test(p.condition, vars)) return p;
    }
    return sorted[sorted.length - 1];
  }

  function clampDim(n) {
    n = Number(n) || 0;
    return Math.max(0, Math.min(4, Math.round(n)));
  }

  /**
   * 根据人格生成初始属性
   *
   * 公式常量是配合 tools/simulate.js 标定过的（见 README「数值平衡」一节）：
   *   - 现金起点收窄到 28-68，避免「保守型开局现金就超过 S 级阈值」这种崩坏；
   *   - 激进型现金起点低，但胆识起点高，用高方差换高上限。
   */
  function initialAttrs(vec, persona) {
    var RISK = clampDim(vec.RISK);
    var CHANCE = clampDim(vec.CHANCE);
    var SOCIAL = clampDim(vec.SOCIAL);
    var EGO = clampDim(vec.EGO);

    var base = {
      cash: 62 - RISK * 7,        // 62 / 55 / 48 / 41 / 34
      social: 30 + SOCIAL * 10,   // 30 - 70
      cognition: 30 + CHANCE * 10, // 30 - 70
      guts: 20 + RISK * 14,       // 20 - 76
      luck: 40 + EGO * 8          // 40 - 72
    };

    if (persona && persona.attrBias) {
      for (var k in persona.attrBias) {
        if (Object.prototype.hasOwnProperty.call(persona.attrBias, k)) {
          base[k] = (base[k] || 0) + persona.attrBias[k];
        }
      }
    }
    return NS.AttrSystem.create(base);
  }

  NS.PersonaResolver = {
    resolve: resolve,
    initialAttrs: initialAttrs
  };
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
