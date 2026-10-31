/**
 * event-draw.js —— 随机事件抽取模块
 *
 * 对应设计文档 3.4 / 3.5：
 *   - 按阶段过滤事件池
 *   - 权重 = 基础权重 × 人格专属系数(×2) × 稀有度系数(随运势提升)
 *   - 保底机制：连续 2 次负向事件后，第 3 次强制出正向 / 机遇事件
 *   - 危机事件：仅在满足 require 表达式时才有权重
 *   - 连锁事件：结算后按 chain.when 条件把后续事件压入队列
 *   - 同一阶段内不重复抽取同一事件
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  // 稀有度基础系数（再叠加运势修正）
  var RARITY_BASE = { N: 1, R: 1, SR: 1, SSR: 1 };
  // 运势对稀有度的放大斜率
  var RARITY_LUCK_SLOPE = { N: 0.0, R: 1 / 300, SR: 1 / 200, SSR: 1 / 150 };

  function EventDraw(opts) {
    opts = opts || {};
    this.events = opts.events || [];
    this.rng = opts.rng;
    if (!this.rng) throw new Error('[EventDraw] 需要传入 rng');
  }

  /**
   * 抽一个事件
   * @param {Object} stage 阶段配置
   * @param {Object} ctx   { attrs, personaId, drawnIds:{}, consecutiveNeg, chainQueue:[] }
   * @returns {Object|null}
   */
  EventDraw.prototype.draw = function (stage, ctx) {
    ctx = ctx || {};
    var attrs = ctx.attrs || {};
    var drawnIds = ctx.drawnIds || {};
    var self = this;

    // 1) 优先消费连锁队列
    if (ctx.chainQueue && ctx.chainQueue.length) {
      var chainId = ctx.chainQueue.shift();
      var chained = this._findById(chainId);
      if (chained) return chained;
    }

    // 2) 构造候选池
    var pool = this.events.filter(function (e) {
      if (e.stage !== stage.id) return false;
      if (drawnIds[e.id]) return false;
      if (e.require && !NS.ExprEvaluator.test(e.require, attrs)) return false;
      return true;
    });

    // 3) 保底：连续 2 次负向 → 本轮强制正向 / 机遇
    var forced = false;
    if ((ctx.consecutiveNeg || 0) >= 2) {
      var good = pool.filter(function (e) {
        return e.type === 'positive' || e.type === 'chance';
      });
      if (good.length) {
        pool = good;
        forced = true;
      }
    }

    if (!pool.length) {
      // 兜底：允许重复抽取本阶段事件，避免卡死
      pool = this.events.filter(function (e) {
        return e.stage === stage.id;
      });
      if (!pool.length) return null;
      forced = false;
    }

    // 4) 加权随机
    var chosen = this.rng.weighted(pool, function (e) {
      return self._weightOf(e, attrs, ctx.personaId, forced);
    });

    return chosen || pool[0];
  };

  /** 单个事件的权重计算 */
  EventDraw.prototype._weightOf = function (e, attrs, personaId, forced) {
    var base = Number(e.weight) || 100;
    var w = base;

    // 人格专属事件加权
    if (e.personaTags && personaId && e.personaTags.indexOf(personaId) >= 0) {
      w *= 2;
    }

    // 稀有度 × 运势 修正
    var rarity = e.rarity || 'N';
    var luck = Number(attrs.luck) || 0;
    w *= (RARITY_BASE[rarity] || 1) + (RARITY_LUCK_SLOPE[rarity] || 0) * luck;

    // 危机事件：满足条件时权重拉高，制造压迫感
    if (e.type === 'crisis') {
      w *= 6;
    }

    // 保底轮次里，正向 / 机遇额外加权
    if (forced && (e.type === 'positive' || e.type === 'chance')) {
      w *= 1.5;
    }

    return w;
  };

  EventDraw.prototype._findById = function (id) {
    for (var i = 0; i < this.events.length; i++) {
      if (this.events[i].id === id) return this.events[i];
    }
    return null;
  };

  /**
   * 判断事件结算后是否要触发连锁
   * @returns {string|null} 需要压入队列的事件 id
   */
  EventDraw.prototype.resolveChain = function (option, attrs) {
    if (!option || !option.chain) return null;
    var ch = option.chain;
    if (!ch.next) return null;
    if (ch.when && !NS.ExprEvaluator.test(ch.when, attrs)) return null;
    return ch.next;
  };

  /** 事件是否属于负向结果（用于保底计数） */
  function isNegativeEvent(e) {
    return e && e.type === 'negative';
  }

  /** 根据选项的实际属性净变化判断正负（比对事件类型更准确） */
  function isNegativeDelta(deltas) {
    var sum = 0;
    for (var k in deltas) {
      if (Object.prototype.hasOwnProperty.call(deltas, k)) sum += deltas[k];
    }
    return sum < 0;
  }

  NS.EventDraw = EventDraw;
  NS.EventDraw.isNegativeEvent = isNegativeEvent;
  NS.EventDraw.isNegativeDelta = isNegativeDelta;
})(typeof globalThis !== 'undefined' ? globalThis : this);
