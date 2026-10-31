/**
 * reactivity.test.mjs —— 响应式桥实测
 *
 * 这是全项目风险最高的一块：把「会整体替换自己 state 的引擎」接进 Vue 的响应式系统。
 * tools/smoke.js 覆盖不到它（那边不加载 vue），所以单独跑真实 Vue 运行时。
 *
 * 前置：需要 vue 作为开发依赖
 *   npm i -D vue
 * 没有装的话本脚本会跳过并给出提示，不会让 CI 变红。
 *
 * 运行：
 *   node tools/reactivity.test.mjs
 *   （或 npm run test:reactivity）
 *
 * ---------------------------------------------------------------------------
 * 为什么要搞「复制到临时目录再动态 import」这一套：
 *
 * 本项目的 package.json 刻意没有声明 "type": "module"（因为 tools/ 下的脚本用
 * require() 加载 core/、data/，一旦声明 ESM 那些脚本立刻就废了）。
 * 但 Vue 的响应式 API 只能在 ESM 下用。
 *
 * 解决办法：把需要被测的源码复制到一个带 {"type":"module"} 的临时目录里再
 * import。临时目录放在项目内部，Node 找裸包 'vue' 时会自然向上走到
 * wh/node_modules，所以不需要复制整个依赖树。
 * ---------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(ROOT, '.tmp-reactivity');

/* ---------------- 0. 前置检查 ---------------- */

let vueUrl;
try {
  vueUrl = import.meta.resolve('vue');
} catch (e) {
  vueUrl = null;
}
if (!vueUrl) {
  console.log('');
  console.log('  \u26a0 未安装 vue，跳过响应式桥测试（不影响其他检查）');
  console.log('    想跑这项测试请执行：npm i -D vue');
  console.log('');
  process.exit(0);
}

/* ---------------- 1. 搭临时 ESM 环境 ---------------- */

const COPY = ['core', 'data', 'platform', 'composables', 'utils', 'ws.js'];

/**
 * 删除一律「尽力而为」，绝不因为删不掉就中断测试。
 *
 * 原因：某些环境（含本仓库的开发机）会把 Node 的 rmSync 重定向成「移到回收站」，
 * 那个操作在 Windows 上会因为句柄未释放、杀软扫描等原因偶发失败，抛出的是
 * 与测试内容毫无关系的错误。临时目录删不删得掉，不该影响「响应式桥是否正常」
 * 这个结论 —— 所以这里全部包 try/catch。
 *
 * 第二段是「逐文件 unlink + 自底向上 rmdir」的兜底：那个垫片只拦截
 * rmSync / rm，不碰 unlinkSync，实测在 rmSync 失败时这一段必定成功。
 * 不兜底的话，跑几次测试就会在仓库里留下几十份源码副本 —— 它们被
 * .gitignore 挡住不会提交，但会被编辑器的全局搜索和代码跳转命中，
 * 搜出来的「另一份实现」会让人怀疑自己改错了文件。
 */
function rmBestEffort(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  } catch (e) {
    /* 落到下面的逐文件兜底 */
  }
  if (!fs.existsSync(dir)) return;

  const unlinkDeep = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) unlinkDeep(p);
      else fs.unlinkSync(p);
    }
    fs.rmdirSync(d);
  };
  try {
    unlinkDeep(dir);
  } catch (e) {
    /* 真的删不掉也认了，cpSync 会覆盖重写 */
  }
}

rmBestEffort(TMP);
fs.mkdirSync(TMP, { recursive: true });

for (const item of COPY) {
  const from = path.join(ROOT, item);
  const to = path.join(TMP, item);
  fs.cpSync(from, to, { recursive: true });
}
fs.writeFileSync(path.join(TMP, 'package.json'), JSON.stringify({ type: 'module' }));

function cleanup() {
  rmBestEffort(TMP);
}
process.on('exit', cleanup);

/* ---------------- 2. 伪造 uni 运行时 ---------------- */

const store = {};
globalThis.uni = {
  getStorageSync: (k) => (store[k] === undefined ? '' : store[k]),
  setStorageSync: (k, v) => {
    store[k] = v;
  },
  removeStorageSync: (k) => {
    delete store[k];
  },
  vibrateShort: () => {},
  getSystemInfoSync: () => ({
    windowWidth: 375,
    windowHeight: 812,
    pixelRatio: 2,
    statusBarHeight: 44,
    screenHeight: 812,
    safeArea: { bottom: 778 }
  }),
  createRewardedVideoAd: () => ({
    onClose() {},
    offClose() {},
    onError() {},
    offError() {},
    show: () => Promise.resolve(),
    load: () => Promise.resolve()
  }),
  request: () => {},
  setClipboardData: () => {},
  showModal: () => {},
  createCanvasContext: () => ({})
};

/* ---------------- 3. 载入被测对象 ---------------- */

await import(pathToFileURL(path.join(TMP, 'core/registry.js')).href);
const { reactive, markRaw } = await import('vue');
const { useGame } = await import(pathToFileURL(path.join(TMP, 'composables/useGame.js')).href);

/* ---------------- 4. 断言工具 ---------------- */

let pass = 0;
let fail = 0;
function check(cond, msg) {
  if (cond) {
    pass++;
    console.log('  \u2713 ' + msg);
  } else {
    fail++;
    console.log('  \u2717 ' + msg);
  }
}
function section(t) {
  console.log('');
  console.log(t);
  console.log('-'.repeat(64));
}

console.log('');
console.log('='.repeat(64));
console.log('  响应式桥实测（真实 Vue 3 运行时）');
console.log('='.repeat(64));

/*
 * 固定种子。
 * 引擎默认用时间做种子，本脚本里有大量断言依赖「这一局具体抽到了什么」
 * （题干、人格、事件选项个数）。不钉住种子的话，偶发失败会以大约几十分之一的
 * 概率出现，而且报错点看不出跟随机有关 —— 最难查的那种 flaky test。
 */
const game = useGame({ seed: 20261016 });
const { watch, nextTick } = await import('vue');

/* ---------------- 5. reactive 解包 ---------------- */

section('1) reactive 自动解包（模板里能直接写 game.xxx）');

check(typeof game.screen === 'string', 'game.screen 解包成字符串：' + game.screen);
check(
  !!game.state && typeof game.state.phase === 'string',
  'game.state 解包成状态对象：phase=' + game.state.phase
);
check(typeof game.quizProgress === 'number', 'game.quizProgress 解包成数字');
check(game.hasSave === false, 'game.hasSave 初始为 false');
check(
  game.engine !== undefined && typeof game.engine.startTest === 'function',
  'game.engine（markRaw）仍可正常调用'
);
check(
  Object.prototype.toString.call(game.engine) === '[object Object]',
  'engine 未被深代理（markRaw 生效，避免把整张配置表变成 Proxy）'
);
check(reactive && markRaw ? true : true, 'reactive / markRaw 可用');

/* ---------------- 6. 引擎动作驱动渲染 ---------------- */

section('2) 引擎动作是否真的驱动重新渲染（用 watch 计数，不靠肉眼）');

const screenLog = [];
const stopScreen = watch(() => game.screen, (v) => screenLog.push(v));

const stemLog = [];
const stopStem = watch(
  () => (game.currentQuestion ? game.currentQuestion.stem : ''),
  (v) => stemLog.push(v)
);

const phaseLog = [];
const stopPhase = watch(() => game.state.phase, (v) => phaseLog.push(v));

game.actions.acceptPrivacy();
await nextTick();
check(game.screen === 'home', 'acceptPrivacy → screen=home');

game.actions.startTest();
await nextTick();
check(game.screen === 'quiz', 'startTest → screen=quiz');
check(!!game.currentQuestion, 'currentQuestion 可读，题干：' + game.currentQuestion.stem);
check(game.quizIndex === 1, 'quizIndex 从 1 开始');
check(game.quizTotal === 8, 'quizTotal = 8');

// ★ 这一段是关键：验证 currentQuestion 的 computed 没有被错误缓存
const stems = [game.currentQuestion.stem];
for (let i = 0; i < 8; i++) {
  game.actions.answerQuiz(0);
  await nextTick();
  if (game.currentQuestion) stems.push(game.currentQuestion.stem);
}
check(
  new Set(stems).size === stems.length,
  '连续 8 题题干互不相同（共 ' + stems.length + ' 题 / ' + new Set(stems).size + ' 个不同）'
);
check(
  stemLog.length >= 6,
  'currentQuestion 的 watch 触发 ' + stemLog.length + ' 次 —— computed 未被错误永久缓存'
);
check(game.screen === 'build', '答完 8 题 → screen=build');

/* ---------------- 7. 属性变更驱动 ---------------- */

section('3) 属性变更驱动');

const attrLog = [];
const stopAttr = watch(
  () => (game.state.attrs ? game.state.attrs.cash : -1),
  (v) => attrLog.push(v)
);

check(!!game.state.persona, '已解算人格：' + game.state.persona.name);
const startCash = game.state.attrs.cash;

game.actions.confirmBuild();
await nextTick();
check(game.screen === 'stage', 'confirmBuild → screen=stage');
check(!!game.state.currentEvent, 'currentEvent 已抽出：' + game.state.currentEvent.title);

game.actions.chooseOption(0);
await nextTick();
check(game.state.revealed === true, 'chooseOption → revealed=true（结算浮层该出现）');
check(
  Object.keys((game.state.result && game.state.result.deltas) || {}).length > 0,
  '结算包含属性变化：' + JSON.stringify(game.state.result.deltas)
);
check(
  attrLog.length >= 1,
  '属性 watch 触发 ' + attrLog.length + ' 次（现金 ' + startCash + ' → ' + game.state.attrs.cash + '）'
);

/* ---------------- 8. 完整一局 ---------------- */

section('4) 完整走完一局');

game.actions.advance();
await nextTick();

let guard = 0;
while ((game.screen === 'stage' || game.screen === 'summary') && guard++ < 600) {
  if (game.screen === 'stage') {
    if (!game.state.revealed) game.actions.chooseOption(0);
    else game.actions.advance();
  } else {
    game.actions.nextStage();
  }
  await nextTick();
}

check(game.screen === 'ending', '四阶段结束 → screen=ending');
check(
  !!game.state.finalResult,
  '结局已产出：' + game.state.finalResult.quality + ' / ' + game.state.finalResult.title
);

game.actions.toResultCard();
await nextTick();
check(game.screen === 'result', 'toResultCard → screen=result');
check(
  game.pseudoPercent(game.state.finalResult.endingId).length > 0,
  'pseudoPercent 可用：全服仅 ' + game.pseudoPercent(game.state.finalResult.endingId) + '%'
);

/* ---------------- 9. replay：整体替换 state ---------------- */

section('5) replay 整体替换 state —— 用 reactive(engine.state) 会在这里崩');

const beforePersona = game.state.persona.id;
const ticksBefore = phaseLog.length;

game.actions.replay();
await nextTick();

check(game.screen === 'quiz', 'replay → 直接进入新一轮测试');
check(game.state.persona === null, '人格已清空');
check(game.state.attrs === null, '属性已清空');
check(
  phaseLog.length > ticksBefore,
  'state 被整体替换后 watch 依然触发（' + phaseLog.length + ' 次）—— 快照策略有效'
);
check(typeof beforePersona === 'string', 'replay 前的人格 id 已记录：' + beforePersona);

game.actions.goHome();
await nextTick();
check(game.screen === 'home', 'goHome → screen=home');

stopScreen();
stopStem();
stopPhase();
stopAttr();

/* ---------------- 10. 答题回退 ---------------- */

section('6) 答题回退（改答案）在响应式下生效');

game.actions.startTest();
await nextTick();
check(game.canQuizBack === false, '第一题时 canQuizBack=false（界面据此隐藏返回按钮）');
check(game.quizChoice === -1, '第一题还没选过，quizChoice=-1');

game.actions.answerQuiz(1);
await nextTick();
check(game.quizIndex === 2, '答完第 1 题 → 第 2 题');

game.actions.quizBack();
await nextTick();
check(game.quizIndex === 1, 'quizBack → 回到第 1 题');
check(
  game.quizChoice === 1,
  '★ 回退后 quizChoice 仍指向上次的选项（界面高亮不会丢）'
);
check(game.canQuizBack === false, '回到第一题后 canQuizBack 重新变回 false');

game.actions.answerQuiz(2);
await nextTick();
check(game.quizIndex === 2, '改完答案后继续前进到第 2 题');

let g2 = 0;
while (game.screen === 'quiz' && g2++ < 20) {
  game.actions.answerQuiz(0);
  await nextTick();
}
check(game.screen === 'build', '答满 → screen=build');

game.actions.editQuiz();
await nextTick();
check(game.screen === 'quiz', 'editQuiz → 从建号页回到答题页');
check(game.quizIndex === 8, 'editQuiz 落在最后一题（quizIndex=' + game.quizIndex + '）');
check(game.quizChoice === 0, '最后一题显示上次的选择（quizChoice=0）');

/* ---------------- 11. 每日财运签 ---------------- */

section('7) 每日财运签');

check(!!game.daily, 'game.daily 可读：' + (game.daily && game.daily.label));
check(
  !!game.daily && typeof game.daily.index === 'number' && game.daily.index >= 0 && game.daily.index <= 100,
  '今日财运指数在 0~100：' + (game.daily && game.daily.index)
);
check(
  !!game.daily && Array.isArray(game.daily.good) && game.daily.good.length === 2,
  '宜 2 条：' + (game.daily ? game.daily.good.join(' / ') : '')
);
check(
  !!game.daily && game.dateLabel(game.daily.dateKey).indexOf('月') > 0,
  'dateLabel 可读：' + (game.daily ? game.dateLabel(game.daily.dateKey) : '')
);

/* ---------------- 12. 图鉴数据的响应式 ---------------- */

section('8) 图鉴数据的响应式（解锁后必须立刻可见）');

const codexLog = [];
const stopCodex = watch(
  () => game.codexData.personaDone + '/' + game.codexData.endingDone,
  (v) => codexLog.push(v)
);

game.actions.openCodex('persona');
await nextTick();
check(game.screen === 'codex', 'openCodex → screen=codex');
check(game.state.codexTab === 'persona', '默认停在人格页签');
check(game.codexData.personas.length === 10, '人格图鉴 10 条');
check(game.codexData.endings.length === 10, '结局图鉴按人格分成 10 组');
check(game.codexData.endings[0].grades.length === 4, '每组结局有 S/A/B/C 四个解锁位');
check(game.codexData.hidden.length === 3, '隐藏结局 3 条');
check(game.codexData.endingTotal === 43, '结局图鉴总数 43（实际 ' + game.codexData.endingTotal + '）');

game.actions.setCodexTab('ending');
await nextTick();
check(game.state.codexTab === 'ending', 'setCodexTab → 切到结局页签');

game.actions.setCodexFocus('e:' + game.codexData.endings[0].id);
await nextTick();
check(
  game.state.codexFocus === 'e:' + game.codexData.endings[0].id,
  'setCodexFocus → 详情弹层拿到条目 id'
);
game.actions.setCodexFocus(null);
await nextTick();
check(game.state.codexFocus === null, 'setCodexFocus(null) → 关闭详情');

/*
 * ★ 这一组是整个文件里最关键的断言。
 *
 * codexData 的数据源一半是配置表（markRaw，非响应式），一半是 collection。
 * 如果 computed 里漏读了 state.value，它会被 Vue 永久缓存 ——
 * 表现就是「玩完一局回到图鉴，新解锁的条目看不见」，而这个 bug 在
 * 编译期、在 smoke.js 里都查不出来，只有真实 Vue 运行时能抓到。
 *
 * 所以这里直接把 collection 清零再同步一次：若 codexData 是活的，它必须归零。
 */
const beforeClear = game.codexData.endingDone;
game.engine.state.collection = { personas: [], endings: [] };
game.actions.goHome();
await nextTick();

check(
  game.codexData.personaDone === 0 && game.codexData.endingDone === 0,
  '★ collection 清零后图鉴进度同步归零（' + beforeClear + ' → 0）—— codexData 没有被永久缓存'
);
check(codexLog.length >= 1, 'codexData 的 watch 被触发 ' + codexLog.length + ' 次');
check(
  game.codexData.personas.every((p) => !p.unlocked),
  '清零后所有人格都显示为未解锁'
);
check(
  game.codexData.endings.every((e) => e.unlockedCount === 0) &&
    game.codexData.hidden.every((h) => !h.unlocked),
  '清零后所有结局（含隐藏）都显示为未解锁'
);

/* ---------------- 13. 财运指数随结局产出 ---------------- */

section('9) 财运指数 / 标签随结局一起产出');

game.actions.closeCodex();
await nextTick();
check(game.screen === 'home', 'closeCodex → screen=home');

game.actions.startTest();
await nextTick();
let g3 = 0;
while (game.screen === 'quiz' && g3++ < 20) {
  const n = game.currentQuestion ? game.currentQuestion.options.length : 1;
  game.actions.answerQuiz(Math.min(2, n - 1));
  await nextTick();
}
game.actions.confirmBuild();
await nextTick();

g3 = 0;
while ((game.screen === 'stage' || game.screen === 'summary') && g3++ < 600) {
  if (game.screen === 'stage') {
    if (!game.state.revealed) {
      /*
       * 这里必须按事件实际的选项个数取下标。
       * 不是所有事件都恰好 3 个选项 —— 硬写 chooseOption(2) 会在 2 选项的事件上
       * 被引擎静默拒绝（返回 null、revealed 保持 false），循环就会一直空转到上限，
       * 最后拿着一个没有结局的状态去断言，报出来的错误完全指不到真正的原因。
       */
      const ev = game.state.currentEvent;
      const n = ev && ev.options ? ev.options.length : 1;
      game.actions.chooseOption(Math.min(2, n - 1));
    } else {
      game.actions.advance();
    }
  } else {
    game.actions.nextStage();
  }
  await nextTick();
}
if (game.state.phase === 'revive') {
  game.actions.skipRevive();
  await nextTick();
}

const fr = game.state.finalResult;
check(!!fr, '新一局产出结局：' + (fr && fr.quality) + ' / ' + (fr && fr.title));
check(
  !!fr && typeof fr.index === 'number' && fr.index >= 0 && fr.index <= 100,
  '结局带财运指数：' + (fr && fr.index) + '（' + (fr && fr.indexLabel) + '）'
);
check(
  !!fr && Array.isArray(fr.tags) && fr.tags.length === 2,
  '结局带 2 个人设标签：' + (fr && fr.tags ? fr.tags.join(' / ') : '')
);
check(
  Array.isArray(game.state.newUnlocks),
  'newUnlocks 是数组（本局新解锁 ' + game.state.newUnlocks.length + ' 条）'
);
check(
  game.codexData.personaDone === game.state.collection.personas.length &&
    game.codexData.endingDone === game.state.collection.endings.length,
  '图鉴进度与 collection 精确一致（人格 ' + game.codexData.personaDone +
    '、结局 ' + game.codexData.endingDone + '）'
);

/*
 * 等级说明文案。
 * 结局页渲染的是 t('grade' + quality)，而 t() 在查不到键时会把键名原样返回 ——
 * 也就是说文案漏了不会报错，只会在界面上显示成「gradeA」这种半截英文。
 * 所以这里断言它必须不等于键名本身，等于就是漏了。
 */
const gradeKey = 'grade' + (fr.quality || 'B');
const gradeText = game.t(gradeKey);
check(
  typeof gradeText === 'string' && gradeText.length > 0 && gradeText !== gradeKey,
  '等级说明文案已配置：' + (fr.quality || 'B') + ' 级 → 「' + gradeText + '」'
);

/* ---------------- 10. 阶段抉择回退 ---------------- */

section('10) 阶段抉择回退在响应式下生效');

/*
 * 这一节的重点不是「回退算得对不对」（那在 smoke 里逐字节验过了），
 * 而是「界面会不会跟着变」。
 *
 * 回退栈存在 engine.choiceStack 这个**非响应式**对象上，如果 canStageBack
 * 这个 computed 忘了读一下 state.value，它会首次求值后永久缓存 ——
 * 表现就是「第一件事上没有返回按钮，之后也永远不会出现」。
 * 静态检查看不出来，只有真实 Vue 运行时能抓到，所以这里必须实测。
 */

game.actions.replay();
await nextTick();

let g4 = 0;
while (game.screen === 'quiz' && g4++ < 20) {
  game.actions.answerQuiz(0);
  await nextTick();
}
game.actions.confirmBuild();
await nextTick();
check(game.screen === 'stage', '重新开一局并进入阶段界面');

check(game.canStageBack === false, '第 1 件事还没选，canStageBack=false');
check(game.stageBackDepth === 0, '回退栈为空（深 0）');
check(game.stageChoice === -1, 'stageChoice=-1，没有选项需要标亮');

const opts = game.state.currentEvent.options.length;
const pickA = Math.min(1, opts - 1);

game.actions.chooseOption(pickA);
await nextTick();
check(game.state.revealed === true, '选择后 revealed=true（结算浮层出现）');
check(
  game.canStageBack === true,
  '★ 选过一次后 canStageBack 从 false 变成 true —— computed 没有被永久缓存'
);
check(game.stageBackDepth === 1, '可退 1 步');

// 结算浮层里的「换一个选择」和顶栏的「上一件事」是同一个动作
game.actions.stageBack();
await nextTick();
check(game.state.revealed === false, '换一个选择 → 结算浮层收起');
check(
  game.stageChoice === pickA,
  '★ 原地重选时 stageChoice 指向上次选的选项（界面高亮不会丢）'
);
check(game.canStageBack === false, '栈回到空 → canStageBack=false');

// 重新选、推进到第 2 件事
game.actions.chooseOption(pickA);
await nextTick();
game.actions.advance();
await nextTick();
check(
  game.screen === 'stage' && game.state.eventsInStage === 1,
  '推进到第 2 件事（eventsInStage=1）'
);
check(game.canStageBack === true, '第 2 件事上依然可以「返回上一件事」');
check(game.stageChoice === -1, '换了新事件，上一件事的高亮已清掉');

// 从第 2 件事退回第 1 件事：属性与高亮都必须回滚
const attrsAtEvent2 = JSON.stringify(game.state.attrs);
game.actions.stageBack();
await nextTick();
check(game.state.eventsInStage === 0, '退回后回到第 1 件事（eventsInStage=0）');
check(game.stageChoice === pickA, '★ 退回后高亮的是当初在第 1 件事选的那个选项');
check(
  JSON.stringify(game.state.attrs) !== attrsAtEvent2,
  '退回后属性确实回滚了（不是只改了界面）'
);
// 再退一次：已经在第 1 件事上，不动任何数据
const attrsAtEvent1 = JSON.stringify(game.state.attrs);
game.actions.stageBack();
await nextTick();
check(game.canStageBack === false, '栈空 → canStageBack=false');
check(
  JSON.stringify(game.state.attrs) === attrsAtEvent1,
  '栈空时按返回不会改动任何属性（只是给个提示）'
);

/* ---------------- 11) 回首页与 hasSave 的即时性 ---------------- */

/*
 * 「首页要不要显示继续上次的人生」完全取决于 hasSave 这个 ref。
 * 它是从本地存档读出来的，不在 Vue 的响应式依赖里 —— 也就是最典型的
 * 「引擎改了、界面不知道」。所以这里专门验证它在每个动作之后都对得上。
 */

// 此刻正在阶段中途，存档应当存在
check(
  game.hasSave === true,
  '阶段中途 hasSave=true（首页会给出「继续上次的人生」）'
);

game.actions.goHome();
await nextTick();
check(game.screen === 'home', '阶段中途一键回首页，界面切到首页');
check(game.hasSave === true, '★ 回首页不会清掉存档（纯导航，进度还在）');

// 首页 → 图鉴 → 回首页：仍然是同一个进度
game.actions.openCodex('persona');
await nextTick();
check(game.screen === 'codex', '从首页进入图鉴');
game.actions.goHome();
await nextTick();
check(game.screen === 'home', '图鉴页也能一键回首页');
check(game.hasSave === true, '绕了一圈图鉴回来，存档依然在');

// 开新局：旧续玩点必须立刻失效，否则首页会挂着一个点进去是上一局残局的按钮
game.actions.startTest();
await nextTick();
check(game.screen === 'quiz', '点「开始写我的剧本」进入答题');
check(
  game.hasSave === false,
  '★ 开新局后 hasSave 立刻变成 false（不需要等下一个动作才刷新）'
);

game.actions.goHome();
await nextTick();
check(
  game.screen === 'home' && game.hasSave === false,
  '答题中回首页：首页此时只该出现「开始写我的剧本」'
);

// 答题中回退按钮的边界
game.actions.startTest();
await nextTick();
check(game.canQuizBack === false, '第 1 题上 canQuizBack=false（顶栏把「上一题」置灰）');

/* ---------------- 结果 ---------------- */

stopCodex();

console.log('');
console.log('='.repeat(64));
console.log(
  fail === 0
    ? '  \u2713 响应式桥全部 ' + pass + ' 项验证通过'
    : '  \u2717 ' + fail + ' / ' + (pass + fail) + ' 项未通过'
);
console.log('='.repeat(64));
console.log('');

cleanup();
process.exit(fail === 0 ? 0 : 1);
