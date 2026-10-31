/**
 * useGame.js —— 引擎 ↔ Vue 响应式桥
 *
 * ★ 为什么需要这一层（一个很容易踩的坑）：
 *
 *   GameEngine 是一个**可变对象**：它持有 this.state，并且在 chooseOption、
 *   advance、replay 等操作里直接改写它（replay 甚至会整个替换 this.state）。
 *
 *   直觉做法是 `const state = reactive(engine.state)`，但这会出两种问题：
 *     1) engine.replay() 执行 `this.state = this._blankState()`，
 *        reactive 代理指向的还是旧对象，界面就再也不更新了；
 *     2) 若改用 `computed(() => { tick.value; return engine.state })`，
 *        由于返回的永远是同一个对象引用，Vue 的 hasChanged 判定为「没变」，
 *        依赖它的组件不会重新渲染 —— 表现就是「点了没反应」。
 *
 *   所以这里采用**快照**策略：每次调用引擎动作后，把状态浅拷贝一份塞进 ref。
 *   新对象 = 引用必变 = 组件必然重渲染，而 attrs / collection 这些会被原地
 *   修改的部分再单独拷一层，避免子组件拿到陈旧引用。
 *
 *   代价是每次操作多一次小对象拷贝（几十个字段），对这个体量的游戏可以忽略。
 *   换来的是：逻辑层一行不用改，也能被 Vue 正确驱动。
 */
import { ref, computed, reactive, markRaw } from 'vue';
import WS from '../ws.js';
import { create as createPlatform, isWeixin, hasRewardedVideo } from '../platform/index.js';

const A = WS.AttrSystem;

/* ------------------------------------------------------------------ */
/* 单例：整个应用共享一个引擎                                            */
/* ------------------------------------------------------------------ */

let singleton = null;

function snapshot(eng) {
  const s = eng.state;
  const col = s.collection || { personas: [], endings: [] };
  return {
    phase: s.phase,
    privacyAccepted: s.privacyAccepted,
    persona: s.persona,
    vector: s.vector,
    // 会被原地改写的字段，必须拷一层，否则子组件收到的是同一个引用
    attrs: s.attrs ? Object.assign({}, s.attrs) : null,
    collection: {
      personas: (col.personas || []).slice(),
      endings: (col.endings || []).slice()
    },
    // 以下字段引擎都是整体替换，引用天然会变，无需深拷
    startCash: s.startCash,
    flags: s.flags,
    stageIndex: s.stageIndex,
    eventsInStage: s.eventsInStage,
    currentEvent: s.currentEvent,
    revealed: s.revealed,
    /** 上一次在这件事里选的下标（-1 = 没选过），供选项高亮 */
    lastPick: s.lastPick,
    result: s.result,
    finalResult: s.finalResult,
    stageRating: s.stageRating,
    reviveUsed: s.reviveUsed,
    playCount: s.playCount,
    history: s.history,
    /* ---- 图鉴 ---- */
    codexTab: s.codexTab,
    codexFocus: s.codexFocus,
    newUnlocks: (s.newUnlocks || []).slice(),
    /* ---- 每日财运签（引擎整体替换该对象，引用天然会变） ---- */
    daily: s.daily
  };
}

function boot(opts) {
  if (singleton) return singleton;

  opts = opts || {};

  const { adapter, sfx } = createPlatform({ adUnitId: '' });
  const config = new WS.ConfigLoader({ patchUrl: '' });
  config.loadDefaults();

  /*
   * seed 只给测试用（tools/reactivity.test.mjs 会传一个固定值）。
   * 生产环境必须不传 —— 引擎默认用时间做种子，这样每次开局的题序、
   * 事件抽取才会不同；写死种子会让所有玩家玩到一模一样的一局。
   * 之所以留这个口子而不是让测试去 mock Date：mock 时间会同时影响
   * 每日财运签的日期，两个变量纠缠在一起，测试失败时很难定位。
   */
  const engine = new WS.GameEngine({ adapter: adapter, config: config, seed: opts.seed });

  const state = ref(snapshot(engine));
  const toastMsg = ref('');
  const toastAt = ref(0);
  const busy = ref(false);
  const busyText = ref('');
  /**
   * 结果卡导出的临时图片路径，供小程序 onShareAppMessage 当分享封面。
   *
   * 页面层的分享回调拿不到组件里的 canvas，只能由结果页组件导出后写到
   * 这里中转；空串表示还没备好，分享时回退微信默认截图。
   */
  const shareImage = ref('');

  /*
   * 有没有可续玩的存档。
   *
   * 必须在 sync() 之前声明 —— sync 会在本函数体里被直接调用一次（启动时），
   * 而它要写这个 ref。放到下面跟其他 computed 摆在一起虽然更好看，
   * 但会撞上 const 的暂时性死区，启动即报错。
   */
  const hasSave = ref(engine.hasSave());

  /** 引擎状态 → Vue。每次动作之后调一次 */
  function sync() {
    /*
     * 顺手检查一次「是否跨天了」。
     *
     * 小程序 / App 会长时间驻留后台，玩家第二天从后台切回来时进程并没有重启，
     * 不做这一步的话首页会一直显示昨天的签。refreshDaily(false) 在同一天内
     * 直接返回缓存、零开销，所以放在这里没有性能顾虑。
     */
    engine.refreshDaily(false);
    /*
     * hasSave 也必须在这里刷新，而不是只在几个「显而易见的」动作里刷新。
     *
     * 存档的有无会被三处动作改变：开局（startTest 清）、一局结束（_judge 清）、
     * 走到阶段（落盘）。逐个在动作里补刷新，只要漏掉一条路径，首页就会出现
     * 一个点下去报「存档已失效」的死按钮 —— 那比不显示按钮更让人困惑。
     * 统一挂在 sync 上，谁都漏不掉；一次 JSON.parse 的开销可以忽略。
     */
    hasSave.value = engine.hasSave();
    state.value = snapshot(engine);
  }

  function showToast(msg, ms) {
    toastMsg.value = msg;
    toastAt.value = Date.now() + (ms || 2000);
    setTimeout(function () {
      if (Date.now() >= toastAt.value) toastMsg.value = '';
    }, (ms || 2000) + 20);
  }

  /** 包一层：动作 → 同步状态。顺带统一处理异常，避免一处报错整个界面白屏 */
  function act(fn) {
    return function () {
      let out;
      try {
        out = fn.apply(null, arguments);
      } catch (e) {
        if (typeof console !== 'undefined') console.error('[WS] 动作执行异常', e);
        showToast('出了点问题，请重试');
        return undefined;
      }
      sync();
      return out;
    };
  }

  // 引擎的瞬时反馈（音效 + 震动）
  engine.on('feedback', function (e) {
    const map = { positive: 'positive', negative: 'negative', strong: 'strong' };
    sfx.play(map[e.type] || 'tap');
  });
  engine.on('reject', function () {
    showToast('需要同意后才能进入游戏');
  });

  // 启动：读存档、判断是否要弹隐私协议
  engine.start();
  sync();

  // 异步拉远程配置，失败静默降级（不阻塞、不报错）
  try {
    config.fetchPatch(adapter, function () {
      /* 拉不到就用包内配置，属于预期情况 */
    });
  } catch (e) {
    /* ignore */
  }

  /* ---------------- 界面路由 ---------------- */

  const SCREEN_OF = {
    boot: 'home',
    privacy: 'privacy',
    home: 'home',
    codex: 'codex',
    quiz: 'quiz',
    build: 'build',
    stage: 'stage',
    summary: 'summary',
    ending: 'ending',
    revive: 'ending', // 翻盘弹层叠在结局页上
    result: 'result'
  };

  const screen = computed(function () {
    return SCREEN_OF[state.value.phase] || 'home';
  });

  const currentStage = computed(function () {
    return engine.stages[state.value.stageIndex] || null;
  });

  const nextStage = computed(function () {
    return engine.stages[state.value.stageIndex + 1] || null;
  });

  const totalStages = computed(function () {
    return engine.stages.length;
  });

  /**
   * ⚠️ 注意下面两个 computed 开头的 `state.value;` —— 它不是废话，是必需的。
   *
   * computed 只会缓存「依赖的响应式数据没变」的结果。而 quiz 的进度、当前题目
   * 都只存在 engine.quiz 这个**非响应式**对象里，不碰 state.value 的话，Vue 会
   * 认为没有任何依赖，首次求值后永久缓存 —— 表现就是答题时题目永远停在第一题。
   * 手动读一下 state.value，就能把这两个 computed 挂到「每次引擎动作都会更新的
   * 快照」上，从而正确地重算。
   */

  /** 测试进度 0~1 */
  const quizProgress = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    if (!engine.quiz) return 0;
    return engine.quiz.progress();
  });

  /** 当前题目（选项顺序已在引擎内部打乱） */
  const currentQuestion = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.quiz ? engine.quiz.current() : null;
  });

  /** 当前题目序号（从 1 开始），用于「第 N / 8 题」 */
  const quizIndex = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.quiz ? engine.quiz.index + 1 : 1;
  });

  /** 题目总数 */
  const quizTotal = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.quiz ? engine.quiz.total() : 8;
  });

  /**
   * 当前题此前选过的选项下标（没选过为 -1）。
   * 返回上一题时用它把原来的选择高亮出来 —— 否则玩家退回去只看到一道
   * 「什么都没选」的题，会怀疑自己的答案丢了。
   */
  const quizChoice = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.quiz ? engine.quiz.currentChoice() : -1;
  });

  /** 能不能返回上一题（第一题时为 false，界面据此隐藏按钮） */
  const canQuizBack = computed(function () {
    return quizIndex.value > 1;
  });

  /* ---------------- 阶段抉择回退 ---------------- */

  /**
   * 上一次在这件事里选的选项下标（-1 = 没选过）。用来把退回后的原选择高亮出来。
   * 直接读快照即可，引擎在 _drawNext() 里会把它清成 -1。
   */
  const stageChoice = computed(function () {
    const v = state.value.lastPick;
    return typeof v === 'number' ? v : -1;
  });

  /**
   * 还能不能返回上一件事。
   *
   * ⚠️ 和上面的 quiz 系列同理：回退栈存在 engine.choiceStack 这个非响应式
   * 对象里，必须先读一下 state.value 才有依赖，否则首次求值后会被永久缓存 ——
   * 表现就是「第一次进阶段没有按钮，之后也永远没有」。
   */
  const canStageBack = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.backDepth() > 0;
  });

  /** 还有几步可以退（用于显示，也方便测试断言） */
  const stageBackDepth = computed(function () {
    state.value; // eslint-disable-line no-unused-expressions
    return engine.backDepth();
  });

  /* ---------------- 图鉴视图数据 ---------------- */

  const CODEX_GRADES = ['S', 'A', 'B', 'C'];

  /**
   * 图鉴数据 = 配置表（静态） × collection（动态）。
   *
   * 为什么在桥接层拼，而不是让图鉴组件自己拼：
   *   首页要显示「人格 3/10、结局 5/43」，图鉴页要显示同一套进度。
   *   两处各算一份，迟早会出现「首页说 5，点进去数出 4」。放这里只有一份，
   *   而且能在 tools/ 下脱离界面直接断言。
   *
   * ⚠️ 必须显式读 state.value.collection。
   *   config.get(...) 拿到的表是 markRaw 的（非响应式），只读它的话
   *   computed 会被永久缓存 —— 表现就是玩完一局回到图鉴，新解锁的条目看不见。
   */
  const codexData = computed(function () {
    const col = state.value.collection || { personas: [], endings: [] };
    const pSet = {};
    (col.personas || []).forEach(function (id) {
      pSet[id] = true;
    });
    const eSet = {};
    (col.endings || []).forEach(function (id) {
      eSet[id] = true;
    });

    const rawPersonas = config.get('persona') || [];
    const rawEndings = config.get('ending') || [];

    const personas = rawPersonas.map(function (p) {
      return {
        id: p.id,
        name: p.name,
        badge: p.badge,
        color: p.color,
        desc: p.desc,
        bias: p.attrBias || {},
        unlocked: !!pSet[p.id]
      };
    });

    const endings = rawEndings
      .filter(function (e) {
        return !e.hidden;
      })
      .map(function (e) {
        const grades = CODEX_GRADES.map(function (g) {
          const gd = (e.grades && e.grades[g]) || {};
          return {
            grade: g,
            unlocked: !!eSet[e.id + '_' + g],
            narration: gd.narration || ''
          };
        });
        let done = 0;
        grades.forEach(function (x) {
          if (x.unlocked) done++;
        });
        return {
          id: e.id,
          personaId: e.personaId,
          title: e.title,
          grades: grades,
          unlockedCount: done
        };
      });

    const hidden = rawEndings
      .filter(function (e) {
        return !!e.hidden;
      })
      .map(function (e) {
        return {
          id: e.id,
          title: e.title,
          narration: e.narration || '',
          unlocked: !!eSet[e.id]
        };
      });

    let personaDone = 0;
    personas.forEach(function (x) {
      if (x.unlocked) personaDone++;
    });

    let endingDone = 0;
    endings.forEach(function (x) {
      endingDone += x.unlockedCount;
    });
    hidden.forEach(function (x) {
      if (x.unlocked) endingDone++;
    });

    return {
      personas: personas,
      endings: endings,
      hidden: hidden,
      personaDone: personaDone,
      personaTotal: personas.length,
      endingDone: endingDone,
      endingTotal: endings.length * CODEX_GRADES.length + hidden.length
    };
  });

  /** 按 id 取人格（图鉴的结局分组要显示人格徽章） */
  function personaById(id) {
    const list = config.get('persona') || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /** '2026-10-16' → '10 月 16 日' */
  function dateLabel(key) {
    const p = String(key || '').split('-');
    if (p.length !== 3) return '';
    return Number(p[1]) + ' 月 ' + Number(p[2]) + ' 日';
  }

  /** 今日财运签。state.daily 由引擎在 start / sync 时保证已填充 */
  const daily = computed(function () {
    return state.value.daily || null;
  });

  /* ---------------- 暴露给界面的动作 ---------------- */

  const actions = {
    acceptPrivacy: act(function () { engine.acceptPrivacy(); }),
    rejectPrivacy: act(function () { engine.rejectPrivacy(); }),

    /*
     * startTest 会清掉旧存档（开新局 = 作废上一局的续玩点）。
     * hasSave 的统一刷新在 sync() 里，这里不用重复。
     */
    startTest: act(function () { engine.startTest(); }),
    answerQuiz: act(function (i) { engine.answerQuiz(i); }),
    /** 返回上一题改答案 */
    quizBack: act(function () { engine.quizBack(); }),
    /** 从「你的财运人格」页回答题页改答案 */
    editQuiz: act(function () { engine.editQuiz(); }),

    /* ---- 图鉴 ---- */
    openCodex: act(function (tab) { engine.openCodex(tab); }),
    closeCodex: act(function () { engine.closeCodex(); }),
    setCodexTab: act(function (tab) { engine.setCodexTab(tab); }),
    setCodexFocus: act(function (id) { engine.setCodexFocus(id); }),

    confirmBuild: act(function () { engine.confirmBuild(); }),

    chooseOption: act(function (i) { engine.chooseOption(i); }),
    advance: act(function () { engine.advance(); }),
    nextStage: act(function () { engine.nextStage(); }),
    /** 返回上一件事（撤销最近一次抉择）。返回是否真的退了，界面据此提示 */
    stageBack: act(function () { return engine.stageBack(); }),

    skipRevive: act(function () { engine.skipRevive(); }),
    toResultCard: act(function () { engine.toResultCard(); }),

    replay: act(function () { engine.replay(); }),
    goHome: act(function () { engine.goHome(); }),
    continueGame: act(function () {
      const ok = engine.continueGame();
      if (!ok) showToast('存档已失效，请重新开始');
    }),

    /** 看激励视频翻盘。返回是否成功，供界面决定是否收起弹层 */
    watchAd: function () {
      busy.value = true;
      busyText.value = hasRewardedVideo() ? '广告播放中…' : '正在模拟广告…';
      return engine
        .watchAdForRevive()
        .then(function (ok) {
          busy.value = false;
          sync();
          if (ok) sfx.play('strong');
          else showToast('广告未看完，无法翻盘');
          return ok;
        })
        .catch(function () {
          busy.value = false;
          showToast('当前环境不支持广告');
          return false;
        });
    },

    /**
     * 看激励视频后才放行「看看我的结果卡」。
     *
     * 和 watchAd 的区别：这里不涉及状态机，只是「播完广告再执行一个普通动作」，
     * 所以编排放在桥接层，不往引擎里加方法。看完才 engine.toResultCard()，
     * 没看完就停在结局页，避免「不看广告也能拿奖励」。
     */
    watchAdForResultCard: function () {
      busy.value = true;
      busyText.value = hasRewardedVideo() ? '广告播放中…' : '正在模拟广告…';
      return adapter
        .showRewardedVideo('result_card')
        .then(function (ok) {
          busy.value = false;
          if (!ok) {
            showToast('广告未看完，暂时看不了结果卡');
            return false;
          }
          engine.toResultCard();
          sync();
          return true;
        })
        .catch(function () {
          busy.value = false;
          showToast('当前环境不支持广告');
          return false;
        });
    }
  };

  /* ---------------- 工具方法 ---------------- */

  /** 文案查表：t('quizProgress', { n: 1, total: 8 }) */
  function t(key, vars) {
    return engine.t(key, vars);
  }

  /** 结果卡的「全服仅 X%」—— 无服务端时用稳定哈希模拟，保证同一结局数值一致 */
  function pseudoPercent(endingId) {
    let h = 2166136261;
    const s = String(endingId);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const r = ((h >>> 0) % 1000) / 1000;
    if (s.indexOf('_S') >= 0) return (1.2 + r * 6).toFixed(1);
    if (s.indexOf('_A') >= 0) return (9 + r * 14).toFixed(1);
    if (s.indexOf('_B') >= 0) return (28 + r * 20).toFixed(1);
    return (55 + r * 25).toFixed(1);
  }

  /*
   * 用 reactive 包一层，是为了让模板里能写 `game.state.phase` 而不是
   * `game.state.value.phase` —— reactive 会自动解包直接挂在它下面的 ref。
   *
   * 但 engine / sfx / adapter / config 一定要 markRaw 掉：
   * 否则 Vue 会递归地把整个引擎（包括它持有的全部配置表、每次抽取的事件对象）
   * 都变成 Proxy，既有性能开销，又会破坏引擎内部的引用相等判断。
   * 这四样东西本来就不需要响应式 —— 状态的响应式由上面的 state 快照负责。
   */
  singleton = reactive({
    engine: markRaw(engine),
    adapter: markRaw(adapter),
    sfx: markRaw(sfx),
    config: markRaw(config),

    state: state,
    screen: screen,
    currentStage: currentStage,
    nextStage: nextStage,
    totalStages: totalStages,
    quizProgress: quizProgress,
    currentQuestion: currentQuestion,
    quizIndex: quizIndex,
    quizTotal: quizTotal,
    quizChoice: quizChoice,
    canQuizBack: canQuizBack,

    /* 阶段抉择回退 */
    stageChoice: stageChoice,
    canStageBack: canStageBack,
    stageBackDepth: stageBackDepth,

    hasSave: hasSave,

    /* 图鉴与每日签 */
    codexData: codexData,
    daily: daily,
    GRADES: CODEX_GRADES,
    personaById: personaById,
    dateLabel: dateLabel,

    toastMsg: toastMsg,
    busy: busy,
    busyText: busyText,
    shareImage: shareImage,
    showToast: showToast,

    actions: actions,
    t: t,
    pseudoPercent: pseudoPercent,

    // 常量与工具，直接透出，省得各组件反复 import
    ATTRS: A.ATTRS,
    LABEL: A.LABEL,
    CRISIS_LINE: A.CRISIS_LINE,
    isWeixin: isWeixin(),
    hasRewardedVideo: hasRewardedVideo()
  });

  return singleton;
}

/**
 * 组件里统一 `const game = useGame()` 取用。
 * @param {{seed?:number}} [opts] 仅测试使用，见 boot() 里的说明
 */
export function useGame(opts) {
  return boot(opts);
}

export default useGame;
