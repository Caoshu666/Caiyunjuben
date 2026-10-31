/**
 * tune.js —— 数值调参搜索工具
 *
 * simulate.js 告诉你「现在是多少」，tune.js 帮你找「应该改成多少」。
 * 它对「事件效果」和「阶段生活开销」施加一组缩放系数，跑模拟，
 * 算与目标分布的偏差，遍历若干组系数，把最接近目标的报出来。
 *
 * 用法：
 *   node tools/tune.js                # 默认网格搜索（108 组 × 3000 局）
 *   node tools/tune.js --n=8000       # 每组跑多少局
 *   node tools/tune.js --quick        # 缩小网格，快速试
 *
 * 拿到推荐系数后，按系数手工微调：
 *   - 事件数值 → data/tables/event.js 里各选项的 effect
 *   - 生活开销 → data/tables/stage.js 里的 upkeep
 * 改完用 simulate.js 复核。
 */
'use strict';

require('../core/registry.js');
require('../core/rng.js');
require('../core/expr-evaluator.js');
require('../core/attr-system.js');
require('../core/persona-resolver.js');
require('../core/test-engine.js');
require('../core/event-draw.js');
require('../core/ending-judge.js');
require('../core/daily.js');
require('../core/game-engine.js');

require('../data/tables/persona.js');
require('../data/tables/question.js');
require('../data/tables/stage.js');
require('../data/tables/event.js');
require('../data/tables/ending.js');
require('../data/tables/text.js');
require('../data/tables/balance.js');
require('../data/tables/fortune.js');
require('../data/config-loader.js');

var WS = globalThis.WS;

/**
 * 搜索时要把 balance.js 的标定系数关掉，否则 ConfigLoader 会把
 * 标定系数和我们正在搜索的系数叠加两次。
 */
WS.Tables.balance = {
  cashPos: 1, cashNeg: 1, otherPos: 1, otherNeg: 1, upkeep: 1, minAbs: 1
};

var args = {};
process.argv.slice(2).forEach(function (a) {
  var m = /^--([^=]+)=?(.*)$/.exec(a);
  if (m) args[m[1]] = m[2] === '' ? true : m[2];
});
var N = parseInt(args.n || '3000', 10);
var SEED = 20261016;

/**
 * 优化目标：现金终值的分位数，而不是「等级分布」。
 *
 * 为什么这样更好：等级分布依赖 ending-judge.js 里的阈值，阈值一改，
 * 目标函数就变了，搜索会追着一个移动的靶子跑。而分位数是分布本身的
 * 性质，与阈值无关。
 *
 * 想要 S 8% / A 27% / B 45% / C 20%，等价于要求：
 *   p20 ≈ 35   （B/C 分界）
 *   p65 ≈ 55   （A/B 分界）
 *   p92 ≈ 80   （S/A 分界）
 * 同时 p92 不能太接近 100，否则说明大量玩家的现金被 100 上限截断了。
 */
var QUANTILE_TARGET = { p20: 35, p65: 55, p92: 80 };

/* ---------------- 原始快照 ---------------- */
var RAW_EVENTS = JSON.parse(JSON.stringify(WS.Tables.event));
var RAW_STAGES = JSON.parse(JSON.stringify(WS.Tables.stage));

/* ---------------- 按系数生成配置 ---------------- */
function applyCoefficients(k) {
  var events = JSON.parse(JSON.stringify(RAW_EVENTS));
  events.forEach(function (ev) {
    ev.options.forEach(function (opt) {
      var src = opt.effect || {};
      var out = {};
      Object.keys(src).forEach(function (key) {
        var v = src[key];
        var scale;
        if (key === 'cash') scale = v >= 0 ? k.cashPos : k.cashNeg;
        else scale = v >= 0 ? k.otherPos : k.otherNeg;
        var nv = Math.round(v * scale);
        if (nv === 0 && v !== 0) nv = v > 0 ? 1 : -1;
        out[key] = nv;
      });
      opt.effect = out;
    });
  });
  WS.Tables.event = events;

  var stages = JSON.parse(JSON.stringify(RAW_STAGES));
  stages.forEach(function (s) {
    s.upkeep = Math.round(s.upkeep * k.upkeep);
  });
  WS.Tables.stage = stages;
}

function restore() {
  WS.Tables.event = JSON.parse(JSON.stringify(RAW_EVENTS));
  WS.Tables.stage = JSON.parse(JSON.stringify(RAW_STAGES));
}

/* ---------------- 无头适配器 ---------------- */
function headless() {
  var mem = {};
  return {
    storage: {
      get: function (key) { return mem[key] === undefined ? null : mem[key]; },
      set: function (key, v) { mem[key] = v; },
      remove: function (key) { delete mem[key]; }
    },
    vibrate: function () {},
    now: function () { return Date.now(); }
  };
}

/* ---------------- 跑一局 ---------------- */
function playOne(seed) {
  var config = new WS.ConfigLoader({});
  config.loadDefaults();
  var rng = new WS.Rng(seed);
  var engine = new WS.GameEngine({ adapter: headless(), config: config, rng: rng });

  engine.start();
  engine.acceptPrivacy();
  engine.startTest();

  var guard = 0;
  while (guard++ < 500) {
    var p = engine.state.phase;
    if (p === 'quiz') engine.answerQuiz(rng.int(engine.quiz.current().options.length));
    else if (p === 'build') engine.confirmBuild();
    else if (p === 'stage') {
      if (engine.state.revealed) engine.advance();
      else engine.chooseOption(rng.int(engine.state.currentEvent.options.length));
    } else if (p === 'summary') engine.nextStage();
    else if (p === 'revive') engine.skipRevive();
    else break;
  }
  var st = engine.state;
  return { q: st.finalResult ? st.finalResult.quality : 'C', attrs: st.attrs };
}

/* ---------------- 评估 ---------------- */
function quantile(sorted, p) {
  var idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[idx];
}

function evaluate(k, n) {
  applyCoefficients(k);
  var count = { S: 0, A: 0, B: 0, C: 0 };
  var attrSum = { cash: 0, social: 0, cognition: 0, guts: 0, luck: 0 };
  var cash = [];
  for (var i = 0; i < n; i++) {
    var r = playOne(SEED + i);
    count[r.q] = (count[r.q] || 0) + 1;
    WS.AttrSystem.ATTRS.forEach(function (key) { attrSum[key] += r.attrs[key]; });
    cash.push(r.attrs.cash);
  }
  restore();

  cash.sort(function (a, b) { return a - b; });
  var q = {
    p20: quantile(cash, 0.20),
    p65: quantile(cash, 0.65),
    p92: quantile(cash, 0.92),
    p99: quantile(cash, 0.99),
    median: quantile(cash, 0.5)
  };

  var score =
    Math.abs(q.p20 - QUANTILE_TARGET.p20) +
    Math.abs(q.p65 - QUANTILE_TARGET.p65) +
    Math.abs(q.p92 - QUANTILE_TARGET.p92);

  var dist = {};
  ['S', 'A', 'B', 'C'].forEach(function (x) { dist[x] = count[x] / n; });

  var avg = {};
  WS.AttrSystem.ATTRS.forEach(function (key) { avg[key] = attrSum[key] / n; });
  return { dist: dist, score: score, avg: avg, q: q };
}

/* ---------------- 网格搜索 ---------------- */
function grid() {
  var quick = !!args.quick;
  var cashPosList = quick ? [0.7, 0.85] : [0.9, 1.0, 1.1];
  var cashNegList = quick ? [0.9] : [0.4, 0.55, 0.7];
  var otherPosList = quick ? [0.65] : [0.55, 0.7];
  var upkeepList = quick ? [0.6, 0.8] : [0.45, 0.6, 0.75];

  var combos = [];
  cashPosList.forEach(function (cp) {
    cashNegList.forEach(function (cn) {
      otherPosList.forEach(function (op) {
        upkeepList.forEach(function (uk) {
          combos.push({
            cashPos: cp, cashNeg: cn, otherPos: op,
            otherNeg: Math.min(1.2, op + 0.2), upkeep: uk
          });
        });
      });
    });
  });

  console.log('');
  console.log('  网格搜索：' + combos.length + ' 组系数 × ' + N + ' 局');
  console.log('  优化目标：现金分位数 p20=35 / p65=55 / p92=80');
  console.log('');

  var results = combos.map(function (k, i) {
    var r = evaluate(k, N);
    process.stdout.write('\r  进度 ' + (i + 1) + '/' + combos.length + '   ');
    return { k: k, r: r };
  });
  process.stdout.write('\n');

  results.sort(function (a, b) { return a.r.score - b.r.score; });

  var f = function (n) { return (n * 100).toFixed(1) + '%'; };
  var p = function (n) { return n.toFixed(2).padStart(5); };
  var i4 = function (n) { return String(Math.round(n)).padStart(4); };

  console.log('');
  console.log('  ── Top 10（总分 = 三个分位数的偏差之和，越小越好）──');
  console.log('  总分  现金收益 现金损失 其他收益 生活开销 |  p20  p65  p92 | 中位数 |    S      A      B      C');
  results.slice(0, 10).forEach(function (item) {
    var k = item.k, d = item.r.dist, q = item.r.q;
    console.log(
      '  ' + i4(item.r.score) + '  ' +
      p(k.cashPos) + '  ' + p(k.cashNeg) + '  ' + p(k.otherPos) + '  ' + p(k.upkeep) +
      ' | ' + i4(q.p20) + ' ' + i4(q.p65) + ' ' + i4(q.p92) + ' | ' + i4(q.median) + ' | ' +
      f(d.S).padStart(6) + ' ' + f(d.A).padStart(6) + ' ' +
      f(d.B).padStart(6) + ' ' + f(d.C).padStart(6)
    );
  });

  var best = results[0];
  console.log('');
  console.log('  ── 最优组合 ──');
  console.log('    现金收益 ×' + best.k.cashPos + '     现金损失 ×' + best.k.cashNeg);
  console.log('    其他收益 ×' + best.k.otherPos + '     其他损失 ×' + best.k.otherNeg);
  console.log('    生活开销 ×' + best.k.upkeep);
  console.log('');
  console.log('    对应现金分位： p20=' + best.r.q.p20 + '  p65=' + best.r.q.p65 +
    '  p92=' + best.r.q.p92 + '  p99=' + best.r.q.p99);
  console.log('    → 建议把 ending-judge.js 的 GRADE_RULES 设为：');
  console.log('        S: cash >= ' + Math.min(99, best.r.q.p92 + 2) +
    '   A: cash >= ' + best.r.q.p65 + '   B: cash >= ' + best.r.q.p20);
  console.log('');
  console.log('  ── 对应属性终值 ──');
  WS.AttrSystem.ATTRS.forEach(function (key) {
    console.log('    ' + WS.AttrSystem.LABEL[key] + '  ' + best.r.avg[key].toFixed(1));
  });
  console.log('');
}

grid();
