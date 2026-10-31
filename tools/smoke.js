/**
 * smoke.js —— 冒烟测试
 *
 * 上游版本跑的是「用假 Canvas 渲染 8 个界面」，挪到 uni-app 之后那套失效了：
 * 界面已经是 Vue 组件，渲染要跑真编译器，不是 Node 里造假对象能覆盖的。
 *
 * 所以这一版换了两个更有价值的验证面：
 *
 *   A. 逻辑链路 —— 用假适配器把一局游戏从头走到尾（含存档续玩、翻盘分支），
 *      每个关卡都断言状态机的迁移是否符合预期。这部分是真跑，不是静态检查。
 *   B. 工程结构 —— 这是 uni-app 项目最容易悄悄出错的地方：组件路径写错、
 *      新增的 core 模块忘了在 index.js 里 import、逻辑层不小心引了平台 API、
 *      误用了被小程序禁止的 eval。这些错误在 H5 预览里可能看不出来，
 *      但要等到编译小程序时才炸。这里用静态扫描提前拦下来。
 *
 * 用法：node tools/smoke.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let failures = 0;
let checks = 0;

function ok(msg) {
  checks++;
  console.log('  \u2713 ' + msg);
}
function fail(msg) {
  checks++;
  failures++;
  console.log('  \u2717 ' + msg);
}
function assert(cond, msg) {
  if (cond) ok(msg);
  else fail(msg);
}
function section(title) {
  console.log('\n' + title);
  console.log('-'.repeat(64));
}

/* ================================================================== */
/* A. 逻辑链路                                                         */
/* ================================================================== */

require('../core/registry.js');
[
  'rng',
  'expr-evaluator',
  'attr-system',
  'persona-resolver',
  'test-engine',
  'event-draw',
  'ending-judge',
  'daily',
  'game-engine'
].forEach((m) => require('../core/' + m + '.js'));
['persona', 'question', 'stage', 'event', 'ending', 'text', 'balance', 'fortune'].forEach((t) =>
  require('../data/tables/' + t + '.js')
);
require('../data/config-loader.js');

const WS = globalThis.WS;

/** 内存版适配器：不碰 uni.*，纯粹满足引擎的接口契约 */
function mockAdapter() {
  const store = {};
  return {
    name: 'mock',
    storage: {
      get(k) {
        return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
      },
      set(k, v) {
        store[k] = v;
      },
      remove(k) {
        delete store[k];
      }
    },
    vibrate() {},
    showRewardedVideo() {
      return Promise.resolve(true);
    },
    share() {
      return Promise.resolve(true);
    },
    saveFile() {
      return Promise.resolve(true);
    },
    getJSON(url, cb) {
      cb(new Error('test env has no network'));
    },
    now() {
      return Date.now();
    }
  };
}

function newEngine(adapter, seed) {
  const config = new WS.ConfigLoader({ patchUrl: '' });
  config.loadDefaults();
  const engine = new WS.GameEngine({ adapter, config, seed });
  engine.start();
  return engine;
}

/**
 * 把一局游戏走到结局。
 * @param {number} picker 选项选择策略，默认永远选第一个
 * @returns {Object} engine
 */
function playFullGame(engine, picker) {
  picker = picker || function () { return 0; };

  // 隐私协议
  if (engine.state.phase === 'privacy') engine.acceptPrivacy();

  // 测试：一直答题直到离开 quiz
  engine.startTest();
  let quizGuard = 0;
  while (engine.state.phase === 'quiz' && quizGuard++ < 50) {
    engine.answerQuiz(0);
  }
  if (engine.state.phase !== 'build') return engine;

  engine.confirmBuild();

  // 阶段循环：选选项 → 推进，直到进入 summary
  let guard = 0;
  while (
    (engine.state.phase === 'stage' || engine.state.phase === 'summary') &&
    guard++ < 500
  ) {
    if (engine.state.phase === 'stage') {
      if (!engine.state.revealed) {
        engine.chooseOption(picker(engine));
      } else {
        engine.advance();
      }
    } else {
      engine.nextStage();
    }
  }
  return engine;
}

function testLogicChain() {
  section('A. 逻辑链路');

  const adapter = mockAdapter();
  const engine = newEngine(adapter, 20261016);

  assert(engine.state.phase === 'privacy', '首启进入隐私协议页');

  engine.acceptPrivacy();
  assert(engine.state.phase === 'home', '同意协议后进入首页');

  engine.startTest();
  assert(engine.state.phase === 'quiz', '进入测试页');
  assert(engine.quiz.total() === 8, '测试共 8 题（实际 ' + engine.quiz.total() + '）');

  const q1 = engine.quiz.current();
  const optCountBefore = q1.options.length;
  engine.answerQuiz(0);
  assert(engine.quiz.index === 1, '答完一题后索引前进');

  // 走完测试 → 建号
  let guard = 0;
  while (engine.state.phase === 'quiz' && guard++ < 50) engine.answerQuiz(0);
  assert(engine.state.phase === 'build', '答完 8 题后进入建号页');
  assert(!!engine.state.persona, '已解算出财运人格：' + engine.state.persona.name);
  assert(
    !!engine.state.attrs && engine.state.attrs.cash !== undefined,
    '已生成初始属性（现金 ' + engine.state.attrs.cash + '）'
  );
  assert(optCountBefore >= 2, '每道题至少 2 个选项');

  // 进入主玩法
  engine.confirmBuild();
  assert(engine.state.phase === 'stage', '确认建号后进入第 1 阶段');
  assert(!!engine.state.currentEvent, '已抽出第一个事件：' + engine.state.currentEvent.title);
  assert(!!engine.state.stageSnapshot, '已记录阶段快照（翻盘回退用）');
  assert(engine.hasSave() === true, '进入阶段后已写存档');

  // 走完剩余流程
  guard = 0;
  while (
    (engine.state.phase === 'stage' || engine.state.phase === 'summary') &&
    guard++ < 500
  ) {
    if (engine.state.phase === 'stage') {
      if (!engine.state.revealed) engine.chooseOption(0);
      else engine.advance();
    } else {
      engine.nextStage();
    }
  }

  assert(
    engine.state.phase === 'ending' || engine.state.phase === 'revive',
    '四个阶段结束后进入结局判定（当前 ' + engine.state.phase + '）'
  );
  assert(!!engine.state.finalResult, '已产出结局结果');
  assert(
    ['S', 'A', 'B', 'C'].indexOf(engine.state.finalResult.quality) >= 0,
    '结局品质合法：' + engine.state.finalResult.quality +
      ' / 结局名「' + engine.state.finalResult.title + '」'
  );
  assert(engine.state.history.length > 0, '抉择历史已记录 ' + engine.state.history.length + ' 条');
  assert(
    engine.state.collection.personas.length >= 1 &&
      engine.state.collection.endings.length >= 1,
    '图鉴已解锁（人格 ' +
      engine.state.collection.personas.length +
      ' / 结局 ' +
      engine.state.collection.endings.length +
      '）'
  );

  // 结算浮层的计数器：只能看玩家净效果，不能被生活开销污染
  assert(
    typeof engine.state.consecutiveNeg === 'number',
    '保底计数器存在（当前 ' + engine.state.consecutiveNeg + '）'
  );

  // 结果卡
  if (engine.state.phase === 'revive') engine.skipRevive();
  engine.toResultCard();
  assert(engine.state.phase === 'result', '可以进入结果卡');
  assert(engine.state.playCount >= 1, '累计游玩次数已累加');

  return engine;
}

/** 存档 → 续玩 的往返测试 */
function testSaveResume() {
  section('B. 存档与续玩');

  const adapter = mockAdapter();
  const e1 = newEngine(adapter, 777);
  e1.acceptPrivacy();
  e1.startTest();
  let g = 0;
  while (e1.state.phase === 'quiz' && g++ < 50) e1.answerQuiz(1);
  e1.confirmBuild();
  e1.chooseOption(0);
  e1.advance();

  const snapshot = {
    persona: e1.state.persona.id,
    stageIndex: e1.state.stageIndex,
    eventsInStage: e1.state.eventsInStage,
    cash: e1.state.attrs.cash
  };

  // 模拟「杀掉进程后重新进入」：新建引擎，读同一份存储
  const e2 = newEngine(adapter, 99999);
  assert(e2.hasSave() === true, '新引擎能读到上一局的存档');
  assert(e2.state.phase === 'home', '有存档时仍然先回到首页（不强制续玩）');

  const resumed = e2.continueGame();
  assert(resumed === true, '续玩成功');
  assert(e2.state.persona && e2.state.persona.id === snapshot.persona, '人格已还原');
  assert(e2.state.stageIndex === snapshot.stageIndex, '阶段进度已还原');
  assert(e2.state.eventsInStage === snapshot.eventsInStage, '阶段内事件数已还原');
  assert(e2.state.attrs.cash === snapshot.cash, '属性已还原（现金 ' + e2.state.attrs.cash + '）');
  assert(!!e2.state.currentEvent, '续玩后仍有可玩的事件');
}

/** 翻盘分支：找一个会打到 C 级、从而触发 revive 的种子 */
function testReviveBranch() {
  let found = null;
  for (let seed = 1; seed <= 400 && !found; seed++) {
    const adapter = mockAdapter();
    const eng = newEngine(adapter, seed * 7919);
    playFullGame(eng);
    if (eng.state.phase === 'revive') found = eng;
  }

  if (!found) {
    fail('400 个种子里没找到触发翻盘的 C 级局，无法验证该分支');
    return;
  }
  ok('找到触发翻盘的 C 级局（品质 ' + found.state.finalResult.quality + '）');
  assert(found.state.reviveUsed === false, '翻盘尚未使用过');
  assert(
    found.hasSave() === false,
    '翻盘弹层出现时这一局的存档已经清掉（一局已判定完毕，不该留下残局的续玩点）'
  );

  const beforeStage = found.state.stageIndex;
  return found
    .watchAdForRevive()
    .then((okFlag) => {
      assert(okFlag === true, '看完广告后翻盘成功');
      assert(found.state.reviveUsed === true, '翻盘已标记为用过（不能无限翻）');
      assert(found.state.phase === 'stage', '翻盘后回到主玩法继续');
      assert(found.state.stageIndex === beforeStage, '回退到最后一个阶段');
      assert(found.hasSave() === true, '翻盘后重新落一份存档 —— 那是新一条时间线的续玩点');

      // 再走一次，应该直达结局而不再弹翻盘
      let g = 0;
      while (
        (found.state.phase === 'stage' || found.state.phase === 'summary') &&
        g++ < 500
      ) {
        if (found.state.phase === 'stage') {
          if (!found.state.revealed) found.chooseOption(0);
          else found.advance();
        } else {
          found.nextStage();
        }
      }
      assert(
        found.state.phase === 'ending',
        '用过翻盘后不再重复触发（当前 ' + found.state.phase + '）'
      );
    });
}

/** 隐藏结局的条件表达式是否能全部求值（这是自研求值器的核心风险点） */
function testEndingConditions() {
  section('D. 结局条件可求值性');

  const config = new WS.ConfigLoader();
  config.loadDefaults();
  const endings = config.get('ending') || [];
  const personas = config.get('persona') || [];

  const vars = {
    cash: 50,
    social: 50,
    cognition: 50,
    guts: 50,
    luck: 50,
    avg: 50,
    startCash: 50,
    lowProfileCount: 0,
    longtermCount: 0,
    aggressiveCount: 0,
    stageReached: 4,
    flag_low_profile: false,
    flag_longterm: false,
    flag_aggressive: false
  };

  let bad = 0;
  endings.forEach((e) => {
    if (!e.condition) return;
    try {
      WS.ExprEvaluator.test(e.condition, vars);
    } catch (err) {
      bad++;
      fail('结局 ' + e.id + ' 条件求值失败：' + e.condition + ' → ' + err.message);
    }
  });
  if (!bad) ok('全部 ' + endings.length + ' 组结局条件可求值');

  let badP = 0;
  personas.forEach((p) => {
    if (!p.condition) return;
    try {
      WS.ExprEvaluator.test(p.condition, {
        RISK: 2, CHANCE: 2, SOCIAL: 2, EGO: 2
      });
    } catch (err) {
      badP++;
      fail('人格 ' + p.id + ' 条件求值失败：' + p.condition + ' → ' + err.message);
    }
  });
  if (!badP) ok('全部 ' + personas.length + ' 个人格条件可求值');
}

/* ================================================================== */
/* E. 工程结构静态检查                                                  */
/* ================================================================== */

function walk(dir, exts, out) {
  out = out || [];
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir).forEach((name) => {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      /*
       * 跳过 node_modules / .git / unpackage（编译产物）。
       *
       * 还要跳过所有点开头的目录 —— 特别是 reactivity.test.mjs 复制出来的
       * .tmp-reactivity/：它里面是一份源码拷贝，不跳过的话这里的文件数、
       * 引用数会随「那个临时目录恰好还在不在」而变，
       * 同一份代码跑出两个数字（曾经出现过 81 与 65），假抱怨会掩盖真问题。
       */
      if (
        name === 'node_modules' ||
        name === '.git' ||
        name === 'unpackage' ||
        name.charAt(0) === '.'
      ) {
        return;
      }
      walk(full, exts, out);
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  });
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

/**
 * 去掉 JS / Vue 源码里的注释。
 *
 * 静态扫描必须先把注释剔除，否则「文档里提到 wx.*」会被误判成「调用了 wx.*」——
 * 这个假阳性在本项目里真实发生过（core/index.js 的注释里列举了被禁用的 API）。
 * 行注释的正则刻意排除了冒号，避免把 https:// 误当成注释开头。
 */
function stripComments(src) {
  return src
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * uni-app 的 pages.json / manifest.json 允许写注释（JSONC），
 * 标准 JSON.parse 会直接抛错，所以先剥注释再解析。
 */
function parseJsonc(file) {
  return JSON.parse(stripComments(fs.readFileSync(file, 'utf8')));
}

/**
 * 解析一个 import 说明符。要处理四类写法：
 *   './xxx.js'              → 直接命中
 *   './App'                 → 补 .vue 命中（uni-app 的 SFC 约定）
 *   'uni.promisify.adaptor' → 补 .js 命中
 *   './components/ui'       → 目录，取 index.js / index.vue
 *   '@/ws.js'               → @ 别名指向项目根
 */
function resolveSpec(dir, spec) {
  const base = spec.startsWith('@/')
    ? path.join(ROOT, spec.slice(2))
    : path.resolve(dir, spec);

  const candidates = [
    base,
    base + '.js',
    base + '.vue',
    base + '.json',
    path.join(base, 'index.js'),
    path.join(base, 'index.vue')
  ];
  for (let i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i]) && fs.statSync(candidates[i]).isFile()) {
      return candidates[i];
    }
  }
  return null;
}

/** 取出 .vue 的 script 块；纯 .js 直接返回原文 */
function scriptOf(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (!file.endsWith('.vue')) return src;
  const m = /<script>([\s\S]*?)<\/script>/.exec(src);
  return m ? m[1] : '';
}

function testImportsResolve() {
  section('E. 组件与模块引用可达性');

  const files = walk(ROOT, ['.vue', '.js']).filter(
    (f) => !rel(f).startsWith('tools/')
  );

  let missing = 0;
  let checked = 0;
  const importRe = /\bfrom\s+['"]([^'"]+)['"]/g;
  const requireRe = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;

  files.forEach((file) => {
    const src = scriptOf(file);
    const dir = path.dirname(file);
    let m;
    [importRe, requireRe].forEach((re) => {
      re.lastIndex = 0;
      while ((m = re.exec(src)) !== null) {
        const spec = m[1];
        // 跳过裸包名（vue / uni 内置等）
        if (!spec.startsWith('.') && !spec.startsWith('@/')) return;
        checked++;
        if (!resolveSpec(dir, spec)) {
          missing++;
          fail(rel(file) + ' 引用了不存在的模块：' + spec);
        }
      }
    });
  });

  if (!missing) ok('全部 ' + checked + ' 处相对引用均可达');
}

/**
 * 具名导入 / 导出的绑定一致性检查。
 *
 * 为什么必须有这一项：`node --check` 只做语法解析，不做模块链接，
 * 所以 `import { platform } from './env.js'` 而 env.js 只写了
 * `export default { platform }` 这种错误，语法检查完全看不出来，
 * 但一旦真跑起来就是 SyntaxError，整个应用起不来。
 * 本项目在实测中踩过这个坑，因此固化成检查项。
 */
function testImportExportBinding() {
  section('K. 具名导入与导出一致性（防止模块链接期报错）');

  const files = walk(ROOT, ['.vue', '.js']).filter(
    (f) => !rel(f).startsWith('tools/')
  );

  /** 收集一个文件对外暴露的具名导出 */
  function exportsOf(file) {
    const src = stripComments(scriptOf(file));
    const names = new Set();
    let m;

    const reFn = /export\s+(?:async\s+)?function\s+([\w$]+)/g;
    while ((m = reFn.exec(src)) !== null) names.add(m[1]);

    const reVar = /export\s+(?:const|let|var)\s+([\w$]+)/g;
    while ((m = reVar.exec(src)) !== null) names.add(m[1]);

    const reClass = /export\s+class\s+([\w$]+)/g;
    while ((m = reClass.exec(src)) !== null) names.add(m[1]);

    // export { a, b as c } —— 对外名是 as 后面的那个
    const reList = /export\s*\{([^}]+)\}/g;
    while ((m = reList.exec(src)) !== null) {
      m[1].split(',').forEach((part) => {
        const seg = part.trim();
        if (!seg) return;
        const asMatch = /\s+as\s+([\w$]+)$/.exec(seg);
        names.add(asMatch ? asMatch[1] : seg.split(/\s+/)[0]);
      });
    }

    if (/export\s+default\b/.test(src)) names.add('default');
    return names;
  }

  const cache = {};
  function cachedExports(file) {
    if (!cache[file]) cache[file] = exportsOf(file);
    return cache[file];
  }

  let bad = 0;
  let checked = 0;

  files.forEach((file) => {
    const src = scriptOf(file);
    const dir = path.dirname(file);

    // import { a, b as c } from '...'
    const reNamed = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = reNamed.exec(src)) !== null) {
      const spec = m[2];
      if (!spec.startsWith('.') && !spec.startsWith('@/')) continue;
      const target = resolveSpec(dir, spec);
      if (!target) continue; // 可达性由 E 组负责报错

      const avail = cachedExports(target);
      m[1].split(',').forEach((part) => {
        const seg = part.trim();
        if (!seg) return;
        // `a as b` 里，来源名是 a
        const imported = seg.split(/\s+as\s+/)[0].trim();
        if (!imported) return;
        checked++;
        if (!avail.has(imported)) {
          bad++;
          fail(
            rel(file) + ' 从 ' + spec + ' 具名导入了 `' + imported +
              '`，但对方没有这个导出'
          );
        }
      });
    }

    // import DefaultName from '...'
    const reDefault = /import\s+([\w$]+)\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]([^'"]+)['"]/g;
    while ((m = reDefault.exec(src)) !== null) {
      const spec = m[2];
      if (!spec.startsWith('.') && !spec.startsWith('@/')) continue;
      const target = resolveSpec(dir, spec);
      if (!target) continue;
      checked++;
      if (!cachedExports(target).has('default')) {
        bad++;
        fail(rel(file) + ' 默认导入了 ' + spec + '，但对方没有 default 导出');
      }
    }
  });

  if (!bad) ok('全部 ' + checked + ' 处具名/默认导入都有对应的导出');
}

function testLayerPurity() {
  section('F. 分层纯净度（防止架构腐化）');

  const coreFiles = walk(path.join(ROOT, 'core'), ['.js']);
  const dataFiles = walk(path.join(ROOT, 'data'), ['.js']);

  let dirty = 0;
  coreFiles.concat(dataFiles).forEach((file) => {
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    // 逻辑层与数据层绝不能出现平台 API —— 一旦出现，离线模拟和跨端复用立刻失效
    const bad = [
      [/\bwx\./, 'wx.'],
      [/\buni\./, 'uni.'],
      [/\bdocument\./, 'document.'],
      [/\bwindow\./, 'window.']
    ].filter(([re]) => re.test(src));
    if (bad.length) {
      dirty++;
      fail(rel(file) + ' 引用了平台 API：' + bad.map((b) => b[1]).join(', '));
    }
  });
  if (!dirty) {
    const n = coreFiles.length + dataFiles.length;
    ok('逻辑层与数据层共 ' + n + ' 个文件零平台依赖（可离线跑 10 万局模拟的前提）');
  }

  // 平台 API 只允许出现在 platform/ 下
  const allJs = walk(ROOT, ['.js', '.vue']).filter((f) => !rel(f).startsWith('tools/'));
  let leak = 0;
  allJs.forEach((file) => {
    const r = rel(file);
    if (r.startsWith('platform/')) return;
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    if (/\bwx\.createRewardedVideoAd|\bwx\.setStorageSync|\bwx\.getStorageSync/.test(src)) {
      leak++;
      fail(r + ' 直接调用了 wx.* 存储/广告 API，应经由 platform/uni-adapter.js');
    }
  });
  if (!leak) ok('平台 API 调用集中在 platform/ 层');
}

function testForbiddenSyntax() {
  section('G. 平台禁令（微信小程序禁止动态执行代码）');

  const files = walk(ROOT, ['.js', '.vue']).filter((f) => !rel(f).startsWith('tools/'));
  let bad = 0;
  files.forEach((file) => {
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    if (/\beval\s*\(/.test(src)) {
      bad++;
      fail(rel(file) + ' 使用了 eval');
    }
    if (/new\s+Function\s*\(/.test(src)) {
      bad++;
      fail(rel(file) + ' 使用了 new Function');
    }
  });
  if (!bad) ok('全项目无 eval / new Function');
}

function testCoreBarrelComplete() {
  section('H. 模块入口完整性（新增模块忘挂载的防线）');

  const coreDir = path.join(ROOT, 'core');
  const barrel = fs.readFileSync(path.join(coreDir, 'index.js'), 'utf8');
  const coreModules = fs
    .readdirSync(coreDir)
    .filter((f) => f.endsWith('.js') && f !== 'index.js');

  const notImported = coreModules.filter((f) => barrel.indexOf("'./" + f + "'") < 0);
  assert(
    notImported.length === 0,
    notImported.length
      ? 'core/index.js 漏了：' + notImported.join(', ')
      : 'core/index.js 已涵盖全部 ' + coreModules.length + ' 个模块'
  );

  const dataDir = path.join(ROOT, 'data');
  const dataBarrel = fs.readFileSync(path.join(dataDir, 'index.js'), 'utf8');
  const tableModules = fs
    .readdirSync(path.join(dataDir, 'tables'))
    .filter((f) => f.endsWith('.js'));

  const missingTables = tableModules.filter(
    (f) => dataBarrel.indexOf("'./tables/" + f + "'") < 0
  );
  assert(
    missingTables.length === 0,
    missingTables.length
      ? 'data/index.js 漏了：' + missingTables.join(', ')
      : 'data/index.js 已涵盖全部 ' + tableModules.length + ' 张配置表'
  );
}

function testFrameworkWiring() {
  section('I. uni-app 框架接线');

  const required = [
    'pages.json',
    'manifest.json',
    'App.vue',
    'main.js',
    'uni.scss',
    'pages/index/index.vue'
  ];
  const missing = required.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  assert(!missing.length, missing.length ? '缺少框架文件：' + missing.join(', ') : '框架必需文件齐全');

  const pagesJson = parseJsonc(path.join(ROOT, 'pages.json'));
  assert(
    pagesJson.pages && pagesJson.pages.length === 1 && pagesJson.pages[0].path === 'pages/index/index',
    'pages.json 只注册了唯一页面 pages/index/index'
  );
  assert(
    pagesJson.pages[0].style.navigationStyle === 'custom',
    '页面使用自定义导航栏（游戏不需要系统标题栏）'
  );

  // manifest.json 同样要能被解析（uni-app 会读它来定 appid / 平台配置）
  let manifestOk = true;
  try {
    const mf = parseJsonc(path.join(ROOT, 'manifest.json'));
    manifestOk = !!mf.name && mf.vueVersion === '3';
  } catch (e) {
    manifestOk = false;
  }
  assert(manifestOk, 'manifest.json 可解析且为 Vue 3 项目');

  // 页面模板里用到的组件，是否都在 components 里注册了
  const pageSrc = stripComments(
    fs.readFileSync(path.join(ROOT, 'pages/index/index.vue'), 'utf8')
  );
  const usedTags = new Set();
  const tagRe = /<([A-Z][A-Za-z0-9]*)[\s/>]/g;
  let m;
  while ((m = tagRe.exec(pageSrc)) !== null) usedTags.add(m[1]);

  const registered = new Set();
  const regRe = /^\s*([A-Z][A-Za-z0-9]*),?\s*$/gm;
  const compBlock = /components:\s*\{([\s\S]*?)\}/.exec(pageSrc);
  if (compBlock) {
    let r;
    while ((r = regRe.exec(compBlock[1])) !== null) registered.add(r[1]);
  }

  const unregistered = [...usedTags].filter((t) => !registered.has(t));
  assert(
    unregistered.length === 0,
    unregistered.length
      ? '页面使用了未注册的组件：' + unregistered.join(', ')
      : '页面使用的 ' + usedTags.size + ' 个组件均已注册'
  );

  // 9 个界面组件是否都存在
  const screens = [
    'privacy',
    'home',
    'codex',
    'quiz',
    'build',
    'stage',
    'summary',
    'ending',
    'result'
  ];
  const missingScreens = screens.filter(
    (s) => !fs.existsSync(path.join(ROOT, 'components/screens/screen-' + s + '.vue'))
  );
  assert(
    !missingScreens.length,
    missingScreens.length
      ? '缺少界面组件：' + missingScreens.join(', ')
      : screens.length + ' 个界面组件齐全'
  );

  // onShareAppMessage 必须在页面层
  assert(
    /onShareAppMessage\s*\(/.test(pageSrc),
    '页面层已声明 onShareAppMessage（小程序分享必须在页面声明，写在子组件里不生效）'
  );
}

/* ================================================================== */
/* J. Vue 单文件组件结构 + script 语法                                  */
/* ================================================================== */

/**
 * 这一节的价值：Node 里跑不了 uni-app 的完整编译，但绝大多数低级错误
 * （括号不配对、方法名拼错、少了逗号）都发生在 <script> 块里。
 * 把每个 SFC 的 script 抽出来交给 node --check，就能在没有编译器的前提下
 * 把它们全部拦下来，避免「H5 预览正常、编译小程序时才炸」。
 */
function testVueComponents() {
  section('J. Vue 单文件组件结构与 script 语法');

  const os = require('os');
  const { execFileSync } = require('child_process');

  const vues = walk(ROOT, ['.vue']);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-sfc-'));

  let structBad = 0;
  let syntaxBad = 0;

  vues.forEach((file) => {
    const src = fs.readFileSync(file, 'utf8');
    const r = rel(file);

    // --- 结构：template / script / style ---
    // App.vue 是应用级组件，本来就没有 <template>，不参与这条检查
    const isApp = r === 'App.vue';
    const nTemplate = (src.match(/<template>/g) || []).length;
    const nScript = (src.match(/<script>/g) || []).length;
    const nStyle = (src.match(/<style[\s>]/g) || []).length;

    const templateOk = isApp ? nTemplate === 0 : nTemplate === 1;
    if (!templateOk || nScript !== 1 || nStyle < 1) {
      structBad++;
      fail(
        r + ' 结构异常：template ' + nTemplate + ' / script ' + nScript + ' / style ' + nStyle
      );
      return;
    }

    // --- 语法：把 script 块抽出来当 ESM 校验 ---
    const m = /<script>([\s\S]*?)<\/script>/.exec(src);
    if (!m) return;
    const tmp = path.join(tmpDir, r.replace(/[\\/]/g, '_') + '.mjs');
    try {
      fs.writeFileSync(tmp, m[1]);
      execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    } catch (e) {
      syntaxBad++;
      const msg = (e.stderr ? e.stderr.toString() : e.message).split('\n').slice(0, 3).join(' ');
      fail(r + ' 的 script 块语法错误：' + msg.trim());
    }
  });

  if (!structBad) ok(vues.length + ' 个 SFC 的 template/script/style 结构完整');
  if (!syntaxBad) ok(vues.length + ' 个 SFC 的 script 块全部通过语法校验');

  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {
    /* 临时目录清不掉不影响结果 */
  }
}

/* ================================================================== */
/* L. 答题回退（改答案）                                                */
/* ================================================================== */

function testQuizRewind() {
  section('L. 答题回退（改答案）');

  /* ---- 纯逻辑层：TestEngine ---- */
  const te = new WS.TestEngine({ questions: WS.Tables.question, rng: new WS.Rng(999) });
  te.start();
  for (let i = 0; i < 8; i++) te.answer(0);
  const v8 = JSON.stringify(te.getVector());
  assert(te.isDone(), 'TestEngine：答满 8 题后 isDone() 为 true');

  te.rewindTo(2);
  assert(te.index === 2, 'rewindTo(2) 后 index 回到 2');
  assert(
    te.answers.length === 2 && te.choiceOf(3) === 0,
    'rewindTo 只截断「计分用」的 answers，保留「界面回显用」的 lastChoice'
  );

  const before = JSON.stringify(te.getVector());
  te.answer(2);
  assert(JSON.stringify(te.getVector()) !== before, '改答第 3 题后四维向量确实变化');

  let backs = 0;
  while (te.back()) backs++;
  assert(backs === 3 && te.index === 0, '连续 back() 一路退到第一题（退了 ' + backs + ' 次）');
  assert(te.back() === false, '已在第一题时 back() 返回 false（不会退成负下标）');

  for (let i = 0; i < 8; i++) te.answer(0);
  assert(
    JSON.stringify(te.getVector()) === v8,
    '退回第一题后重答同样的选项，向量与首次【完全一致】—— 分数没有累计漂移'
  );
  assert(te.choiceOf(7) === 0, '答完后每题的「上次选择」都被记下（第 8 题 = 0）');

  /*
   * 回退的两条语义必须同时成立：
   *   ① 计分只看已确认的作答（answers）→ vector 必须精确等于前 i 题之和；
   *   ② 界面回显要记得上次的答案（lastChoice）→ 否则玩家会以为答案丢了。
   * 这两条是靠两个独立数组实现的，下面把它俩分别钉死。
   */
  te.rewindTo(4);
  assert(te.currentChoice() === 0, '退回第 5 题时仍能读到上次的选择（界面高亮用）');

  const expect = { RISK: 0, CHANCE: 0, SOCIAL: 0, EGO: 0 };
  for (let i = 0; i < 4; i++) {
    const dim = te.list[i].options[te.answers[i]].dim || {};
    Object.keys(dim).forEach((k) => {
      expect[k] += dim[k];
    });
  }
  const got = te.vector;
  const exact = ['RISK', 'CHANCE', 'SOCIAL', 'EGO'].every((k) => (got[k] || 0) === expect[k]);
  assert(
    exact,
    '退回第 5 题后 vector【精确等于】前 4 题之和（第 5 题及之后的旧答案不掺进来）'
  );

  /* ---- 引擎层：状态机集成 ---- */
  const engine = newEngine(mockAdapter(), 4242);
  engine.acceptPrivacy();
  engine.startTest();

  assert(engine.quizBack() === false, '引擎：第一题时 quizBack() 返回 false');
  engine.answerQuiz(1);
  assert(engine.quizBack() === true, '引擎：答过题后 quizBack() 返回 true');
  assert(engine.quiz.index === 0, '引擎：退回后停在第一题');
  assert(engine.quiz.currentChoice() === 1, '引擎：退回后仍记得上次选择，供界面高亮');

  let guard = 0;
  while (engine.state.phase === 'quiz' && guard++ < 20) engine.answerQuiz(0);
  assert(engine.state.phase === 'build', '引擎：答满后进入建号页');

  assert(engine.editQuiz() === true, '引擎：editQuiz() 能从建号页回到答题页');
  assert(
    engine.state.phase === 'quiz' && engine.quiz.index === 7,
    '引擎：editQuiz() 落在最后一题（index=' + engine.quiz.index + '）'
  );

  // 改完再回到建号页，人格与答题记录必须跟着重算
  let sumBefore = 0;
  Object.keys(engine.quiz.getVector()).forEach((k) => {
    sumBefore += engine.quiz.getVector()[k];
  });
  engine.answerQuiz(2);
  assert(engine.state.phase === 'build', '改完答案后重新回到建号页');
  assert(
    engine.quiz.records.length === 8 && engine.quiz.records[7].optIndex === 2,
    '改答案后答题记录同步更新（第 8 题记为新选的 2）'
  );
  let sumAfter = 0;
  Object.keys(engine.quiz.getVector()).forEach((k) => {
    sumAfter += engine.quiz.getVector()[k];
  });
  assert(
    sumAfter >= 0 && sumAfter <= 16,
    '改答案后四维向量仍在合法范围（每维 0-4，合计 ' + sumBefore + ' → ' + sumAfter + '）'
  );
}

/* ================================================================== */
/* M. 每日财运签                                                        */
/* ================================================================== */

function testDaily() {
  section('M. 每日财运签');

  const table = WS.Tables.fortune;

  const a = WS.Daily.draw({ dateKey: '2026-10-16', fortune: table });
  const b = WS.Daily.draw({ dateKey: '2026-10-16', fortune: table });
  assert(
    JSON.stringify(a) === JSON.stringify(b),
    '同一天重复抽签结果【完全一致】—— 下拉刷新不会变成另一支签'
  );

  assert(/^\d{4}-\d{2}-\d{2}$/.test(WS.Daily.dateKey(new Date(2026, 9, 16))), 'dateKey() 输出 YYYY-MM-DD');

  // 连续 65 天，逐条校验自洽性
  const base = new Date(2026, 0, 1);
  let bad = 0;
  let changed = 0;
  let prevLabel = null;
  const seen = {};
  const detail = [];

  for (let i = 0; i < 65; i++) {
    const key = WS.Daily.dateKey(new Date(base.getTime() + i * 86400000));
    const sign = WS.Daily.draw({ dateKey: key, fortune: table });
    detail.push(sign);

    const lv = table.levels.filter((l) => l.id === sign.levelId)[0];
    if (!lv) {
      bad++;
      continue;
    }

    // 核心不变式：指数必须落在该等级的区间内，否则会出现「大吉 + 指数 25」
    const rg = lv.indexRange;
    if (sign.index < rg[0] || sign.index > rg[1]) bad++;
    // 宜 / 忌 各 2 条，且互不重复
    if (sign.good.length !== 2 || sign.bad.length !== 2) bad++;
    if (sign.good[0] === sign.good[1] || sign.bad[0] === sign.bad[1]) bad++;
    // 幸运数字 1~9
    if (sign.luckyNumber < 1 || sign.luckyNumber > 9) bad++;

    if (prevLabel !== null && sign.label !== prevLabel) changed++;
    prevLabel = sign.label;
    seen[sign.levelId] = (seen[sign.levelId] || 0) + 1;
  }

  assert(
    bad === 0,
    '65 天里签文【全部自洽】：指数落在等级区间内、宜忌各 2 条不重复、幸运数字合法'
  );
  assert(changed >= 40, '相邻两天不同签 ' + changed + ' / 64 次（签文有足够变化）');
  assert(
    Object.keys(seen).length === table.levels.length,
    '五个签文等级在 65 天里全部出现过（' + Object.keys(seen).length + '/' + table.levels.length + '）'
  );

  // 抽样打印，便于人工看一眼文案质量
  ['2026-01-01', '2026-02-14', '2026-05-20'].forEach((k) => {
    const s = WS.Daily.draw({ dateKey: k, fortune: table });
    console.log(
      '    · ' + k + '  ' + s.label + ' ' + s.index + '  「' + s.tip + '」' +
      '  宜 ' + s.good.join('/') + '  忌 ' + s.bad.join('/')
    );
  });

  // 引擎：首页拿到签、且同一天内不重算
  const engine = newEngine(mockAdapter(), 1);
  assert(!!engine.state.daily, '引擎 start() 后首页已备好当天的签');
  const first = engine.state.daily;
  engine.refreshDaily();
  assert(engine.state.daily === first, '同一天内 refreshDaily() 命中缓存，不会重抽');
  assert(engine.refreshDaily(true).dateKey === first.dateKey, 'force=true 时重抽仍得到同一天的签');
}

/* ================================================================== */
/* N. 财运指数 / 图鉴状态 / 新解锁记录                                  */
/* ================================================================== */

function testIndexAndCodex() {
  section('N. 财运指数 / 图鉴状态 / 新解锁记录');

  const EJ = WS.EndingJudge;
  const A = WS.AttrSystem;

  /** 造一组「五维同值」的属性 */
  const flat = (v) => {
    const o = {};
    A.ATTRS.forEach((k) => {
      o[k] = v;
    });
    return o;
  };

  let rangeBad = 0;
  let monotonic = true;
  let prevIdx = -1;
  for (let v = 0; v <= 100; v++) {
    const idx = EJ.wealthIndex(flat(v));
    if (idx < 0 || idx > 100) rangeBad++;
    if (idx < prevIdx) monotonic = false;
    prevIdx = idx;
  }
  assert(rangeBad === 0, '财运指数在 0~100 全域都落在合法区间');
  assert(monotonic, '财运指数对属性单调不减（属性越好指数绝不会更低）');

  /*
   * 标定锚点必须精确成立。
   * 这条断言的价值在于：一旦有人改了 event.js / balance.js 却没重跑
   * simulate.js 重新标定，指数刻度就会和实际分布脱节 —— 这里能立刻发现。
   */
  const ac = EJ.INDEX_ANCHORS;
  assert(
    EJ.wealthIndex(flat(ac.rawMid)) === ac.outMid &&
      EJ.wealthIndex(flat(ac.rawTop)) === ac.outTop,
    '标定锚点成立：原始 ' + ac.rawMid + '→' + ac.outMid + '、原始 ' + ac.rawTop + '→' + ac.outTop
  );

  assert(EJ.wealthIndex(null) === 0, '属性为空时指数为 0，不抛异常');
  assert(EJ.tagsOf(null).length === 0, '属性为空时标签为空数组，不抛异常');
  assert(EJ.indexBand(100).key === 'huge', '指数 100 落在最高档');
  assert(EJ.indexBand(0).key === 'bad', '指数 0 落在最低档');

  // 五个档位必须严格递减、最低档从 0 起，且任何分值都能查到唯一档位
  let bandBad = 0;
  let lastMin = 101;
  EJ.INDEX_BANDS.forEach((b) => {
    if (b.min >= lastMin) bandBad++;
    lastMin = b.min;
  });
  if (lastMin !== 0) bandBad++;
  for (let v = 0; v <= 100; v++) {
    const b = EJ.indexBand(v);
    if (!b || typeof b.label !== 'string' || !b.key) bandBad++;
  }
  assert(
    bandBad === 0,
    '五个档位阈值严格递减、最低档从 0 起，且 0~100 每个分值都能查到唯一档位'
  );

  // 标签取终值最高的两项
  const tg = EJ.tagsOf({ cash: 90, social: 20, cognition: 80, guts: 30, luck: 40 });
  assert(
    tg[0] === '现金流敏感' && tg[1] === '长期主义',
    '标签按终值从高到低取前两项（' + tg.join(' / ') + '）'
  );

  // 图鉴的状态迁移
  const engine = newEngine(mockAdapter(), 555);
  engine.acceptPrivacy();

  engine.openCodex('ending');
  assert(engine.state.phase === 'codex', 'openCodex() 进入图鉴阶段');
  assert(engine.state.codexTab === 'ending', 'openCodex("ending") 切到结局 Tab');

  engine.setCodexTab('persona');
  assert(engine.state.codexTab === 'persona', 'setCodexTab() 切回人格 Tab');

  engine.setCodexTab('不存在的tab');
  assert(engine.state.codexTab === 'persona', '非法 Tab 值被忽略，不会把状态写坏');

  engine.setCodexFocus('p:lucky');
  assert(engine.state.codexFocus === 'p:lucky', 'setCodexFocus() 记录被选中的条目');
  engine.setCodexFocus(null);
  assert(engine.state.codexFocus === null, 'setCodexFocus(null) 关闭详情');

  // 图鉴是旁路界面，进出不能弄丢进度
  engine.startTest();
  for (let i = 0; i < 8; i++) engine.answerQuiz(0);
  engine.confirmBuild();
  engine.chooseOption(0);
  const attrsBefore = JSON.stringify(engine.state.attrs);
  engine.openCodex('persona');
  engine.closeCodex();
  assert(engine.state.phase === 'home', 'closeCodex() 回到首页');
  assert(
    JSON.stringify(engine.state.attrs) === attrsBefore && engine.state.stageIndex === 0,
    '进出图鉴不会动到 attrs / 阶段进度（旁路界面必须是无副作用的）'
  );

  // 新解锁记录
  const e2 = newEngine(mockAdapter(), 8888);
  e2.acceptPrivacy();
  playFullGame(e2);
  const fresh = e2.state.newUnlocks;
  assert(
    Array.isArray(fresh) && fresh.length >= 1,
    '首局结束至少记录 1 条新解锁（' + fresh.length + ' 条）'
  );
  assert(
    fresh.some((u) => u.kind === 'ending') && fresh.some((u) => u.kind === 'persona'),
    '新解锁记录里同时含人格与结局'
  );

  const colBefore = JSON.stringify(e2.state.collection);
  e2.state.newUnlocks = [];
  e2._judge();
  assert(e2.state.newUnlocks.length === 0, '重复判定同一结局不会再被记成「新」解锁');
  assert(JSON.stringify(e2.state.collection) === colBefore, '重复判定不会往图鉴里塞重复项');

  // 图鉴条目总数必须与首页显示的进度分母一致
  const personas = WS.Tables.persona.length;
  const gradeVariants = WS.Tables.ending.filter((e) => !e.hidden).length * 4;
  const hiddenCount = WS.Tables.ending.filter((e) => e.hidden).length;
  assert(personas === 10, '人格图鉴共 10 条（实际 ' + personas + '）');
  assert(
    gradeVariants + hiddenCount === 43,
    '结局图鉴共 43 条（40 个等级变体 + ' + hiddenCount + ' 个隐藏）'
  );
}

/* ================================================================== */
/* O. 文案完整性                                                       */
/* ================================================================== */

/*
 * 这一组的由来是一次真实的漏渲染：结局页写的是 {{ quality.label }}，
 * 但 QUALITY 表里只有 color / bg / border，没有 label ——
 * 于是等级说明那一行在页面上永远是空白的，编译不报错、测试也不报错，
 * 只有肉眼盯着界面才会发现。
 *
 * 「读了却不存在的字段」这类缺陷没法靠运行时断言全覆盖（要真渲染才看得见），
 * 所以这里换一个角度：把「所有会被渲染出来的文案」都收进文案表，
 * 然后用静态扫描保证界面引用的键一个都不缺。
 */
function testCopyCompleteness() {
  section('O. 文案完整性');

  const T = WS.Tables.text;

  // 1) 每个结局等级都要有一句话说明，否则等级下面就是空白
  const grades = ['S', 'A', 'B', 'C'];
  const missing = grades.filter(
    (g) => typeof T['grade' + g] !== 'string' || T['grade' + g].trim() === ''
  );
  assert(
    missing.length === 0,
    'S/A/B/C 四个等级都有说明文案（' +
      grades.map((g) => g + '=' + T['grade' + g]).join(' ') + '）'
  );

  // 隐藏结局复用的是隐藏标签，那条也必须在
  assert(
    typeof T.hiddenTag === 'string' && T.hiddenTag.trim() !== '',
    '隐藏结局的标签文案存在（' + T.hiddenTag + '）'
  );

  // 2) 界面里出现的 t('xxx') 字面量键，必须都能在文案表里查到。
  //    t() 找不到键时会「原样返回键名」，界面上就会冒出一串英文键名，
  //    属于上线后才被玩家看到的低级错误 —— 静态扫描能在提交前就发现。
  const files = walkFiles([
    path.join(ROOT, 'components'),
    path.join(ROOT, 'pages')
  ]);
  const used = new Set();
  files.forEach((f) => {
    const src = fs.readFileSync(f, 'utf8');
    const re = /\.t\(\s*'([A-Za-z0-9_]+)'/g;
    let m;
    while ((m = re.exec(src))) {
      // 形如 t('grade' + g) 的动态拼接跳过：键名在运行时才拼出来，
      // 静态扫描看不到全貌，硬查会误报。
      const after = src.slice(re.lastIndex, re.lastIndex + 12);
      if (/^\s*\+/.test(after)) continue;
      used.add(m[1]);
    }
  });

  const absent = [...used].filter((k) => !Object.prototype.hasOwnProperty.call(T, k));
  assert(
    absent.length === 0,
    '界面引用的 ' + used.size + ' 个文案键在文案表里全部存在' +
      (absent.length ? '（缺失：' + absent.join(', ') + '）' : '')
  );
}

/** 递归收集目录下的 .vue / .js 文件 */
function walkFiles(dirs) {
  const out = [];
  const walk = (d) => {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(vue|js)$/.test(e.name)) out.push(p);
    });
  };
  dirs.forEach((d) => {
    if (fs.existsSync(d)) walk(d);
  });
  return out;
}

/* ================================================================== */
/* P. 阶段抉择回退（每个阶段都能「返回上一件事」）                        */
/* ================================================================== */

/*
 * 这一组针对的是一类很难靠「看日志」发现的错误：
 * 撤销做得不干净。比如只把属性还原了、忘了还原保底计数，
 * 或者属性还原时是「反着减」而不是「整帧覆盖」——
 * 两者都不会抛异常，结局分布也看不出异常，只有细心的玩家觉得不对劲。
 *
 * 所以这里不逐项推算预期值（那样只是把我的算法抄一遍），
 * 而是用**等价性**来判定：一局正常玩，一局每步都「选了又退回去重选」，
 * 最终结果必须逐字节相同。任何一处漏还原、任何一点累计漂移都会让它失败。
 */
function testStageBack() {
  section('P. 阶段抉择回退');

  const snap = (e) =>
    JSON.stringify({
      attrs: e.state.attrs,
      flags: e.state.flags,
      drawnIds: e.state.drawnIds,
      consecutiveNeg: e.state.consecutiveNeg,
      chainQueue: e.state.chainQueue,
      history: e.state.history,
      eventsInStage: e.state.eventsInStage,
      stageIndex: e.state.stageIndex,
      stageSnapshot: e.state.stageSnapshot,
      rng: e.rng._s
    });

  /** 走到第 1 阶段的第 1 件事 */
  const enterStage = (seed) => {
    const e = newEngine(mockAdapter(), seed);
    e.acceptPrivacy();
    e.startTest();
    let g = 0;
    while (e.state.phase === 'quiz' && g++ < 50) e.answerQuiz(0);
    e.confirmBuild();
    return e;
  };

  const e = enterStage(31415926);

  // 1) 起点：一次抉择都还没做
  assert(e.backDepth() === 0, '刚进第 1 阶段时无处可退（backDepth = 0）');
  assert(e.stageBack() === false, '第一件事上按返回返回 false（界面据此提示，且状态不变）');

  // 2) 退回原点必须「精确等于没选过」—— 这是全部断言里最强的一条
  const pristine = snap(e);
  e.chooseOption(1);
  assert(e.backDepth() === 1, '选过一次后可以退 1 步');
  assert(snap(e) !== pristine, '抉择确实改变了状态（否则下面的断言等于没测）');

  e.stageBack();
  assert(e.backDepth() === 0, '退回后栈回到空');
  assert(
    snap(e) === pristine,
    '退回后属性/已抽集合/保底计数/连锁队列/历史/随机数状态全部精确还原'
  );
  assert(e.state.revealed === false && e.state.result === null, '退回后回到「未选择」状态，结算浮层收起');

  // 3) 退回来后重选同一个选项 → 后续事件必须一模一样（随机数状态也还原了）
  e.chooseOption(1);
  const firstDeltas = JSON.stringify(e.state.result.deltas);
  e.advance();
  const nextEventId = e.state.currentEvent.id;

  e.stageBack();
  assert(e.state.lastPick === 1, '退回来后 lastPick 指向上次选的选项（界面据此高亮）');
  e.chooseOption(1);
  assert(JSON.stringify(e.state.result.deltas) === firstDeltas, '重选同一选项，结算结果完全一致');
  e.advance();
  assert(
    e.state.currentEvent.id === nextEventId,
    '重选同一选项，后续抽出的事件也完全相同（说明随机数状态被正确还原，不是「换了个世界」）'
  );

  // 4) 换一个选项 → 与「一开始就选它」完全等价（不会把上一次的加减留在身上）
  const ref = enterStage(31415926);
  ref.chooseOption(0);
  ref.advance();

  const alt = enterStage(31415926);
  const optCount = alt.state.currentEvent.options.length;
  const altIdx = optCount > 1 ? 1 : 0;
  alt.chooseOption(altIdx);
  alt.advance();
  alt.stageBack();
  alt.chooseOption(0);
  alt.advance();

  assert(
    JSON.stringify(alt.state.attrs) === JSON.stringify(ref.state.attrs),
    '退回去改选另一个选项后，属性与「一开始就选它」完全一致（没有叠加/残留）'
  );

  // 5) 连退多步 → 回到“什么都没做”；且不会因为弹出栈帧而丢数据
  const e2 = enterStage(2718281);
  const e2pristine = snap(e2);
  const c1 = e2.state.currentEvent.id;
  e2.chooseOption(0);
  e2.advance();
  e2.chooseOption(0);
  e2.advance();
  e2.chooseOption(0);
  assert(e2.backDepth() === 3, '连选三件事后可以退 3 步（实际 ' + e2.backDepth() + '）');

  e2.stageBack();
  e2.stageBack();
  e2.stageBack();
  assert(e2.backDepth() === 0, '连退三步回到起点');
  assert(e2.state.currentEvent.id === c1, '连退三步后回到第 1 件事');
  assert(snap(e2) === e2pristine, '连退三步后的状态与「刚进阶段」逐字节一致（多帧快照互不干扰）');
  assert(e2.state.lastPick === 0, '连退到第一件事后仍记得上次选的是第几个选项');

  // 6) 跨阶段回退：在新阶段的第 1 件事上，退的是上一阶段的最后一件事
  const e3 = newEngine(mockAdapter(), 606060);
  playFullGameToStage2(e3);
  assert(e3.state.phase === 'stage' && e3.state.stageIndex === 1, '已进入第 2 阶段');
  assert(e3.state.eventsInStage === 0, '第 2 阶段从头开始（eventsInStage = 0）');
  assert(e3.backDepth() > 0, '刚进第 2 阶段时依然可以往回退（上一阶段最后一件事）');

  e3.stageBack();
  assert(e3.state.stageIndex === 0, '跨阶段退回后 stageIndex 还原为 0');
  assert(e3.state.phase === 'stage', '跨阶段退回后仍在阶段界面');
  /*
   * 落点必须是「上一阶段的最后一件事」，也就是 eventCount - 1。
   *
   * 注意这里是 -1 而不是 eventCount：eventsInStage 数的是**已完成的抉择数**，
   * 而退回后那件事的抉择已经被撤销了（它还等着你重选）。写成 eventCount 会
   * 断言一个永远不成立的值 —— 而且失败信息里只有一个数字，看不出是差在哪儿。
   */
  assert(
    e3.state.eventsInStage === e3.currentStage().eventCount - 1,
    '退回后落回上一阶段的最后一件事（eventsInStage = ' + e3.state.eventsInStage +
      '，该阶段共 ' + e3.currentStage().eventCount + ' 件）'
  );
  assert(e3.state.lastPick >= 0, '退回后带着上次的选择，界面能高亮');
  // 退回来之后重新选一次，必须还能正常走到阶段结算（不会卡死在事件数越界上）
  e3.chooseOption(e3.state.lastPick);
  e3.advance();
  assert(e3.state.phase === 'summary', '跨阶段退回后重选，能正常触发该阶段结算');

  // 7) 阶段结算页回退：评级作废，回到那件事重选
  assert(typeof e3.state.stageRating === 'object' && e3.state.stageRating !== null, '结算页已算出阶段评级');
  e3.stageBack();
  assert(e3.state.phase === 'stage', '从阶段结算页退回到抉择界面');
  assert(e3.state.stageRating === null, '退回后清空阶段评级（那张评级卡已经不成立了）');
  assert(e3.state.revealed === false, '退回后重新面对那件事的选项');

  // 8) 翻盘会清空回退栈：翻盘等于这一阶段重来，旧的快照属于另一条时间线
  const e4 = newEngine(mockAdapter(), 606060);
  playFullGameToStage2(e4);
  e4._doRevive();
  assert(e4.backDepth() === 0, '翻盘后回退栈被清空（避免退回一条不存在的时间线）');
  assert(e4.state.lastPick === -1, '翻盘后不带任何「已选」痕迹');

  /*
   * 9) 兜底：还原的事件 id 在当前事件表里查不到时不能卡死。
   *    真实触发路径是远程配置热更新把某个事件换掉 —— 概率很低，
   *    但一旦发生，玩家会停在一个没有选项的界面上，等于卡关。
   */
  const e5 = enterStage(1234321);
  e5.chooseOption(0);
  e5.choiceStack[e5.choiceStack.length - 1].eventId = 'NO_SUCH_EVENT';
  e5.stageBack();
  assert(!!e5.state.currentEvent, '事件 id 失效时自动重抽一个，界面不会卡在空事件上');
  assert(e5.state.lastPick === -1, '重抽事件时清掉「已选」标记（那个选项可能已经不存在了）');
}

/** 推进到第 2 阶段的第一件事 */
function playFullGameToStage2(engine) {
  if (engine.state.phase === 'privacy') engine.acceptPrivacy();
  engine.startTest();
  let g = 0;
  while (engine.state.phase === 'quiz' && g++ < 50) engine.answerQuiz(0);
  engine.confirmBuild();

  let guard = 0;
  while (engine.state.phase !== 'stage' || engine.state.stageIndex === 0) {
    if (guard++ > 500) break;
    if (engine.state.phase === 'stage') {
      if (!engine.state.revealed) engine.chooseOption(0);
      else engine.advance();
    } else if (engine.state.phase === 'summary') {
      engine.nextStage();
    } else {
      break;
    }
  }
  return engine;
}

/** 每做一次抉择就「选 → 退回 → 重选」的一局，用来做等价性对照 */
function playWithBackEveryStep(engine) {
  if (engine.state.phase === 'privacy') engine.acceptPrivacy();
  engine.startTest();
  let g = 0;
  while (engine.state.phase === 'quiz' && g++ < 50) engine.answerQuiz(0);
  engine.confirmBuild();

  let guard = 0;
  while (
    (engine.state.phase === 'stage' || engine.state.phase === 'summary') &&
    guard++ < 2000
  ) {
    if (engine.state.phase === 'stage') {
      if (!engine.state.revealed) {
        engine.chooseOption(0);
        engine.stageBack();
        engine.chooseOption(0);
      } else {
        engine.advance();
      }
    } else {
      engine.nextStage();
    }
  }
  return engine;
}

function testStageBackEquivalence() {
  section('Q. 回退等价性（同一局「正常玩」vs「每步都退回重选」）');

  const seed = 777001;
  const normal = playFullGame(newEngine(mockAdapter(), seed));
  const backed = playWithBackEveryStep(newEngine(mockAdapter(), seed));

  assert(
    normal.state.phase === backed.state.phase,
    '两局停在同一个阶段（' + normal.state.phase + '）'
  );
  assert(
    JSON.stringify(normal.state.attrs) === JSON.stringify(backed.state.attrs),
    '两局最终属性逐项相同：' + JSON.stringify(normal.state.attrs) +
      (JSON.stringify(normal.state.attrs) === JSON.stringify(backed.state.attrs) ? '' : ' vs ' + JSON.stringify(backed.state.attrs))
  );
  assert(
    JSON.stringify(normal.state.flags) === JSON.stringify(backed.state.flags),
    '两局 flags 相同（标签类状态也一起还原了）'
  );
  assert(
    normal.state.history.length === backed.state.history.length,
    '两局抉择次数相同（' + normal.state.history.length + ' 次）'
  );
  const na = normal.state.finalResult;
  const ba = backed.state.finalResult;
  assert(
    !!na && !!ba && na.endingId === ba.endingId && na.quality === ba.quality,
    '两局结局完全相同：' + (na && na.quality + ' / ' + na.title) +
      ' vs ' + (ba && ba.quality + ' / ' + ba.title)
  );
  assert(
    !!na && !!ba && na.index === ba.index,
    '两局财运指数完全相同（' + (na && na.index) + ' vs ' + (ba && ba.index) + '）'
  );
}

/* ================================================================== */
/* R. 回首页入口覆盖                                                    */
/* ================================================================== */

/**
 * 「所有界面都能一键回首页」是一条界面约束，静态扫描就能守住。
 *
 * 它防的是一类很容易漏的错：新加了一个界面却忘了加页脚，玩家走到那一屏
 * 就出不来了 —— 小程序没有浏览器返回键，只能杀进程重开。
 * 写成「豁免白名单 + 其余必须引用」而不是「逐个列出来检查」，
 * 这样以后新增界面会自动被纳入检查范围，不需要记得回来改测试。
 */
function testHomeFooterCoverage() {
  section('R. 回首页入口覆盖');

  const FOOT = 'WsHomeFoot';
  const EXEMPT = {
    home: '首页本身就是家',
    privacy: '进游戏前的协议页，在那儿能「回首页」等于绕过协议'
  };

  const dir = path.join(ROOT, 'components/screens');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.vue'));

  const missing = [];
  let covered = 0;

  files.forEach((f) => {
    const id = f.replace(/^screen-/, '').replace(/\.vue$/, '');
    const src = stripComments(fs.readFileSync(path.join(dir, f), 'utf8'));
    const inTemplate = src.indexOf('<' + FOOT) >= 0;
    // 注册检查：template 里用了但 components 里没登记，真机上会渲染成未知标签
    const inComponents = new RegExp('components\\s*:\\s*\\{[^}]*' + FOOT).test(src);

    if (EXEMPT[id]) {
      assert(!inTemplate, '豁免界面 screen-' + id + '.vue 没有页脚（' + EXEMPT[id] + '）');
      return;
    }
    if (!inTemplate || !inComponents) missing.push(id);
    else covered++;
  });

  assert(
    !missing.length,
    missing.length
      ? '缺少回首页页脚 / 未注册的界面：' + missing.join(', ')
      : covered + ' 个界面都挂上了回首页页脚（豁免：' + Object.keys(EXEMPT).join('、') + '）'
  );

  // 结果卡页原本自己拼了一个回首页按钮，改成共用页脚之后不能再留一个，否则两个叠着
  const resultSrc = stripComments(
    fs.readFileSync(path.join(ROOT, 'components/screens/screen-result.vue'), 'utf8')
  );
  assert(
    resultSrc.indexOf("t('btnHome')") < 0,
    '结果卡页不再自己拼回首页按钮（避免和共用页脚重复）'
  );

  // 两个新组件都在
  const uiMissing = ['ws-option.vue', 'ws-home-foot.vue'].filter(
    (f) => !fs.existsSync(path.join(ROOT, 'components/ui', f))
  );
  assert(
    !uiMissing.length,
    uiMissing.length ? '缺少通用组件：' + uiMissing.join(', ') : '新增通用组件齐全（ws-option / ws-home-foot）'
  );

  /*
   * 选项卡必须由两个界面共用同一个组件。
   * 各写一份的后果不是「编译不过」，而是改了一处的金色忘了改另一处 ——
   * 测试抓不到，只能靠人盯着看，所以这里直接禁止本地实现。
   */
  ['screen-quiz', 'screen-stage'].forEach((s) => {
    const src = stripComments(
      fs.readFileSync(path.join(ROOT, 'components/screens/' + s + '.vue'), 'utf8')
    );
    assert(src.indexOf('<WsOption') >= 0, s + ' 使用了共用的 WsOption 组件');
    assert(
      src.indexOf('__option-text') < 0 && src.indexOf('__option-mark') < 0,
      s + ' 不再保留自己那份选项样式（否则会和组件里那份互相打架）'
    );
    /*
     * 点击监听必须挂在【外层普通 view】上，不能直接绑在 WsOption 组件上。
     *
     * 自定义组件绑 @tap 是个跨端陷阱：H5 端「组件 $emit 的同名事件」与
     * 「原生 DOM 事件的冒泡」可能同时命中父级监听 —— 一次点击跑两遍，
     * 放在答题页就是连跳两题。点得快时几乎看不出来，只有慢慢点才发现。
     * 挂普通 view 两端都只有冒泡这一条路径。
     */
    assert(
      !/<WsOption[^>]*@tap/.test(src),
      s + ' 没有把 @tap 绑在 WsOption 组件上（点击由外层 view 承接）'
    );
  });

  const optSrc = stripComments(
    fs.readFileSync(path.join(ROOT, 'components/ui/ws-option.vue'), 'utf8')
  );
  assert(
    optSrc.indexOf('emits') < 0 && optSrc.indexOf('$emit') < 0,
    'WsOption 不声明 emits、不 $emit —— 避免「组件事件 + 原生冒泡」造成一次点击触发两次'
  );
}

/* ================================================================== */
/* S. 存档生命周期                                                      */
/* ================================================================== */

/**
 * 回首页这个动作能从任何一屏触发，所以必须先把「存档什么时候存在」
 * 这件事钉死，否则会出现两种很难查的后果：
 *   ① 明明接着玩得到，首页却不给「继续上次的人生」；
 *   ② 首页给了按钮，点下去却说「存档已失效」—— 一个死按钮比没有按钮更糟。
 *
 * 约定（也是这一节要验证的）：
 *   答题 / 建号中     → 没有存档（还没有可续玩的进度）
 *   阶段 / 阶段结算中 → 有存档，且每次抉择后都是最新的
 *   一局判完          → 存档被清掉（run 已经结束了）
 *   翻盘              → 重新落一份（那是新的一条时间线）
 *   回首页            → 纯导航，不写也不清
 */
function testSaveLifecycle() {
  section('S. 存档生命周期（回首页的前提）');

  /** 一路答完 8 题并进入第 1 阶段 */
  const toStage = (e) => {
    e.startTest();
    let g = 0;
    while (e.state.phase === 'quiz' && g++ < 50) e.answerQuiz(0);
    e.confirmBuild();
    return e;
  };

  const e = newEngine(mockAdapter(), 777001);
  e.acceptPrivacy();

  // 1) 答题中：本来就没有存档，回首页不会丢任何东西
  e.startTest();
  e.answerQuiz(0);
  assert(e.hasSave() === false, '答题中不写存档（此时还没有可续玩的进度）');
  e.goHome();
  assert(e.state.phase === 'home', '答题中也能一键回首页');
  assert(e.hasSave() === false, '答题中回首页不会凭空造出一份存档');

  // 2) 阶段中：回首页必须保留进度
  toStage(e);
  e.chooseOption(0);
  e.advance();
  assert(e.hasSave() === true, '进入阶段后存档存在');

  const before = {
    attrs: JSON.stringify(e.state.attrs),
    stageIndex: e.state.stageIndex,
    eventsInStage: e.state.eventsInStage,
    backDepth: e.backDepth(),
    currentEventId: e.state.currentEvent.id
  };

  e.goHome();
  assert(e.state.phase === 'home', '阶段中途能一键回首页');
  assert(e.hasSave() === true, '回首页不动存档 —— 它是导航，不是「放弃这一局」');
  assert(
    JSON.stringify(e.state.attrs) === before.attrs &&
      e.state.stageIndex === before.stageIndex &&
      e.state.eventsInStage === before.eventsInStage &&
      e.backDepth() === before.backDepth,
    '回首页不改属性 / 阶段 / 阶段内进度 / 回退栈（纯导航，可以原样回来）'
  );

  // 3) 首页的「继续上次的人生」要能原样接上
  assert(e.continueGame() === true, '阶段中途回首页后能原地续玩');
  assert(e.state.phase === 'stage', '续玩后回到主玩法');
  assert(
    JSON.stringify(e.state.attrs) === before.attrs && e.state.currentEvent.id === before.currentEventId,
    '续玩后属性与事件与离开时逐字节一致 —— 回首页没造成任何漂移'
  );

  // 4) 开新局必须作废旧续玩点
  e.goHome();
  assert(e.hasSave() === true, '开新局之前存档仍在（第 5 步的前提）');
  e.startTest();
  assert(e.hasSave() === false, '开新局（startTest）清掉上一局的续玩点，避免两局状态混在一起');

  // 5) 一局走完，存档必须消失
  toStage(e);
  let g = 0;
  while ((e.state.phase === 'stage' || e.state.phase === 'summary') && g++ < 500) {
    if (e.state.phase === 'stage') {
      if (!e.state.revealed) e.chooseOption(0);
      else e.advance();
    } else {
      e.nextStage();
    }
  }
  assert(
    e.state.phase === 'ending' || e.state.phase === 'revive',
    '一局走到结局（当前 phase = ' + e.state.phase + '）'
  );
  assert(
    e.hasSave() === false,
    '结局判定后存档被清 —— 首页不会再出现一个点进去是残局的「继续上次的人生」'
  );
  if (e.state.phase === 'revive') {
    e.skipRevive();
    assert(e.hasSave() === false, '选择「算了」跳过翻盘后，存档依然是空的');
  }
  assert(e.continueGame() === false, '没有存档时续玩返回 false（界面据此给出提示）');

  // 6) 回到首页后 hasSave 反映的必须是当下的事实
  e.goHome();
  assert(e.hasSave() === false, '一局结束后回首页，存档状态为「无」');
}

/* ================================================================== */

console.log('');
console.log('='.repeat(64));
console.log('  《我的财运剧本》uni-app 冒烟测试');
console.log('='.repeat(64));

/** 顺序执行，让输出编号与真实执行顺序一致（翻盘分支是异步的，所以整体用 async 串起来） */
async function main() {
  testLogicChain();
  testSaveResume();

  section('C. 激励视频翻盘分支');
  await testReviveBranch();

  testEndingConditions();
  testQuizRewind();
  testDaily();
  testIndexAndCodex();
  testCopyCompleteness();
  testStageBack();
  testStageBackEquivalence();
  testHomeFooterCoverage();
  testSaveLifecycle();
  testImportsResolve();
  testLayerPurity();
  testForbiddenSyntax();
  testCoreBarrelComplete();
  testFrameworkWiring();
  testVueComponents();
  testImportExportBinding();

  console.log('');
  console.log('='.repeat(64));
  if (failures === 0) {
    console.log('  \u2713 全部 ' + checks + ' 项检查通过');
    process.exit(0);
  } else {
    console.log('  \u2717 ' + failures + ' / ' + checks + ' 项检查未通过');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n测试过程抛出异常：', err);
  process.exit(1);
});
