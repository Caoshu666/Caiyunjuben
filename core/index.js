/**
 * core/index.js —— 【逻辑层】统一入口
 *
 * 依赖顺序说明（ESM 的 import 会提升，所以语句顺序 = 执行顺序）：
 *   registry → rng → expr-evaluator → attr-system → persona-resolver
 *            → test-engine → event-draw → ending-judge → daily → game-engine
 *
 * 其中 9 个模块从上游项目「财富模拟器」（微信小游戏版）逐字复制，一行未改；
 * daily.js 是为 uni-app 版新增的「每日财运签」，同样零平台依赖。它们：
 *   - 不引用 wx.* / uni.* / document / window
 *   - 不引用任何渲染 API
 * 所以能同时跑在 uni-app、浏览器、Node 里（tools/ 下的离线数值模拟就靠这一点）。
 *
 * ⚠️ 新增核心模块时，必须在这里补一行 import，否则打包器不会把它纳入依赖图。
 */
import './registry.js';

import './rng.js';
import './expr-evaluator.js';
import './attr-system.js';
import './persona-resolver.js';
import './test-engine.js';
import './event-draw.js';
import './ending-judge.js';
import './daily.js';
import './game-engine.js';

// 抖音小程序运行时没有 globalThis/window/self，只有 global，所以必须逐级兜底
const g =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof window !== 'undefined' && window) ||
  (typeof global !== 'undefined' && global);

const WS = g && g.WS;

export default WS;
export { WS };
