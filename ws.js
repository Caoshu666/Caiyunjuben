/**
 * ws.js —— 全局唯一入口
 *
 * 页面与组件一律 `import WS from '@/ws.js'`，不要各自零散地 import core/ 或 data/。
 * 好处：加载顺序只有这一处需要维护，改依赖关系时不会漏改。
 *
 * 加载顺序：core（逻辑层）→ data（数据层）
 * 平台适配层不在这里加载 —— 它需要 uni 运行时环境，由 composables/useGame.js 按需引入。
 */
import WS from './core/index.js';
import './data/index.js';

export default WS;
export { WS };
