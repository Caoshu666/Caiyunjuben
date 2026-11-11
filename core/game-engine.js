/**
 * game-engine.js —— 核心玩法状态机
 *
 * 负责串联：测试 → 建号 → 阶段循环 → 阶段结算 → 结局判定 → 翻盘 → 结局 → 结果卡
 * 该模块【完全不依赖任何平台 API】，所有外部能力（存档、广告、震动）都通过
 * 注入进来的 adapter 调用。这正是它能同时跑在浏览器、Node、微信小游戏里的原因。
 *
 * 状态机迁移：
 *   boot → privacy → home → quiz → build → stage ⇄ summary → ending → result
 *                                            ↘ revive ↗
 *   home ⇄ codex（图鉴，可随时进出，不影响当前进度）
 *
 * 阶段内的「返回上一件事」不是状态迁移，而是对 state 的一次整体回滚，
 * 详见下面「抉择回退」一节。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var SAVE_KEY = 'ws_save_v1';
  var COLLECTION_KEY = 'ws_collection_v1';
  var SAVE_SCHEMA = 1;

  var PHASE = {
    BOOT: 'boot',
    PRIVACY: 'privacy',
    HOME: 'home',
    CODEX: 'codex',
    QUIZ: 'quiz',
    BUILD: 'build',
    STAGE: 'stage',
    SUMMARY: 'summary',
    REVIVE: 'revive',
    ENDING: 'ending',
    RESULT: 'result'
  };

  function GameEngine(opts) {
    opts = opts || {};
    this.adapter = opts.adapter || {};
    this.config = opts.config;
    this.rng = opts.rng || new NS.Rng(opts.seed);
    this.listeners = {};

    this.stages = [];
    this.events = [];
    this.personas = [];
    this.endings = [];
    this.questions = [];
    this.questionBanks = null; // 题库组，供「整库随机」用
    this.eventBanks = null;   // 事件库组，供「整库随机」用
    this.currentEventBank = null; // 本局选中的事件库标识（key）
    this.text = {};
    this.fortune = {};

    this.state = this._blankState();
    this.quiz = null;
    this.draw = null;
    /**
     * 抉择回退栈，见「抉择回退」一节的说明。
     * 故意放在引擎上而不是 state 里：state 会被整个快照给界面用，
     * 这里每一帧都揣着一份属性副本，属于引擎内部数据，不该混进去。
     */
    this.choiceStack = [];
  }

  /* ------------------------------------------------------------------ */
  /* 内部工具                                                            */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype._blankState = function () {
    return {
      phase: PHASE.BOOT,
      privacyAccepted: false,
      persona: null,
      vector: null,
      attrs: null,
      startCash: 0,
      flags: [],
      stageIndex: 0,
      eventsInStage: 0,
      drawnIds: {},
      consecutiveNeg: 0,
      chainQueue: [],
      currentEvent: null,
      stageSnapshot: null,
      revealed: false,
      /**
       * 上一次在这个事件里选了第几个选项（-1 = 没选过）。
       * 只为界面高亮服务：从下一件事退回来时，把上次的选择标出来，
       * 否则玩家会以为自己填的答案丢了。
       */
      lastPick: -1,
      result: null,
      finalResult: null,
      stageRating: null,
      reviveUsed: false,
      history: [],
      collection: { personas: [], endings: [] },
      playCount: 0,
      /** 每日财运签，由 refreshDaily() 懒填充 */
      daily: null,

      /* ---- 图鉴 ---- */
      codexTab: 'persona', // 'persona' | 'ending'
      codexFocus: null,    // 详情弹层当前展示的条目 id
      /** 本局【新】解锁的条目，供结局页提示「解锁了 1 个新结局」 */
      newUnlocks: []
    };
  };

  GameEngine.prototype.on = function (evt, cb) {
    (this.listeners[evt] = this.listeners[evt] || []).push(cb);
    return this;
  };

  GameEngine.prototype.emit = function (evt, payload) {
    var arr = this.listeners[evt] || [];
    for (var i = 0; i < arr.length; i++) arr[i](payload, this.state);
    return this;
  };

  GameEngine.prototype.t = function (key, vars) {
    var s = this.text[key] || key;
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          s = s.split('{' + k + '}').join(vars[k]);
        }
      }
    }
    return s;
  };

  GameEngine.prototype.totalStages = function () {
    return this.stages.length;
  };

  GameEngine.prototype.currentStage = function () {
    return this.stages[this.state.stageIndex] || null;
  };

  GameEngine.prototype._findEvent = function (id) {
    // 先在本局选中的事件库里找（整库随机时事件 id 属于某一套库）
    var pool = this.draw && this.draw.events ? this.draw.events : this.events;
    for (var i = 0; i < pool.length; i++) if (pool[i].id === id) return pool[i];
    // 兜底：再在全集（A 套）里找，兼容旧存档 / 未启用事件库组的场景
    if (pool !== this.events) {
      for (var j = 0; j < this.events.length; j++) if (this.events[j].id === id) return this.events[j];
    }
    return null;
  };

  /* ------------------------------------------------------------------ */
  /* 生命周期                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * 根据 questionSets 定义，把各套题库打包成 [{key, questions}]。
   *
   * 只有当一个 set 引用的表真实存在、且非空时才会被纳入；
   * 若没有任何可用的套库，返回 null（TestEngine 会退回旧的全量混抽行为）。
   */
  GameEngine.prototype._buildQuestionBanks = function () {
    var sets = this.config.get('questionSets');
    if (!sets || !sets.length) return null;

    var banks = [];
    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var qs = s && s.table ? this.config.get(s.table) : null;
      if (qs && qs.length) {
        banks.push({ key: s.key, questions: qs });
      }
    }
    return banks.length ? banks : null;
  };

  /**
   * 根据 eventSets 定义，把各套事件库打包成 [{key, events}]。
   * 与 _buildQuestionBanks 同构，供「整库随机」在每局开始时选一套事件库。
   */
  GameEngine.prototype._buildEventBanks = function () {
    var sets = this.config.get('eventSets');
    if (!sets || !sets.length) return null;

    var banks = [];
    for (var i = 0; i < sets.length; i++) {
      var s = sets[i];
      var evs = s && s.table ? this.config.get(s.table) : null;
      if (evs && evs.length) {
        banks.push({ key: s.key, events: evs });
      }
    }
    return banks.length ? banks : null;
  };

  /** 从事件库组里随机选一套（返回 {key, events} 或 null） */
  GameEngine.prototype._pickEventBank = function () {
    if (!this.eventBanks || !this.eventBanks.length) return null;
    return this.rng.pick(this.eventBanks);
  };

  /** 加载配置并进入第一个界面 */
  GameEngine.prototype.start = function () {
    this.stages = this.config.get('stage') || [];
    this.events = this.config.get('event') || [];
    this.personas = this.config.get('persona') || [];
    this.endings = this.config.get('ending') || [];
    this.questions = this.config.get('question') || [];
    this.text = this.config.get('text') || {};
    this.fortune = this.config.get('fortune') || {};

    // 题库组（整库随机）：如果存在 questionSets 定义，则把各套题库打包成
    // [{key, questions}] 交给 TestEngine 做「每次开局随机选一套」。
    // 没有 questionSets 或表缺失时，保持 questionBanks 为 null，走旧行为。
    this.questionBanks = this._buildQuestionBanks();

    // 事件库组（整库随机）：与题库组同构，把多套事件库打包成 [{key, events}]。
    this.eventBanks = this._buildEventBanks();

    this.draw = new NS.EventDraw({ events: this.events, rng: this.rng });

    var col = this._readJSON(COLLECTION_KEY);
    if (col && col.personas) this.state.collection = col;

    var privacy = this.adapter.storage ? this.adapter.storage.get('ws_privacy_v1') : null;
    this.state.privacyAccepted = privacy === '1';

    // 每日一签：首页一进来就要显示，所以在这里先算好
    this.refreshDaily(true);

    this.state.phase = this.state.privacyAccepted ? PHASE.HOME : PHASE.PRIVACY;
    this.emit('change');
    return this;
  };

  GameEngine.prototype.acceptPrivacy = function () {
    this.state.privacyAccepted = true;
    if (this.adapter.storage) this.adapter.storage.set('ws_privacy_v1', '1');
    this.state.phase = PHASE.HOME;
    this.emit('change');
  };

  GameEngine.prototype.rejectPrivacy = function () {
    this.emit('reject');
  };

  /* ------------------------------------------------------------------ */
  /* 流程：测试                                                          */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype.startTest = function () {
    /*
     * 开新的一局 = 明确放弃上一局没走完的进度，所以要顺手把存档清掉。
     *
     * 不清会怎样：玩家在阶段中途回首页（首页会显示「继续上次的人生」），
     * 但他这次点了「开始写我的剧本」—— 存档还留着，于是他在答题过程中
     * 再回一次首页，「继续上次的人生」又出现了，点下去会被拉回上一局的
     * 残局。两局的状态混在一起，是最难解释的一类 bug。
     */
    this.clearSave();
    this.quiz = new NS.TestEngine({ questions: this.questions, banks: this.questionBanks, rng: this.rng });
    this.quiz.pickBank().start();

    // 事件库（整库随机）：每局开始时随机选一套事件库，用它重建 EventDraw。
    // 选中的事件库含本库内的连锁（weight=0）隐藏事件，保证 chain 闭环。
    var evBank = this._pickEventBank();
    this.currentEventBank = evBank ? evBank.key : null;
    this.draw = new NS.EventDraw({ events: evBank ? evBank.events : this.events, rng: this.rng });

    this.state.phase = PHASE.QUIZ;
    this.emit('change');
    return this.quiz.current();
  };

  GameEngine.prototype.answerQuiz = function (optionIndex) {
    if (!this.quiz) return;
    this.quiz.answer(optionIndex);
    if (this.quiz.isDone()) {
      this._buildPersona();
    } else {
      this.emit('change');
    }
  };

  /**
   * 返回上一题改答案。
   *
   * 分数回退由 TestEngine 负责（它保存了每题的选择、回退时整体重算），
   * 这里只做状态广播。分开的原因是：改答案时的分数正确性是这个游戏
   * 最容易出错的地方，把它关在 TestEngine 里能单独测。
   *
   * @returns {boolean} 是否真的退了（已在第一题则 false，界面据此忽略）
   */
  GameEngine.prototype.quizBack = function () {
    if (!this.quiz) return false;
    var ok = this.quiz.back();
    if (ok) this.emit('change');
    return ok;
  };

  /**
   * 从「你的财运人格」页回答题页改答案。
   * 直接落在最后一题：玩家十有八九是想改刚答的那道，
   * 想改更早的可以继续点「上一题」往前退。
   */
  GameEngine.prototype.editQuiz = function () {
    if (!this.quiz) return false;
    this.quiz.rewindTo(this.quiz.total() - 1);
    this.state.phase = PHASE.QUIZ;
    this.emit('change');
    return true;
  };

  GameEngine.prototype._buildPersona = function () {
    var vec = this.quiz.getVector();
    var persona = NS.PersonaResolver.resolve(vec, this.personas);
    var attrs = NS.PersonaResolver.initialAttrs(vec, persona);

    this.state.vector = vec;
    this.state.persona = persona;
    this.state.attrs = attrs;
    this.state.startCash = attrs.cash;
    this.state.phase = PHASE.BUILD;
    this.emit('change');
  };

  /* ------------------------------------------------------------------ */
  /* 流程：阶段循环                                                      */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype.confirmBuild = function () {
    this.state.flags = [];
    this.state.drawnIds = {};
    this.state.history = [];
    this.state.chainQueue = [];
    this.state.consecutiveNeg = 0;
    this.choiceStack = [];
    this._enterStage(0);
  };

  GameEngine.prototype._enterStage = function (index) {
    this.state.stageIndex = index;
    this.state.eventsInStage = 0;
    this.state.consecutiveNeg = 0;
    this.state.chainQueue = [];
    // 记录阶段开始时的快照，供「翻盘回退」使用
    this.state.stageSnapshot = {
      attrs: NS.AttrSystem.clone(this.state.attrs),
      flags: this.state.flags.slice()
    };
    this._drawNext();
    this.state.phase = PHASE.STAGE;
    this.saveGame();
    this.emit('change');
  };

  GameEngine.prototype._drawNext = function () {
    var stage = this.currentStage();
    var ev = this.draw.draw(stage, {
      attrs: this.state.attrs,
      personaId: this.state.persona ? this.state.persona.id : null,
      drawnIds: this.state.drawnIds,
      consecutiveNeg: this.state.consecutiveNeg,
      chainQueue: this.state.chainQueue
    });
    this.state.currentEvent = ev;
    this.state.revealed = false;
    this.state.result = null;
    // 换了一个新事件，上一件事的「已选」高亮就不该再留着了
    this.state.lastPick = -1;
    return ev;
  };

  /** 玩家选择了某个选项 → 结算，但不立即推进（留时间给结算动画） */
  GameEngine.prototype.chooseOption = function (optionIndex) {
    var ev = this.state.currentEvent;
    if (!ev || this.state.revealed) return null;
    var opt = ev.options[optionIndex];
    if (!opt) return null;

    /*
     * ★ 先落一帧「抉择前」的快照，之后才允许动任何状态。
     * 顺序反了就等于把已经改过的值当成原值存进去，回退后属性会多算一次 ——
     * 这是这类撤销功能最常见的隐性错误（表现是「退回去数字不对」，很难查）。
     */
    this._pushBackFrame(ev, optionIndex);

    var stage = this.currentStage();
    var upkeep = stage && stage.upkeep ? stage.upkeep : 0;

    // 1) 先结算玩家自己的选择
    var res = NS.AttrSystem.apply(this.state.attrs, opt.effect);
    var notes = res.notes.slice();

    // 2) 再扣除本阶段的生活开销（数值系统的「重力」）
    if (upkeep) {
      var up = NS.AttrSystem.apply(res.next, { cash: -upkeep });
      for (var dk in up.deltas) {
        if (Object.prototype.hasOwnProperty.call(up.deltas, dk)) {
          res.deltas[dk] = (res.deltas[dk] || 0) + up.deltas[dk];
        }
      }
      for (var ndk in up.notes) { /* noop, 保留结构 */ }
      res.next = up.next;
      notes.unshift('生活开销 -' + upkeep);
    }

    // 3) 规则：胆识过高（>85）时，高风险机遇事件有 15% 概率翻车
    if (NS.AttrSystem.isOverRisk(this.state.attrs) && ev.type === 'chance' && this.rng.next() < 0.15) {
      var pen = NS.AttrSystem.apply(res.next, { cash: -8, guts: -4 });
      for (var pk in pen.deltas) {
        if (Object.prototype.hasOwnProperty.call(pen.deltas, pk)) {
          res.deltas[pk] = (res.deltas[pk] || 0) + pen.deltas[pk];
        }
      }
      res.next = pen.next;
      notes.push('过度冒险：胆识过高导致判断失准，额外损失 8 现金');
    }

    this.state.attrs = res.next;
    if (opt.flag) this.state.flags.push(opt.flag);

    // 连锁事件入队
    var chainId = this.draw.resolveChain(opt, this.state.attrs);
    if (chainId) this.state.chainQueue.push(chainId);

    // 保底计数器：只看玩家这一次选择的净效果，不含生活开销
    // （否则生活开销会把所有正向选择都算成负向，保底机制会被过度触发）
    var raw = NS.AttrSystem.apply(this.state.attrs, opt.effect).deltas;
    this.state.consecutiveNeg = NS.EventDraw.isNegativeDelta(raw)
      ? this.state.consecutiveNeg + 1
      : 0;

    this.state.drawnIds[ev.id] = true;
    this.state.eventsInStage++;
    this.state.history.push({
      eventId: ev.id,
      optionText: opt.text,
      deltas: res.deltas
    });

    this.state.result = {
      event: ev,
      option: opt,
      deltas: res.deltas,
      notes: notes,
      narration: opt.narration || ''
    };
    this.state.revealed = true;

    this._feedback(ev, res.deltas, raw);
    this.saveGame();
    this.emit('change');
    return this.state.result;
  };

  GameEngine.prototype._feedback = function (ev, deltas, raw) {
    var negative = NS.EventDraw.isNegativeDelta(raw || deltas);
    var strong = ev.rarity === 'SR' || ev.rarity === 'SSR';
    var type = negative ? 'negative' : strong ? 'strong' : 'positive';
    if (this.adapter.vibrate) this.adapter.vibrate(type);
    this.emit('feedback', { event: ev, deltas: deltas, type: type });
  };

  /** 玩家点「继续」→ 推进到下一个事件或阶段结算 */
  GameEngine.prototype.advance = function () {
    if (!this.state.revealed) return;
    var stage = this.currentStage();
    this.state.revealed = false;
    this.state.result = null;

    if (this.state.eventsInStage >= stage.eventCount) {
      this.state.stageRating = NS.EndingJudge.stageRating(this.state.attrs);
      this.state.phase = PHASE.SUMMARY;
    } else {
      this._drawNext();
    }
    this.saveGame();
    this.emit('change');
  };

  GameEngine.prototype.nextStage = function () {
    /*
     * 只允许从「阶段结算」推进到下一阶段。
     * 这既是语义约束，也是一道幂等保护：界面上一次点击若被重复触发
     * （H5 组件点击「$emit + 原生冒泡」双触发、或触摸穿透），第二次调用
     * 会因为 phase 已经不是 summary 而直接返回 —— 不会再连跳两级导致
     * 「转折期结算后跳过收尾期、直接进结果页」。
     */
    if (this.state.phase !== PHASE.SUMMARY) return;
    var next = this.state.stageIndex + 1;
    if (next < this.stages.length) {
      this._enterStage(next);
    } else {
      this._judge();
    }
  };

  /* ------------------------------------------------------------------ */
  /* 抉择回退：每个阶段里都能「返回上一件事」                              */
  /* ------------------------------------------------------------------ */

  /*
   * 为什么用「整帧快照」而不是「反向扣分」：
   *
   *   一次抉择会同时改动八处状态 —— 属性、flags、连锁队列、保底计数、
   *   已抽集合、阶段内计数、历史记录、随机数状态。想靠反推把每一处都还原，
   *   只要漏掉一处（比如保底计数），就会留下一个永远查不出来的偏移：
   *   测试照样通过、分布肉眼看着也正常，只有细心的玩家觉得「怎么感觉怪怪的」。
   *
   *   直接存一份抉择前的完整副本、回退时整体覆盖，是唯一能保证
   *   「精确等于什么都没选过」的做法。代价是每步多存一份属性 + 几个短数组，
   *   一局最多 14 帧，可以忽略。
   *
   *   随机数状态也要一起还原：这样「退回去重选同一个选项」会得到完全一样的
   *   后续事件，玩家不会觉得「我只是想改一下答案，怎么整个世界都变了」。
   */

  /** 拷一个 {k:true} 形式的集合（ES5 写法，保持逻辑层零新语法） */
  function copyMap(o) {
    var out = {};
    for (var k in o) {
      if (Object.prototype.hasOwnProperty.call(o, k)) out[k] = o[k];
    }
    return out;
  }

  GameEngine.prototype._pushBackFrame = function (ev, optionIndex) {
    this.choiceStack.push({
      stageIndex: this.state.stageIndex,
      eventsInStage: this.state.eventsInStage,
      consecutiveNeg: this.state.consecutiveNeg,
      chainQueue: this.state.chainQueue.slice(),
      drawnIds: copyMap(this.state.drawnIds),
      attrs: NS.AttrSystem.clone(this.state.attrs),
      flags: this.state.flags.slice(),
      history: this.state.history.slice(),
      /*
       * 阶段开始时的快照（翻盘用）也要一起存。
       * 跨阶段回退时它会被留在「上一个阶段」，不回滚的话一旦真的走到
       * C 级翻盘，回滚到的会是错的那个阶段起点。
       */
      stageSnapshot: this.state.stageSnapshot
        ? {
            attrs: NS.AttrSystem.clone(this.state.stageSnapshot.attrs),
            flags: this.state.stageSnapshot.flags.slice()
          }
        : null,
      rngState: this.rng._s,
      eventId: ev.id,
      picked: optionIndex
    });
  };

  /**
   * 还能往回退几步。0 表示停在阶段的第一件事上（界面上把按钮变灰）。
   * 注意它量的是「已做的抉择数」，所以刚进新阶段时不为 0 ——
   * 上一阶段最后那件事仍然可以退回去改。
   */
  GameEngine.prototype.backDepth = function () {
    return this.choiceStack ? this.choiceStack.length : 0;
  };

  /**
   * 返回上一件事（撤销最近一次抉择）。
   *
   * 同一个动作覆盖了两种场景，因为它们在数据上是同一件事：
   *   · 站在第 N 件事还没选 → 撤销第 N-1 件事的抉择，回到第 N-1 件事
   *   · 刚选完结果弹层开着 → 撤销这一次抉择，留在原地重选（「换一个选择」）
   *
   * @returns {boolean} 是否真的退了；栈空时返回 false，界面据此给提示
   */
  GameEngine.prototype.stageBack = function () {
    if (!this.choiceStack.length) return false;

    var f = this.choiceStack.pop();
    var s = this.state;

    s.stageIndex = f.stageIndex;
    s.eventsInStage = f.eventsInStage;
    s.consecutiveNeg = f.consecutiveNeg;
    s.chainQueue = f.chainQueue.slice();
    s.drawnIds = copyMap(f.drawnIds);
    s.attrs = NS.AttrSystem.clone(f.attrs);
    s.flags = f.flags.slice();
    s.history = f.history.slice();
    s.stageSnapshot = f.stageSnapshot
      ? {
          attrs: NS.AttrSystem.clone(f.stageSnapshot.attrs),
          flags: f.stageSnapshot.flags.slice()
        }
      : null;
    this.rng._s = f.rngState;

    s.currentEvent = this._findEvent(f.eventId);
    s.revealed = false;
    s.result = null;
    // 阶段结算页退回来时，这张评级卡已经不作数了
    s.stageRating = null;
    s.lastPick = f.picked;
    // 从阶段结算页退回来时 phase 是 summary，必须掰回 stage
    s.phase = PHASE.STAGE;

    /*
     * 兜底：万一这个事件 id 在当前事件表里找不到了（远程配置热更新把事件换掉
     * 是有可能的），不能把玩家留在一个 currentEvent 为 null 的界面上 ——
     * 那样连选项都没有，直接卡死。重抽一个继续。
     */
    if (!s.currentEvent) {
      s.lastPick = -1;
      this._drawNext();
    }

    this.saveGame();
    this.emit('change');
    return true;
  };

  /* ------------------------------------------------------------------ */
  /* 流程：结局与翻盘                                                    */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype._judge = function () {
    var r = NS.EndingJudge.judge({
      attrs: this.state.attrs,
      flags: this.state.flags,
      persona: this.state.persona,
      endings: this.endings,
      startCash: this.state.startCash,
      stageReached: this.stages.length
    });
    this.state.finalResult = r;
    this.state.playCount++;
    this._unlock(r);

    // 【广告暂时下线】不再触发「人生没有重来」翻盘弹层，C 级也直接进结局页。
    // 恢复翻盘时取消下面注释，并删掉最后那行 this.state.phase = PHASE.ENDING;
    // if (r.quality === 'C' && !this.state.reviveUsed) {
    //   this.state.phase = PHASE.REVIVE;
    // } else {
    //   this.state.phase = PHASE.ENDING;
    // }
    this.state.phase = PHASE.ENDING;
    /*
     * 一局到此结束，存档没有继续存在的理由，必须清掉。
     *
     * saveGame() 只在 stage / summary 两个阶段生效，所以最后一次真正落盘的
     * 是「最后一个阶段的结算」那一帧。不清的话，玩完之后回到首页会看到
     * 「继续上次的人生」—— 点进去被拉回终局前那一刻，再点一次「继续」会
     * 重新判一次结局、playCount 又加一。
     *
     * 注意顺序：必须在 _unlock / 翻盘判定【之后】清，因为翻盘（_doRevive）
     * 会重新进入阶段并写一份新存档，那是新时间线的续玩点。
     */
    this.clearSave();
    this.emit('change');
  };

  /**
   * 解锁图鉴条目。
   *
   * 除了写进 collection，还会把「本局第一次拿到的」记进 newUnlocks ——
   * 结局页靠它提示「解锁了 1 个新结局」。
   * 判断必须发生在 push 之前：集合本身不带时间戳，push 完就再也分不清
   * 这一条是老收藏还是刚拿到的了。
   */
  GameEngine.prototype._unlock = function (r) {
    var col = this.state.collection;
    var fresh = [];

    if (this.state.persona && col.personas.indexOf(this.state.persona.id) < 0) {
      col.personas.push(this.state.persona.id);
      fresh.push({
        kind: 'persona',
        id: this.state.persona.id,
        name: this.state.persona.name
      });
    }
    if (col.endings.indexOf(r.endingId) < 0) {
      col.endings.push(r.endingId);
      fresh.push({
        kind: 'ending',
        id: r.endingId,
        title: r.title,
        quality: r.quality,
        hidden: !!r.hidden
      });
    }

    this.state.newUnlocks = fresh;
    this._writeJSON(COLLECTION_KEY, col);
  };

  /* 【广告暂时下线】观看激励视频翻盘的方法先注释掉（翻盘入口已一并移除）。
  /// 观看激励视频翻盘：回退到第 4 阶段重来一次
  GameEngine.prototype.watchAdForRevive = function () {
    var self = this;
    if (!this.adapter.showRewardedVideo) {
      return Promise.reject(new Error('当前环境不支持广告'));
    }
    return this.adapter.showRewardedVideo('revive').then(function (ok) {
      if (!ok) return false;
      self._doRevive();
      return true;
    });
  };
  */

  GameEngine.prototype._doRevive = function () {
    var lastIndex = this.stages.length - 1;
    // 清掉最后阶段的事件记录，让它能被重新抽到
    for (var k in this.state.drawnIds) {
      if (!Object.prototype.hasOwnProperty.call(this.state.drawnIds, k)) continue;
      var ev = this._findEvent(k);
      if (ev && ev.stage === this.stages[lastIndex].id) delete this.state.drawnIds[k];
    }
    // 回滚到第 4 阶段开始时的属性快照
    if (this.state.stageSnapshot) {
      this.state.attrs = NS.AttrSystem.clone(this.state.stageSnapshot.attrs);
      this.state.flags = this.state.stageSnapshot.flags.slice();
    }
    this.state.reviveUsed = true;
    this.state.finalResult = null;
    this.state.phase = PHASE.STAGE;
    /*
     * 翻盘等于这一阶段重新开始，之前那些「抉择前快照」全部作废：
     * 它们记录的是翻盘前那条时间线上的属性，退回去会得到一个
     * 既不属于旧时间线、也不属于新时间线的混合状态。
     */
    this.choiceStack = [];
    // 重新进入最后阶段（此时 _enterStage 会用当前 attrs 覆盖快照，正是我们要的）
    this._enterStage(lastIndex);
  };

  GameEngine.prototype.skipRevive = function () {
    this.state.phase = PHASE.ENDING;
    this.emit('change');
  };

  GameEngine.prototype.toResultCard = function () {
    this.state.phase = PHASE.RESULT;
    this.emit('change');
  };

  /* ------------------------------------------------------------------ */
  /* 流程：重来 / 回首页                                                 */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype.replay = function () {
    var collection = this.state.collection;
    var playCount = this.state.playCount;
    var privacy = this.state.privacyAccepted;
    this.state = this._blankState();
    this.state.collection = collection;
    this.state.playCount = playCount;
    this.state.privacyAccepted = privacy;
    this.quiz = null;
    this.choiceStack = [];
    this.clearSave();
    this.startTest();
  };

  /**
   * 回首页。所有界面的页脚按钮都走这里。
   *
   * 刻意保持成【纯导航】：不写存档、也不清存档。
   * 存档的生命周期由「一局的开始与结束」决定（startTest 清、_judge 清、
   * 每次抉择后写），不该由「我看了一眼首页」决定 —— 导航函数带破坏性副作用，
   * 是那种平时没事、某个入口多点一次就吃掉玩家进度的隐患。
   *
   * 所以在阶段中途回首页是安全的：存档还在，首页会显示「继续上次的人生」。
   * 而在答题 / 建号中回首页相当于放弃这一局 —— 那两处本来就没有存档可丢。
   */
  GameEngine.prototype.goHome = function () {
    this.state.phase = PHASE.HOME;
    this.state.currentEvent = null;
    this.state.result = null;
    this.state.revealed = false;
    this.state.codexFocus = null;
    this.emit('change');
  };

  /* ------------------------------------------------------------------ */
  /* 图鉴                                                                */
  /* ------------------------------------------------------------------ */

  /**
   * 打开图鉴。
   * 刻意【不】动 stageIndex / attrs 之类的进度字段 —— 图鉴是个「随时可看、
   * 看完就回」的旁路界面，从首页进、回首页出，绝不能把正在进行的对局弄丢。
   */
  GameEngine.prototype.openCodex = function (tab) {
    if (tab === 'persona' || tab === 'ending') this.state.codexTab = tab;
    this.state.codexFocus = null;
    this.state.phase = PHASE.CODEX;
    this.emit('change');
  };

  GameEngine.prototype.closeCodex = function () {
    this.state.codexFocus = null;
    this.state.phase = PHASE.HOME;
    this.emit('change');
  };

  GameEngine.prototype.setCodexTab = function (tab) {
    if (tab !== 'persona' && tab !== 'ending') return;
    this.state.codexTab = tab;
    this.state.codexFocus = null;
    this.emit('change');
  };

  /** 打开 / 关闭某条图鉴的详情（传 null 关闭） */
  GameEngine.prototype.setCodexFocus = function (id) {
    this.state.codexFocus = id || null;
    this.emit('change');
  };

  /* ------------------------------------------------------------------ */
  /* 每日财运签                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * 取今天的签，并缓存到 state.daily。
   *
   * 缓存的意义：同一天里在首页与结果页之间来回切时不该反复重算，
   * 更重要的是保证「看到的那支签」和「内嵌在卡片里的数字」是同一份数据。
   * 抽签本身是幂等的（种子只由日期决定），所以缓存只是省算力，
   * 即使缓存丢了也不会出现前后不一致。
   */
  GameEngine.prototype.refreshDaily = function (force) {
    var key = NS.Daily.dateKey();
    if (!force && this.state.daily && this.state.daily.dateKey === key) {
      return this.state.daily;
    }
    this.state.daily = NS.Daily.draw({ dateKey: key, fortune: this.fortune });
    return this.state.daily;
  };

  /* ------------------------------------------------------------------ */
  /* 存档                                                                */
  /* ------------------------------------------------------------------ */

  GameEngine.prototype.saveGame = function () {
    if (!this.adapter.storage) return;
    var s = this.state;
    if (s.phase !== PHASE.STAGE && s.phase !== PHASE.SUMMARY) return;
    var data = {
      schemaVersion: SAVE_SCHEMA,
      phase: s.phase,
      personaId: s.persona ? s.persona.id : null,
      vector: s.vector,
      attrs: s.attrs,
      startCash: s.startCash,
      flags: s.flags,
      stageIndex: s.stageIndex,
      eventsInStage: s.eventsInStage,
      drawnIds: s.drawnIds,
      consecutiveNeg: s.consecutiveNeg,
      chainQueue: s.chainQueue,
      currentEventId: s.currentEvent ? s.currentEvent.id : null,
      eventBankKey: this.currentEventBank || null,
      stageSnapshot: s.stageSnapshot,
      reviveUsed: s.reviveUsed,
      history: s.history,
      rngState: this.rng._s
    };
    this._writeJSON(SAVE_KEY, data);
  };

  GameEngine.prototype.hasSave = function () {
    if (!this.adapter.storage) return false;
    var d = this._readJSON(SAVE_KEY);
    return !!(d && d.schemaVersion === SAVE_SCHEMA && d.attrs);
  };

  GameEngine.prototype.clearSave = function () {
    if (this.adapter.storage) this.adapter.storage.remove(SAVE_KEY);
  };

  /** 继续上次未完成的人生 */
  GameEngine.prototype.continueGame = function () {
    var d = this._readJSON(SAVE_KEY);
    if (!d) return false;

    var persona = null;
    for (var i = 0; i < this.personas.length; i++) {
      if (this.personas[i].id === d.personaId) persona = this.personas[i];
    }
    if (!persona) return false;

    var s = this.state;
    s.persona = persona;
    s.vector = d.vector;
    s.attrs = d.attrs;
    s.startCash = d.startCash;
    s.flags = d.flags || [];
    s.stageIndex = d.stageIndex || 0;
    s.eventsInStage = d.eventsInStage || 0;
    s.drawnIds = d.drawnIds || {};
    s.consecutiveNeg = d.consecutiveNeg || 0;
    s.chainQueue = d.chainQueue || [];
    s.stageSnapshot = d.stageSnapshot || null;
    s.reviveUsed = !!d.reviveUsed;
    s.history = d.history || [];
    this.rng._s = d.rngState || this.rng._s;

    // 恢复本局选中的事件库（整库随机）：保证续玩时抽到的事件与开局一致，
    // 且连锁事件（chain）能在同一套库内闭环。
    this.currentEventBank = d.eventBankKey || null;
    var evPool = this.events;
    if (this.currentEventBank && this.eventBanks) {
      for (var bi = 0; bi < this.eventBanks.length; bi++) {
        if (this.eventBanks[bi].key === this.currentEventBank) {
          evPool = this.eventBanks[bi].events;
          break;
        }
      }
    }
    this.draw = new NS.EventDraw({ events: evPool, rng: this.rng });

    s.currentEvent = this._findEvent(d.currentEventId);
    s.revealed = false;
    s.result = null;
    s.phase = d.phase === PHASE.SUMMARY ? PHASE.SUMMARY : PHASE.STAGE;

    /*
     * 回退栈不存档，读档后它就是空的 —— 所以这里要顺手清掉 lastPick。
     * 不清的话界面会高亮一个「其实还没结算」的选项（存档里那个事件是
     * 待选状态），玩家点继续会发现属性没变，像是丢了操作。
     */
    s.lastPick = -1;
    this.choiceStack = [];

    if (!s.currentEvent && s.phase === PHASE.STAGE) {
      this._drawNext();
    }
    this.emit('change');
    return true;
  };

  GameEngine.prototype._readJSON = function (key) {
    if (!this.adapter.storage) return null;
    var raw = this.adapter.storage.get(key);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      return null;
    }
  };

  GameEngine.prototype._writeJSON = function (key, obj) {
    if (!this.adapter.storage) return;
    try {
      this.adapter.storage.set(key, JSON.stringify(obj));
    } catch (e) {
      /* 存储满了就静默失败，不影响游戏 */
    }
  };

  NS.GameEngine = GameEngine;
  NS.GameEngine.PHASE = PHASE;
  NS.GameEngine.SAVE_KEY = SAVE_KEY;
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
