/**
 * test-engine.js —— 初始财运人格测试引擎
 *
 * 规则（对应设计文档 3.1）：
 *   - 8 道题，覆盖 4 个维度（RISK / CHANCE / SOCIAL / EGO），每维 2 题
 *   - 每题 3 个选项，选项给相关维度打 0/1/2 分
 *   - 选项顺序在展示时【运行时打乱】（防作弊）
 *   - 结果向量每维裁剪到 0-4
 *   - 支持「返回上一题」改答案（见 rewindTo 的注释）
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var DIMS = ['RISK', 'CHANCE', 'SOCIAL', 'EGO'];
  var PER_DIM = 2; // 每个维度抽几题

  /**
   * @param {{questions:Array, rng:Object}} opts
   */
  function TestEngine(opts) {
    opts = opts || {};
    this.questions = opts.questions || [];
    this.rng = opts.rng;
    if (!this.rng) throw new Error('[TestEngine] 需要传入 rng');

    this.list = []; // 本次抽出的 8 题（含打乱后的选项）
    this.index = 0;
    this.vector = { RISK: 0, CHANCE: 0, SOCIAL: 0, EGO: 0 };
    /*
     * answers[i] = 第 i 题【已确认】的选择（下标对应打乱后的顺序），未答为 undefined。
     *
     * 为什么要单独存下来而不是只累加分数：
     *   支持「返回上一题」改答案时，必须能把那一题已经加进去的分减掉。
     *   减分是最容易出错的做法（连减两次、漏减都会让结果静默偏移），
     *   所以这里存原始选择，回退时【从零重算】向量 —— 8 题的量级下
     *   重算是常数级开销，换来的是分数永远不可能和选择对不上。
     */
    this.answers = [];
    /*
     * lastChoice[i] = 第 i 题【历史上最后一次】选过的选项，只用于界面回显。
     *
     * 与 answers 的区别很关键，别合并：
     *   answers 是计分依据，回退时会被截断（保证 vector 只由已确认的作答决定）；
     *   lastChoice 是显示线索，回退时刻意【不】截断 ——
     *   否则玩家退回上一题时看到的是一道空白题，会怀疑自己的答案丢了。
     *   它也永远不参与任何计算，所以残留的旧值不会污染分数。
     */
    this.lastChoice = [];
    this.records = []; // 答题记录，用于埋点 / 分享校验
  }

  /** 抽题并开始 */
  TestEngine.prototype.start = function () {
    this.list = [];
    this.index = 0;
    this.vector = { RISK: 0, CHANCE: 0, SOCIAL: 0, EGO: 0 };
    this.answers = [];
    this.lastChoice = [];
    this.records = [];

    for (var d = 0; d < DIMS.length; d++) {
      var dim = DIMS[d];
      var pool = this.questions.filter(function (q) {
        return q.dim === dim;
      });
      var picked = this.rng.sample(pool, PER_DIM);
      for (var i = 0; i < picked.length; i++) {
        this.list.push(this._prepare(picked[i]));
      }
    }

    // 打乱 8 题的出场顺序
    this.list = this.rng.shuffle(this.list);
    return this;
  };

  /** 打乱某题的选项顺序（保留原始选项引用） */
  TestEngine.prototype._prepare = function (q) {
    var opts = this.rng.shuffle(q.options);
    return {
      id: q.id,
      dim: q.dim,
      stem: q.stem,
      options: opts
    };
  };

  TestEngine.prototype.current = function () {
    return this.list[this.index] || null;
  };

  TestEngine.prototype.total = function () {
    return this.list.length;
  };

  TestEngine.prototype.progress = function () {
    return this.list.length ? this.index / this.list.length : 0;
  };

  TestEngine.prototype.isDone = function () {
    return this.index >= this.list.length;
  };

  /**
   * 作答当前题
   * @param {number} optionIndex 玩家点击的选项下标（对应打乱后的顺序）
   */
  TestEngine.prototype.answer = function (optionIndex) {
    var q = this.current();
    if (!q) return null;
    var opt = q.options[optionIndex];
    if (!opt) return null;

    this.answers[this.index] = optionIndex;
    this.lastChoice[this.index] = optionIndex;
    this.records[this.index] = { qid: q.id, optIndex: optionIndex, text: opt.text };
    this.index++;
    this._recompute();
    return opt;
  };

  /** 根据 answers 从头重算四维向量 —— 改答案后唯一可靠的算法 */
  TestEngine.prototype._recompute = function () {
    var v = { RISK: 0, CHANCE: 0, SOCIAL: 0, EGO: 0 };
    for (var i = 0; i < this.index; i++) {
      var oi = this.answers[i];
      if (oi === undefined || oi === null) continue;
      var q = this.list[i];
      var opt = q && q.options[oi];
      if (!opt || !opt.dim) continue;
      for (var k in opt.dim) {
        if (Object.prototype.hasOwnProperty.call(opt.dim, k)) {
          v[k] = (v[k] || 0) + opt.dim[k];
        }
      }
    }
    this.vector = v;
  };

  /**
   * 回到第 i 题重新作答（「返回上一题」与「改答案」都走这里）
   *
   * 只截断 answers（计分依据），保留 lastChoice（界面回显）。
   * 为什么截断 answers：
   *   如果不截断，玩家退回去改了第 3 题，第 4-8 题的旧答案还留在 answers 里，
   *   那 vector 到底是「新第 3 题 + 旧第 4-8 题」还是别的组合就说不清了。
   *   统一截断后，vector 的定义始终是「answers[0..index-1] 之和」，没有歧义。
   *
   * 保留 lastChoice 则让「退回后看到的仍是你上次的答案」成立，
   * 玩家往回翻时能一眼确认自己原来选了什么，顺着点下去就能答完。
   *
   * @param {number} i 目标题号（0 起），自动夹到合法区间
   */
  TestEngine.prototype.rewindTo = function (i) {
    var n = this.list.length;
    if (!n) return this;
    i = Math.max(0, Math.min(n - 1, i | 0));
    if (i === this.index) return this;
    this.index = i;
    this.answers.length = i;
    this.records.length = i;
    this._recompute();
    return this;
  };

  /** 返回上一题，成功返回 true（已在第一题则返回 false） */
  TestEngine.prototype.back = function () {
    if (this.index <= 0) return false;
    this.rewindTo(this.index - 1);
    return true;
  };

  /**
   * 第 i 题【上次的选择】，仅供界面高亮；没选过返回 -1。
   * 走 lastChoice 而不是 answers —— 见构造器里的说明。
   */
  TestEngine.prototype.choiceOf = function (i) {
    var v = this.lastChoice[i];
    return v === undefined || v === null ? -1 : v;
  };

  /** 当前题上次的选择，没选过返回 -1 */
  TestEngine.prototype.currentChoice = function () {
    return this.choiceOf(this.index);
  };

  /** 最终四维向量（裁剪到 0-4） */
  TestEngine.prototype.getVector = function () {
    var v = {};
    for (var i = 0; i < DIMS.length; i++) {
      var d = DIMS[i];
      v[d] = Math.max(0, Math.min(4, Math.round(this.vector[d] || 0)));
    }
    return v;
  };

  NS.TestEngine = TestEngine;
  NS.TestEngine.DIMS = DIMS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
