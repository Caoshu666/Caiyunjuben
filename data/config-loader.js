/**
 * config-loader.js —— 配置加载与远程覆盖
 *
 * 合规要点：微信小游戏【禁止动态执行代码】，所以远程只能下发
 * 【纯数据 JSON】，绝不包含任何可执行逻辑。这里做的就是把远程
 * patch 浅合并到包内默认配置之上。
 *
 * 降级策略：远程失败 / 超时 / 版本不兼容 → 直接用包内配置，绝不阻塞游戏。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var SCHEMA_VERSION = 1;

  function ConfigLoader(opts) {
    opts = opts || {};
    this.tables = {};
    this.patchUrl = opts.patchUrl || '';
    this.schemaVersion = SCHEMA_VERSION;
    this.patched = {}; // 记录哪些表被远程覆盖过
  }

  /** 从 NS.Tables 载入包内默认配置 */
  ConfigLoader.prototype.loadDefaults = function () {
    var src = NS.Tables || {};
    for (var k in src) {
      if (Object.prototype.hasOwnProperty.call(src, k)) {
        this.tables[k] = src[k];
      }
    }
    this._applyBalance();
    return this;
  };

  /**
   * 施加全局标定系数（见 tables/balance.js 的说明）
   *
   * 幂等：原始值第一次用到时会被存进 _baseEffect / _baseUpkeep，
   * 因此重复调用不会把系数叠加两次。
   */
  ConfigLoader.prototype._applyBalance = function () {
    var b = this.tables.balance;
    if (!b) return;

    var events = this.tables.event || [];
    for (var i = 0; i < events.length; i++) {
      var opts = events[i].options || [];
      for (var j = 0; j < opts.length; j++) {
        var opt = opts[j];
        if (!opt._baseEffect) {
          opt._baseEffect = {};
          for (var bk in opt.effect || {}) {
            if (Object.prototype.hasOwnProperty.call(opt.effect, bk)) {
              opt._baseEffect[bk] = opt.effect[bk];
            }
          }
        }
        var out = {};
        for (var key in opt._baseEffect) {
          if (!Object.prototype.hasOwnProperty.call(opt._baseEffect, key)) continue;
          var v = opt._baseEffect[key];
          var scale;
          if (key === 'cash') scale = v >= 0 ? b.cashPos : b.cashNeg;
          else scale = v >= 0 ? b.otherPos : b.otherNeg;
          var nv = Math.round(v * scale);
          if (nv === 0 && v !== 0) nv = v > 0 ? (b.minAbs || 1) : -(b.minAbs || 1);
          out[key] = nv;
        }
        opt.effect = out;
      }
    }

    var stages = this.tables.stage || [];
    for (var s = 0; s < stages.length; s++) {
      if (stages[s]._baseUpkeep === undefined) stages[s]._baseUpkeep = stages[s].upkeep || 0;
      stages[s].upkeep = Math.round(stages[s]._baseUpkeep * (b.upkeep === undefined ? 1 : b.upkeep));
    }
  };

  ConfigLoader.prototype.get = function (name) {
    return this.tables[name];
  };

  /**
   * 应用远程 JSON patch（浅合并：按表整体替换）
   * @param {Object} patch { schemaVersion, persona:[...], event:[...], ... }
   * @returns {boolean} 是否应用成功
   */
  ConfigLoader.prototype.applyPatch = function (patch) {
    if (!patch || typeof patch !== 'object') return false;
    if (patch.schemaVersion !== undefined && patch.schemaVersion !== this.schemaVersion) {
      // schema 不兼容 → 整包忽略，回退包内版本
      return false;
    }
    var applied = false;
    for (var k in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, k)) continue;
      if (k === 'schemaVersion' || k === 'version') continue;
      if (!Array.isArray(patch[k])) continue;
      this.tables[k] = patch[k];
      this.patched[k] = true;
      applied = true;
    }
    return applied;
  };

  /**
   * 异步拉取远程配置（失败静默降级）
   * @param {Object} http 平台适配层提供的请求能力 { getJSON(url, cb) }
   */
  ConfigLoader.prototype.fetchPatch = function (http, done) {
    var self = this;
    if (!this.patchUrl || !http || !http.getJSON) {
      if (done) done(false);
      return;
    }
    try {
      http.getJSON(this.patchUrl, function (err, json) {
        var ok = false;
        if (!err && json) ok = self.applyPatch(json);
        if (done) done(ok);
      });
    } catch (e) {
      if (done) done(false);
    }
  };

  NS.ConfigLoader = ConfigLoader;
  NS.ConfigLoader.SCHEMA_VERSION = SCHEMA_VERSION;
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
