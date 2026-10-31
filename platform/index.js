/**
 * platform/index.js —— 平台适配层统一出口
 *
 * 说明「平台能力」与「平台适配层」的分工：
 *   - platform/index.js 只负责【装配】：把适配器、音效、环境探测打包给上层
 *   - platform/uni-adapter.js 是唯一碰 uni.* 的文件
 *   - platform/sfx.js 是唯一碰 AudioContext 的文件
 *
 * composables/useGame.js 从这里取用，页面与组件不直接 import 具体实现。
 */
import UniAdapter from './uni-adapter.js';
import Sfx from './sfx.js';
import { platform, isMiniProgram, isWeixin, hasRewardedVideo } from './env.js';

/**
 * 创建一整套平台能力
 * @param {Object} opts { adUnitId, patchUrl }
 */
function create(opts) {
  const adapter = new UniAdapter(opts);
  const sfx = new Sfx();
  return { adapter, sfx };
}

export default { create, platform, isMiniProgram, isWeixin, hasRewardedVideo, UniAdapter, Sfx };
export { create, platform, isMiniProgram, isWeixin, hasRewardedVideo, UniAdapter, Sfx };
