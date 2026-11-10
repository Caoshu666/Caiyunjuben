/**
 * env.js —— 运行时平台识别
 *
 * 刻意【不用】条件编译（`// #ifdef`），而是靠各平台的特征全局对象来判断。原因：
 *   1) 条件编译是构建期行为，本地 Node 里跑测试时完全失效，而这个文件需要被测试覆盖；
 *   2) 探测结果还能被 composables 层用来做「同平台不同能力」的降级决策。
 *
 * ★ 为什么要同时判断「有没有 window」：
 *   单看 `typeof wx !== 'undefined'` 是不够的 —— uni-app 的 H5 端在部分版本里
 *   会挂一个 wx 兼容对象出来。小程序运行在无 DOM 的 JS 引擎里，所以
 *   「有 wx 且没有 window」才是小程序的可判定特征。反过来，有 window 就一定是
 *   H5 或 App（WebView 内核），此时激励视频、相册这类原生能力都要按降级处理。
 */

/** 是否有 DOM（H5 与 App 的 WebView 都有；小程序的逻辑层没有） */
const HAS_DOM = typeof document !== 'undefined' && typeof window !== 'undefined';

export function platform() {
  // App（5+ runtime）同时有 plus 和 DOM，所以要先判 plus
  if (typeof plus !== 'undefined') return 'app';

  if (!HAS_DOM) {
    if (typeof wx !== 'undefined' && typeof wx.createSelectorQuery === 'function') return 'mp-weixin';
    if (typeof my !== 'undefined' && typeof my.createSelectorQuery === 'function') return 'mp-alipay';
    if (typeof swan !== 'undefined') return 'mp-baidu';
    if (typeof tt !== 'undefined') return 'mp-toutiao';
  }

  if (HAS_DOM) return 'h5';

  return 'unknown';
}

export function isMiniProgram() {
  const p = platform();
  return p === 'mp-weixin' || p === 'mp-alipay' || p === 'mp-baidu' || p === 'mp-toutiao';
}

export function isWeixin() {
  return platform() === 'mp-weixin';
}

/** 当前环境是否具备真正的激励视频能力（其余环境走「开发期模拟」） */
export function hasRewardedVideo() {
  return platform() === 'mp-weixin';
}

/**
 * 结果卡底部二维码要用的【小程序码图片路径】。
 *
 * 为什么要按平台分开：微信和抖音各有各的小程序码，扫错了打不开对方的小程序。
 * 所以两端各自在开放平台生成一张指向首页 `pages/index/index` 的码图，放进
 * `static/qrcode/` 下，这里只负责按当前平台返回对应路径。
 *
 * 返回空串表示当前端没有可用的小程序码（H5 / App / 其它小程序），
 * 调用方据此不画二维码、改画一行引导文案。
 */
export function miniProgramQrPath() {
  const p = platform();
  if (p === 'mp-weixin') return '/static/qrcode/wx.png';
  if (p === 'mp-toutiao') return '/static/qrcode/tt.png';
  return '';
}

export const HAS_WINDOW = HAS_DOM;

export default { platform, isMiniProgram, isWeixin, hasRewardedVideo, miniProgramQrPath, HAS_WINDOW };
