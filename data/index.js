/**
 * data/index.js —— 【数据层】统一入口
 *
 * 注意：这里只引入 registry，【不】引入 core。
 * 配置表是纯数据，不依赖任何逻辑模块 —— 让依赖图如实反映这一点，
 * 以后要单独做「配置表校验工具」时可以直接只加载本文件。
 *
 * 6 张玩法表 + 1 张标定表（balance.js）从上游项目逐字复制，
 * 另外新增 1 张 fortune.js（每日财运签，uni-app 版特有）。
 * 表结构版本由 config-loader.js 的 SCHEMA_VERSION 统一管理。
 */
import '../core/registry.js';

import './tables/persona.js';
import './tables/question.js';
import './tables/question-bank-b.js';
import './tables/question-bank-c.js';
import './tables/question-bank-d.js';
import './tables/question-bank-e.js';
import './tables/question-bank-f.js';
import './tables/question-sets.js';
import './tables/stage.js';
import './tables/event.js';
import './tables/event-bank-b.js';
import './tables/event-bank-c.js';
import './tables/event-bank-d.js';
import './tables/event-bank-e.js';
import './tables/event-sets.js';
import './tables/ending.js';
import './tables/text.js';
import './tables/balance.js';
import './tables/fortune.js';

import './config-loader.js';

// 抖音小程序运行时没有 globalThis/window/self，只有 global，所以必须逐级兜底
const g =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof window !== 'undefined' && window) ||
  (typeof global !== 'undefined' && global);

const WS = g && g.WS;

export default WS;
export { WS };
