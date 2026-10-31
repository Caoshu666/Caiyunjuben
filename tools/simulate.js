/**
 * simulate.js —— 离线数值模拟
 *
 * 这是「逻辑层与表现层解耦」带来的最大收益：同一套玩法代码可以在 Node 里
 * 直接跑，不需要 canvas、不需要微信环境，用来验证数值平衡。
 *
 * 用法：
 *   node tools/simulate.js                # 默认 20000 局
 *   node tools/simulate.js --n=100000     # 跑 10 万局
 *   node tools/simulate.js --seed=12345   # 固定种子，结果可复现
 *
 * 判读标准（设计文档定的目标分布）：
 *   S 约 8% / A 约 27% / B 约 45% / C 约 20%
 * 偏离太多就说明数值该调了 —— 调 event.js 里的 effect 数字即可，不用动代码。
 */
'use strict';

/* ---------- 载入逻辑层与配置表（与 game.js 完全一致的顺序） ---------- */
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

/* ---------- 参数解析 ---------- */
var args = {};
process.argv.slice(2).forEach(function (a) {
  var m = /^--([^=]+)=?(.*)$/.exec(a);
  if (m) args[m[1]] = m[2] === '' ? true : m[2];
});
var N = parseInt(args.n || '20000', 10);
var SEED = args.seed !== undefined ? parseInt(args.seed, 10) : 20261016;
var SHOW_ATTRS = !!args.attrs;

/* ---------- 无头适配器：模拟里不需要画布、广告、震动 ---------- */
function createHeadlessAdapter() {
  var mem = {};
  return {
    storage: {
      get: function (k) { return mem[k] === undefined ? null : mem[k]; },
      set: function (k, v) { mem[k] = v; },
      remove: function (k) { delete mem[k]; }
    },
    vibrate: function () {},
    now: function () { return Date.now(); }
  };
}

/* ---------- 跑一局 ---------- */
function playOne(seed) {
  var config = new WS.ConfigLoader({});
  config.loadDefaults();

  var rng = new WS.Rng(seed);
  var engine = new WS.GameEngine({
    adapter: createHeadlessAdapter(),
    config: config,
    rng: rng
  });

  engine.start();
  engine.acceptPrivacy();
  engine.startTest();

  var guard = 0;
  while (guard++ < 500) {
    var phase = engine.state.phase;

    if (phase === 'quiz') {
      var opts = engine.quiz.current().options.length;
      engine.answerQuiz(rng.int(opts));
    } else if (phase === 'build') {
      engine.confirmBuild();
    } else if (phase === 'stage') {
      if (engine.state.revealed) {
        engine.advance();
      } else {
        var ev = engine.state.currentEvent;
        engine.chooseOption(rng.int(ev.options.length));
      }
    } else if (phase === 'summary') {
      engine.nextStage();
    } else if (phase === 'revive') {
      // 模拟里不去看广告，直接看结局
      engine.skipRevive();
    } else if (phase === 'ending') {
      break;
    } else if (phase === 'home') {
      engine.startTest();
    } else {
      break;
    }
  }

  var st = engine.state;
  return {
    quality: st.finalResult ? st.finalResult.quality : '?',
    hidden: st.finalResult ? !!st.finalResult.hidden : false,
    endingId: st.finalResult ? st.finalResult.endingId : '?',
    endingTitle: st.finalResult ? st.finalResult.title : '?',
    index: st.finalResult ? st.finalResult.index : 0,
    indexBand: st.finalResult ? st.finalResult.indexLabel : '?',
    persona: st.persona ? st.persona.id : '?',
    personaName: st.persona ? st.persona.name : '?',
    attrs: st.attrs,
    startCash: st.startCash,
    vector: st.vector,
    steps: st.history.length,
    flags: st.flags
  };
}

/* ---------- 跑 N 局并统计 ---------- */
function run() {
  var t0 = Date.now();
  var quality = { S: 0, A: 0, B: 0, C: 0 };
  var personaCount = {};
  var endingCount = {};
  var hiddenCount = {};
  var attrSum = { cash: 0, social: 0, cognition: 0, guts: 0, luck: 0 };
  var attrMin = { cash: 999, social: 999, cognition: 999, guts: 999, luck: 999 };
  var attrMax = { cash: -999, social: -999, cognition: -999, guts: -999, luck: -999 };
  var stepsSum = 0;
  var bustCount = 0;   // 现金被打到 20 以下的局数
  var richCount = 0;   // 现金 80 以上的局数
  var cashSamples = [];
  var indexSamples = [];
  var bandCount = {};

  for (var i = 0; i < N; i++) {
    var r = playOne(SEED + i);

    quality[r.quality] = (quality[r.quality] || 0) + 1;
    personaCount[r.personaName] = (personaCount[r.personaName] || 0) + 1;
    endingCount[r.endingTitle] = (endingCount[r.endingTitle] || 0) + 1;
    if (r.hidden) hiddenCount[r.endingTitle] = (hiddenCount[r.endingTitle] || 0) + 1;
    stepsSum += r.steps;
    indexSamples.push(r.index);
    bandCount[r.indexBand] = (bandCount[r.indexBand] || 0) + 1;

    var keys = WS.AttrSystem.ATTRS;
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      var v = r.attrs[key];
      attrSum[key] += v;
      if (v < attrMin[key]) attrMin[key] = v;
      if (v > attrMax[key]) attrMax[key] = v;
    }
    if (r.attrs.cash <= 20) bustCount++;
    if (r.attrs.cash >= 80) richCount++;
    cashSamples.push(r.attrs.cash);
  }

  var ms = Date.now() - t0;
  var pct = function (n) { return ((n / N) * 100).toFixed(2) + '%'; };
  var line = function (ch, len) { return new Array(len + 1).join(ch); };

  console.log('');
  console.log(line('=', 62));
  console.log('  我的财运剧本 · 数值模拟报告');
  console.log(line('=', 62));
  console.log('  模拟局数 : ' + N + '    种子起点 : ' + SEED + '    耗时 : ' + ms + ' ms');
  console.log('  平均每局抉择次数 : ' + (stepsSum / N).toFixed(2) + ' 次');
  console.log(line('-', 62));

  console.log('\n【结局品质分布】  目标  S 8% / A 27% / B 45% / C 20%');
  ['S', 'A', 'B', 'C'].forEach(function (q) {
    var n = quality[q] || 0;
    var bar = line('#', Math.round((n / N) * 50));
    console.log('  ' + q + '  ' + pad(pct(n), 8) + ' ' + bar);
  });

  console.log('\n【隐藏结局触发】');
  var hiddenTotal = 0;
  Object.keys(hiddenCount).forEach(function (t) {
    hiddenTotal += hiddenCount[t];
    console.log('  ' + pad(t, 16) + pad(hiddenCount[t] + ' 局', 12) + pct(hiddenCount[t]));
  });
  if (hiddenTotal === 0) console.log('  （本次模拟未触发任何隐藏结局）');
  console.log('  合计占比 ' + pct(hiddenTotal));

  console.log('\n【人格分布】');
  Object.keys(personaCount).sort(function (a, b) {
    return personaCount[b] - personaCount[a];
  }).forEach(function (name) {
    console.log('  ' + pad(name, 16) + pad(personaCount[name] + ' 局', 12) + pct(personaCount[name]));
  });

  console.log('\n【结局名分布】');
  Object.keys(endingCount).sort(function (a, b) {
    return endingCount[b] - endingCount[a];
  }).forEach(function (name) {
    console.log('  ' + pad(name, 16) + pad(endingCount[name] + ' 局', 12) + pct(endingCount[name]));
  });

  console.log('\n【属性终值统计】');
  console.log('  ' + pad('属性', 10) + pad('均值', 10) + pad('最小', 8) + pad('最大', 8));
  WS.AttrSystem.ATTRS.forEach(function (key) {
    console.log('  ' + pad(WS.AttrSystem.LABEL[key], 10) +
      pad((attrSum[key] / N).toFixed(1), 10) +
      pad(attrMin[key], 8) + pad(attrMax[key], 8));
  });

  console.log('\n【极端局占比】');
  console.log('  现金 ≤ 20（濒临破产）: ' + pct(bustCount));
  console.log('  现金 ≥ 80（富足收官）: ' + pct(richCount));

  console.log('\n【现金终值分位数】（用来决定结局阈值应该卡在哪儿）');
  var c = cashSamples.slice().sort(function (a, b) { return a - b; });
  [5, 10, 20, 30, 40, 50, 60, 65, 70, 80, 90, 92, 95, 99].forEach(function (p) {
    var idx = Math.min(c.length - 1, Math.floor((p / 100) * c.length));
    console.log('  p' + String(p).padStart(2) + '  ' + String(c[idx]).padStart(4));
  });
  console.log('\n  参照：若目标为 S 8% / A 27% / B 45% / C 20%，');
  console.log('  则阈值大约应卡在  p20=' + c[Math.floor(0.2 * c.length)] +
    '（B/C 分界）、p65=' + c[Math.floor(0.65 * c.length)] +
    '（A/B 分界）、p92=' + c[Math.floor(0.92 * c.length)] + '（S/A 分界）');

  /*
   * 财运指数分布。
   * 这一节存在的意义：ending-judge.js 里的 INDEX_BANDS 阈值必须和实际分布对上，
   * 否则会出现「指数 62 显示成财神眷顾」这种一眼假的档位。改完事件数值后
   * 重跑本脚本，看这里的分位再回头调 INDEX_BANDS。
   */
  console.log('\n【财运指数分布】（决定 core/ending-judge.js 的 INDEX_BANDS 阈值）');
  var ix = indexSamples.slice().sort(function (a, b) { return a - b; });
  var quant = function (p) {
    return ix[Math.min(ix.length - 1, Math.floor((p / 100) * ix.length))];
  };
  console.log('  均值 ' + (indexSamples.reduce(function (s, v) { return s + v; }, 0) / N).toFixed(1) +
    '   最小 ' + ix[0] + '   最大 ' + ix[ix.length - 1]);
  console.log('  p10=' + quant(10) + '  p25=' + quant(25) + '  p50=' + quant(50) +
    '  p75=' + quant(75) + '  p90=' + quant(90) + '  p95=' + quant(95));

  console.log('\n  当前档位命中率：');
  WS.EndingJudge.INDEX_BANDS.forEach(function (b) {
    var n = bandCount[b.label] || 0;
    console.log('  ' + pad(b.label, 12) + pad('≥' + b.min, 8) + pct(n));
  });

  console.log('\n' + line('=', 62));
  console.log('  调参提示：改 data/tables/event.js 里各选项的 effect 数值即可，');
  console.log('  不需要改任何代码。改完重跑本脚本对比分布。');
  console.log(line('=', 62));
  console.log('');
}

function pad(s, n) {
  s = String(s);
  while (s.length < n) s += ' ';
  return s;
}

run();
