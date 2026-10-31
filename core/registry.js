/**
 * registry.js —— 命名空间引导（必须最先执行）
 *
 * 为什么需要这个文件：
 *   core/ 与 data/ 下的模块沿用了「IIFE + globalThis.WS 命名空间」的写法，而不是
 *   ESM 的 import/export。这样做是刻意的 —— 同一份文件要同时满足两种加载方式：
 *     1) uni-app / Vite 打包（ESM）  → 作为「仅副作用模块」被 import
 *     2) tools/ 下的 Node 脚本（CJS） → 直接 require
 *   一旦给它们加上 export 语句，第 2 种用法立刻就废了。
 *
 * ★ 所以本文件也必须保持「无 import / 无 export」的纯副作用形态。
 *   ESM 那边靠 `import './registry.js'`（裸导入）引入；
 *   CJS 那边靠 `require('./registry.js')` 引入。两边都能执行。
 *
 * 关于加载顺序：ESM 的 import 会被提升（hoist），执行顺序完全由 import 语句
 * 的先后决定。所以 index.js 把它放在第一条，保证任何模块写 NS.xxx 时 WS 已存在。
 *
 * globalThis 兜底：极少数老基础库没有 globalThis，逐级回退。
 */
(function () {
  'use strict';

  var g =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global) ||
    (typeof self !== 'undefined' && self) ||
    null;

  if (!g) throw new Error('[WS] 找不到全局对象，无法初始化命名空间');

  // 关键：先落地 globalThis 本身，后面的模块都靠它自我定位
  if (typeof globalThis === 'undefined') {
    try {
      Object.defineProperty(g, 'globalThis', {
        value: g,
        writable: true,
        configurable: true
      });
    } catch (e) {
      /* 定义不了就放弃，各模块内部还有各自的 typeof 判断 */
    }
  }

  g.WS = g.WS || {};
})();
