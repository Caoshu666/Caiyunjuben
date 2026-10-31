/**
 * rng.js —— 可复现随机数发生器
 * 逻辑层模块：不依赖任何平台 API，浏览器 / Node / 微信小游戏通用。
 *
 * 使用固定 seed 即可完整复现一局游戏，这是「数值模拟 10 万局」和
 * 「分享结果可校验」的基础能力。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  /**
   * @param {number} [seed] 随机种子，省略则取当前时间
   */
  function Rng(seed) {
    this.seed = seed === undefined || seed === null ? (Date.now() >>> 0) : seed >>> 0;
    this._s = this.seed || 0x9e3779b9;
  }

  /** 返回 [0, 1) 之间的浮点数（mulberry32 算法） */
  Rng.prototype.next = function () {
    this._s = (this._s + 0x6d2b79f5) | 0;
    var t = Math.imul(this._s ^ (this._s >>> 15), 1 | this._s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** 返回 [0, n) 的整数 */
  Rng.prototype.int = function (n) {
    return Math.floor(this.next() * n);
  };

  /** 从数组里等概率取一个 */
  Rng.prototype.pick = function (arr) {
    if (!arr || !arr.length) return null;
    return arr[this.int(arr.length)];
  };

  /** 洗牌（返回新数组，不修改入参） */
  Rng.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = this.int(i + 1);
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  };

  /** 从数组里随机取 n 个（不重复） */
  Rng.prototype.sample = function (arr, n) {
    return this.shuffle(arr).slice(0, n);
  };

  /**
   * 加权随机
   * @param {Array} items
   * @param {Function} weightFn (item, index) => number，返回 <=0 表示不可选
   */
  Rng.prototype.weighted = function (items, weightFn) {
    if (!items || !items.length) return null;
    var weights = [];
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      var w = Math.max(0, Number(weightFn(items[i], i)) || 0);
      weights.push(w);
      total += w;
    }
    if (total <= 0) return items[this.int(items.length)];
    var r = this.next() * total;
    for (var k = 0; k < items.length; k++) {
      r -= weights[k];
      if (r <= 0) return items[k];
    }
    return items[items.length - 1];
  };

  NS.Rng = Rng;
})(typeof globalThis !== 'undefined' ? globalThis : this);
