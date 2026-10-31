/**
 * attr-system.js —— 属性 / 资源系统
 *
 * 5 个核心属性（0-100）：现金 cash / 人脉 social / 认知 cognition / 胆识 guts / 运势 luck
 * 规则完全按设计文档实现：
 *   - 人脉 >= 60 时，负向现金损失减半（人脉可救场）
 *   - 胆识 > 85 触发「过度冒险」，高风险事件有额外失败率
 *   - 属性归零不结束游戏，改为触发危机事件链
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var ATTRS = ['cash', 'social', 'cognition', 'guts', 'luck'];

  var LABEL = {
    cash: '现金',
    social: '人脉',
    cognition: '认知',
    guts: '胆识',
    luck: '运势'
  };

  var MIN = 0;
  var MAX = 100;

  /** 危机阈值：低于该值即认为进入危机区间 */
  var CRISIS_LINE = {
    cash: 20,
    social: 10,
    cognition: 8,
    guts: 5,
    luck: 5
  };

  /** 过度冒险阈值 */
  var OVER_RISK_LINE = 85;
  /**
   * 人脉救场阈值。
   * 定在 75 而不是 60：实测人脉很容易通胀到 70 左右，阈值太低会导致
   * 「现金损失减半」几乎全程生效，把整个数值系统的下行压力抵消掉。
   */
  var SOCIAL_RESCUE_LINE = 75;

  function clampNum(n) {
    if (typeof n !== 'number' || isNaN(n)) return 0;
    return Math.max(MIN, Math.min(MAX, Math.round(n)));
  }

  /** 创建一组属性 */
  function create(init) {
    var a = {};
    for (var i = 0; i < ATTRS.length; i++) {
      var k = ATTRS[i];
      a[k] = clampNum(init && init[k] !== undefined ? init[k] : 50);
    }
    return a;
  }

  /** 复制 */
  function clone(a) {
    var o = {};
    for (var i = 0; i < ATTRS.length; i++) o[ATTRS[i]] = a[ATTRS[i]];
    return o;
  }

  /**
   * 应用一次属性变化（含人脉救场等修正）
   * @returns {{next:Object, deltas:Object, notes:string[]}}
   */
  function apply(attrs, effect) {
    var next = clone(attrs);
    var deltas = {};
    var notes = [];

    if (!effect) return { next: next, deltas: deltas, notes: notes };

    for (var i = 0; i < ATTRS.length; i++) {
      var k = ATTRS[i];
      var raw = Number(effect[k]) || 0;
      if (raw === 0) continue;
      var v = raw;

      // 规则：人脉足够时，现金的负向损失减半
      if (k === 'cash' && raw < 0 && attrs.social >= SOCIAL_RESCUE_LINE) {
        v = Math.ceil(raw / 2);
        notes.push('人脉托底：现金损失减半（' + raw + ' → ' + v + '）');
      }

      var before = next[k];
      next[k] = clampNum(before + v);
      var actual = next[k] - before;
      if (actual !== 0) deltas[k] = actual;
    }

    return { next: next, deltas: deltas, notes: notes };
  }

  /** 平均属性值 */
  function average(attrs) {
    var s = 0;
    for (var i = 0; i < ATTRS.length; i++) s += attrs[ATTRS[i]];
    return s / ATTRS.length;
  }

  /** 高于阈值的属性个数 */
  function countAtLeast(attrs, threshold) {
    var n = 0;
    for (var i = 0; i < ATTRS.length; i++) if (attrs[ATTRS[i]] >= threshold) n++;
    return n;
  }

  /** 是否处于「过度冒险」状态 */
  function isOverRisk(attrs) {
    return attrs.guts > OVER_RISK_LINE;
  }

  /** 返回当前处于危机的属性列表（可能为空） */
  function crisisOf(attrs) {
    var list = [];
    for (var i = 0; i < ATTRS.length; i++) {
      var k = ATTRS[i];
      if (attrs[k] <= CRISIS_LINE[k]) list.push(k);
    }
    return list;
  }

  NS.AttrSystem = {
    ATTRS: ATTRS,
    LABEL: LABEL,
    MIN: MIN,
    MAX: MAX,
    CRISIS_LINE: CRISIS_LINE,
    OVER_RISK_LINE: OVER_RISK_LINE,
    SOCIAL_RESCUE_LINE: SOCIAL_RESCUE_LINE,
    create: create,
    clone: clone,
    apply: apply,
    average: average,
    countAtLeast: countAtLeast,
    isOverRisk: isOverRisk,
    crisisOf: crisisOf,
    clamp: clampNum
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
